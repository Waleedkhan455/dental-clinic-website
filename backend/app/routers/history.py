"""Patient treatment-history endpoints.

Patients read their **own** history (read-only). Doctors/admins have full CRUD
over every patient's history. Every patient-facing query is scoped to the
signed-in patient, so one patient can never read another's records.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.db.repository import to_object_id
from app.dependencies import require_role
from app.models.common import UserRole, utcnow
from app.models.patient_history import (
    PatientHistoryAdminDetail,
    PatientHistoryCreate,
    PatientHistoryDetail,
    PatientHistoryPublic,
    PatientHistoryUpdate,
)
from app.models.user import UserInDB
from app.repositories import doctors_repo, history_repo, users_repo

router = APIRouter(prefix="/history", tags=["history"])


async def _enrich(records: list[PatientHistoryPublic]) -> list[PatientHistoryDetail]:
    """Attach the treating doctor's display name to each record."""
    if not records:
        return []
    doctors = {doc.id: doc for doc in await doctors_repo().list()}
    out: list[PatientHistoryDetail] = []
    for record in records:
        doctor = doctors.get(record.doctor_id)
        out.append(
            PatientHistoryDetail(
                **record.model_dump(),
                doctor_name=doctor.name if doctor else None,
                doctor_designation=doctor.designation if doctor else None,
            )
        )
    return out


async def _enrich_admin(records: list[PatientHistoryPublic]) -> list[PatientHistoryAdminDetail]:
    """Attach doctor and patient display info for the doctor panel."""
    if not records:
        return []
    doctors = {doc.id: doc for doc in await doctors_repo().list()}
    patients = {u.id: u for u in await users_repo().list({"role": UserRole.PATIENT.value})}
    out: list[PatientHistoryAdminDetail] = []
    for record in records:
        doctor = doctors.get(record.doctor_id)
        patient = patients.get(record.patient_id)
        out.append(
            PatientHistoryAdminDetail(
                **record.model_dump(),
                doctor_name=doctor.name if doctor else None,
                doctor_designation=doctor.designation if doctor else None,
                patient_name=patient.name if patient else None,
                patient_phone=patient.phone if patient else None,
            )
        )
    return out


# --- Patient (read-only, own records) ---------------------------------------


@router.get("/mine", response_model=list[PatientHistoryDetail])
async def my_history(
    current_user: UserInDB = Depends(require_role(UserRole.PATIENT)),
) -> list[PatientHistoryDetail]:
    """The signed-in patient's own treatment history, most recent first."""
    records = await history_repo().list(
        {"patient_id": to_object_id(current_user.id)},
        sort=[("created_at", -1)],
    )
    return await _enrich(records)


# --- Doctor / admin (full CRUD) ---------------------------------------------


@router.get("", response_model=list[PatientHistoryAdminDetail])
async def list_history(
    patient_id: str | None = None,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> list[PatientHistoryAdminDetail]:
    """All treatment records (optionally for one patient), most recent first."""
    query: dict = {}
    if patient_id:
        oid = to_object_id(patient_id)
        if oid is not None:
            query["patient_id"] = oid
    records = await history_repo().list(query, sort=[("created_at", -1)])
    return await _enrich_admin(records)


@router.post("", response_model=PatientHistoryAdminDetail, status_code=status.HTTP_201_CREATED)
async def create_history(
    body: PatientHistoryCreate,
    current_user: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> PatientHistoryAdminDetail:
    """Create a treatment record for a patient (doctor/admin)."""
    patient = await users_repo().get(body.patient_id)
    if patient is None or patient.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )
    if await doctors_repo().get(body.doctor_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found"
        )

    now = utcnow()
    document = {
        "patient_id": to_object_id(body.patient_id),
        "doctor_id": to_object_id(body.doctor_id),
        "appointment_id": to_object_id(body.appointment_id) if body.appointment_id else None,
        "treatment": body.treatment,
        "notes": body.notes,
        "attachments": body.attachments,
        "created_at": now,
        "updated_at": now,
    }
    new_id = await history_repo().insert_one(document)
    created = await history_repo().get(new_id)
    assert created is not None
    return (await _enrich_admin([created]))[0]


@router.get("/{history_id}", response_model=PatientHistoryAdminDetail)
async def get_history(
    history_id: str,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> PatientHistoryAdminDetail:
    record = await history_repo().get(history_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return (await _enrich_admin([record]))[0]


@router.patch("/{history_id}", response_model=PatientHistoryAdminDetail)
async def update_history(
    history_id: str,
    body: PatientHistoryUpdate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> PatientHistoryAdminDetail:
    repo = history_repo()
    if await repo.get(history_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    changes: dict = {"updated_at": utcnow()}
    if body.doctor_id is not None:
        if await doctors_repo().get(body.doctor_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
        changes["doctor_id"] = to_object_id(body.doctor_id)
    if body.appointment_id is not None:
        changes["appointment_id"] = to_object_id(body.appointment_id)
    if body.treatment is not None:
        changes["treatment"] = body.treatment
    if body.notes is not None:
        changes["notes"] = body.notes
    if body.attachments is not None:
        changes["attachments"] = body.attachments

    await repo.update_by_id(history_id, changes)
    updated = await repo.get(history_id)
    assert updated is not None
    return (await _enrich_admin([updated]))[0]


@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    history_id: str,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> None:
    if not await history_repo().delete_by_id(history_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
