"""Patient directory for the doctor panel (selecting a patient for a record)."""

from fastapi import APIRouter, Depends

from app.dependencies import require_role
from app.models.common import UserRole
from app.models.user import UserInDB, UserPublic
from app.repositories import users_repo

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=list[UserPublic])
async def list_patients(
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> list[UserInDB]:
    """List patient accounts (doctor/admin only). Password hashes never leave here."""
    return await users_repo().list({"role": UserRole.PATIENT.value}, sort=[("name", 1)])
