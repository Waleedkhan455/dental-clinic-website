"""Patient treatment-history endpoints.

History records are authored by doctors (a later phase) and are strictly
**read-only** for patients. Every query is scoped to the signed-in patient, so
one patient can never read another patient's treatment history.
"""

from fastapi import APIRouter, Depends

from app.db.repository import to_object_id
from app.dependencies import require_role
from app.models.common import UserRole
from app.models.patient_history import PatientHistoryDetail, PatientHistoryPublic
from app.models.user import UserInDB
from app.repositories import doctors_repo, history_repo

router = APIRouter(prefix="/history", tags=["history"])


async def _enrich(records: list[PatientHistoryPublic]) -> list[PatientHistoryDetail]:
    """Attach the treating doctor's display name to each record."""
    if not records:
        return []

    doctors = {doc.id: doc for doc in await doctors_repo().list()}
    enriched: list[PatientHistoryDetail] = []
    for record in records:
        doctor = doctors.get(record.doctor_id)
        enriched.append(
            PatientHistoryDetail(
                **record.model_dump(),
                doctor_name=doctor.name if doctor else None,
                doctor_designation=doctor.designation if doctor else None,
            )
        )
    return enriched


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
