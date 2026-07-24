"""Appointment endpoints.

Booking is restricted to authenticated patients. Every booking is validated
(doctor/service exist, not in the past, doctor availability, no slot clash) and
saved with ``pending`` status — it becomes ``confirmed`` only when a doctor
approves it from the panel.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.db.repository import to_object_id
from app.dependencies import require_role
from app.models.appointment import (
    AppointmentAdminUpdate,
    AppointmentDetail,
    AppointmentPublic,
    BookingRequest,
)
from app.models.common import AppointmentStatus, UserRole, utcnow
from app.models.user import UserInDB
from app.repositories import appointments_repo, doctors_repo, services_repo, users_repo
from app.services.booking import (
    CLINIC_TZ,
    BookingError,
    to_utc,
    validate_availability,
    validate_not_in_past,
)
from app.services.email import (
    send_appointment_cancellation,
    send_appointment_confirmation,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])

# Statuses that still occupy a slot and can therefore be cancelled by a patient.
_CANCELLABLE = {AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value}


async def _enrich(appointments: list[AppointmentPublic]) -> list[AppointmentDetail]:
    """Attach doctor and service display names to a list of appointments.

    Doctors and services are small collections, so they're loaded once and
    joined in memory rather than issuing a lookup per appointment.
    """
    if not appointments:
        return []

    doctors = {doc.id: doc for doc in await doctors_repo().list()}
    services = {svc.id: svc for svc in await services_repo().list()}

    enriched: list[AppointmentDetail] = []
    for appt in appointments:
        doctor = doctors.get(appt.doctor_id)
        service = services.get(appt.service_id) if appt.service_id else None
        enriched.append(
            AppointmentDetail(
                **appt.model_dump(),
                doctor_name=doctor.name if doctor else None,
                doctor_designation=doctor.designation if doctor else None,
                service_name=service.name if service else None,
            )
        )
    return enriched


@router.get("/mine", response_model=list[AppointmentDetail])
async def my_appointments(
    current_user: UserInDB = Depends(require_role(UserRole.PATIENT)),
) -> list[AppointmentDetail]:
    """Every appointment belonging to the signed-in patient, soonest first.

    Scoped to ``patient_id`` from the token, so a patient can only ever see
    their own appointments — never another patient's.
    """
    appointments = await appointments_repo().list(
        {"patient_id": to_object_id(current_user.id)},
        sort=[("scheduled_at", 1)],
    )
    return await _enrich(appointments)


@router.patch("/{appointment_id}/cancel", response_model=AppointmentDetail)
async def cancel_my_appointment(
    appointment_id: str,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(require_role(UserRole.PATIENT)),
) -> AppointmentDetail:
    """Cancel one of the patient's own pending/confirmed appointments."""
    repo = appointments_repo()
    appointment = await repo.get(appointment_id)

    # 404 (not 403) when the appointment isn't the caller's, so ownership of
    # other patients' appointments can't be probed by id.
    if appointment is None or appointment.patient_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )

    if appointment.status.value not in _CANCELLABLE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This appointment can no longer be cancelled.",
        )

    await repo.update_by_id(
        appointment_id,
        {"status": AppointmentStatus.CANCELLED.value, "updated_at": utcnow()},
    )
    updated = await repo.get(appointment_id)
    assert updated is not None  # just updated
    detail = (await _enrich([updated]))[0]

    # Email the patient a cancellation confirmation (to their account email).
    if current_user.email:
        background_tasks.add_task(
            send_appointment_cancellation,
            to_email=current_user.email,
            patient_name=appointment.patient_name or current_user.name,
            doctor_name=detail.doctor_name,
            service_name=detail.service_name,
            scheduled_at=updated.scheduled_at,
        )

    return detail


@router.post("", response_model=AppointmentPublic, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    body: BookingRequest,
    current_user: UserInDB = Depends(require_role(UserRole.PATIENT)),
) -> AppointmentPublic:
    # The doctor must exist and be active.
    doctor = await doctors_repo().get(body.doctor_id)
    if doctor is None or not doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Selected doctor is not available"
        )

    # If a service was chosen, it must exist and be active.
    if body.service_id is not None:
        service = await services_repo().get(body.service_id)
        if service is None or not service.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Selected service is not available"
            )

    # Apply booking rules (future date, doctor availability).
    try:
        validate_not_in_past(body.scheduled_at)
        validate_availability(doctor.availability, body.scheduled_at)
    except BookingError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    scheduled_utc = to_utc(body.scheduled_at)
    repo = appointments_repo()

    # Prevent double-booking the same doctor + slot (ignoring cancelled ones).
    clash = await repo.find_one(
        {
            "doctor_id": to_object_id(body.doctor_id),
            "scheduled_at": scheduled_utc,
            "status": {"$in": [AppointmentStatus.PENDING.value, AppointmentStatus.CONFIRMED.value]},
        }
    )
    if clash is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That time slot is already booked with this doctor. Please choose another time.",
        )

    now = utcnow()
    document = {
        "patient_id": to_object_id(current_user.id),
        "patient_name": body.patient_name,
        "patient_phone": body.patient_phone,
        "doctor_id": to_object_id(body.doctor_id),
        "service_id": to_object_id(body.service_id) if body.service_id else None,
        "scheduled_at": scheduled_utc,
        "notes": body.notes,
        "status": AppointmentStatus.PENDING.value,
        "created_at": now,
        "updated_at": now,
    }
    new_id = await repo.insert_one(document)
    created = await repo.get(new_id)
    assert created is not None  # just inserted
    return created


# --- Doctor / admin endpoints -----------------------------------------------


def _day_range_utc(day: str) -> tuple[datetime, datetime]:
    """UTC [start, end) covering one clinic-local calendar day (YYYY-MM-DD)."""
    start_local = datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=CLINIC_TZ)
    start_utc = start_local.astimezone(timezone.utc)
    return start_utc, start_utc + timedelta(days=1)


@router.get("", response_model=list[AppointmentDetail])
async def list_appointments(
    doctor_id: str | None = None,
    status_filter: AppointmentStatus | None = None,
    day: str | None = None,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> list[AppointmentDetail]:
    """All appointments (doctor/admin), optionally filtered by doctor, status, day."""
    query: dict = {}
    if doctor_id:
        oid = to_object_id(doctor_id)
        if oid is not None:
            query["doctor_id"] = oid
    if status_filter is not None:
        query["status"] = status_filter.value
    if day:
        try:
            start, end = _day_range_utc(day)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid day; expected YYYY-MM-DD.",
            ) from exc
        query["scheduled_at"] = {"$gte": start, "$lt": end}

    appointments = await appointments_repo().list(query, sort=[("scheduled_at", 1)])
    return await _enrich(appointments)


@router.get("/stats")
async def appointment_stats(
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> dict[str, int]:
    """Headline counts for the doctor dashboard."""
    repo = appointments_repo()
    now = utcnow()
    today_start, today_end = _day_range_utc(now.astimezone(CLINIC_TZ).strftime("%Y-%m-%d"))
    return {
        "today": await repo.count(
            {
                "scheduled_at": {"$gte": today_start, "$lt": today_end},
                "status": {"$ne": AppointmentStatus.CANCELLED.value},
            }
        ),
        "pending": await repo.count({"status": AppointmentStatus.PENDING.value}),
        "upcoming_confirmed": await repo.count(
            {"status": AppointmentStatus.CONFIRMED.value, "scheduled_at": {"$gte": now}}
        ),
        "total": await repo.count({}),
    }


@router.patch("/{appointment_id}", response_model=AppointmentDetail)
async def update_appointment(
    appointment_id: str,
    body: AppointmentAdminUpdate,
    background_tasks: BackgroundTasks,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> AppointmentDetail:
    """Confirm/complete/cancel or reschedule an appointment (doctor/admin).

    When the status becomes ``confirmed`` (and wasn't already), the patient is
    emailed a confirmation. The email is sent as a background task, so a slow or
    failing mail server never delays or fails the doctor's action.
    """
    repo = appointments_repo()
    appointment = await repo.get(appointment_id)
    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )

    previous_status = appointment.status

    changes: dict = {"updated_at": utcnow()}
    if body.status is not None:
        changes["status"] = body.status.value
    if body.notes is not None:
        changes["notes"] = body.notes

    if body.scheduled_at is not None:
        # Rescheduling re-applies the booking rules and re-checks the slot.
        doctor = await doctors_repo().get(appointment.doctor_id)
        if doctor is not None:
            try:
                validate_not_in_past(body.scheduled_at)
                validate_availability(doctor.availability, body.scheduled_at)
            except BookingError as exc:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
                ) from exc
        scheduled_utc = to_utc(body.scheduled_at)
        clash = await repo.find_one(
            {
                "_id": {"$ne": to_object_id(appointment_id)},
                "doctor_id": to_object_id(appointment.doctor_id),
                "scheduled_at": scheduled_utc,
                "status": {
                    "$in": [
                        AppointmentStatus.PENDING.value,
                        AppointmentStatus.CONFIRMED.value,
                    ]
                },
            }
        )
        if clash is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="That time slot is already booked with this doctor.",
            )
        changes["scheduled_at"] = scheduled_utc

    await repo.update_by_id(appointment_id, changes)
    updated = await repo.get(appointment_id)
    assert updated is not None
    detail = (await _enrich([updated]))[0]

    # Notify the patient by email when the appointment transitions to a new
    # status: confirmed → confirmation email, cancelled → cancellation email.
    notifier = None
    if body.status == AppointmentStatus.CONFIRMED and previous_status != AppointmentStatus.CONFIRMED:
        notifier = send_appointment_confirmation
    elif body.status == AppointmentStatus.CANCELLED and previous_status != AppointmentStatus.CANCELLED:
        notifier = send_appointment_cancellation

    if notifier is not None:
        patient = (
            await users_repo().get(appointment.patient_id) if appointment.patient_id else None
        )
        if patient is not None and patient.email:
            background_tasks.add_task(
                notifier,
                to_email=patient.email,
                patient_name=appointment.patient_name or patient.name,
                doctor_name=detail.doctor_name,
                service_name=detail.service_name,
                scheduled_at=updated.scheduled_at,
            )

    return detail
