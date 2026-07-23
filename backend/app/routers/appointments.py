"""Appointment endpoints.

Booking is restricted to authenticated patients. Every booking is validated
(doctor/service exist, not in the past, doctor availability, no slot clash) and
saved with ``pending`` status — it becomes ``confirmed`` only when a doctor
approves it from the panel.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.db.repository import to_object_id
from app.dependencies import require_role
from app.models.appointment import AppointmentPublic, BookingRequest
from app.models.common import AppointmentStatus, UserRole, utcnow
from app.models.user import UserInDB
from app.repositories import appointments_repo, doctors_repo, services_repo
from app.services.booking import (
    BookingError,
    to_utc,
    validate_availability,
    validate_not_in_past,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])


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
