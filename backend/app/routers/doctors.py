"""Doctor (team) endpoints.

Public: list active doctors and fetch one (Meet Our Dentists).
Doctor/admin: full CRUD on team members. Changes reflect live on the public
site (which reads with ``no-store``).
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import require_role
from app.models.common import UserRole, utcnow
from app.models.doctor import DoctorCreate, DoctorPublic, DoctorUpdate
from app.models.user import UserInDB
from app.repositories import doctors_repo

router = APIRouter(prefix="/doctors", tags=["doctors"])


# --- Public -----------------------------------------------------------------


@router.get("", response_model=list[DoctorPublic])
async def list_doctors() -> list[DoctorPublic]:
    """List active doctors, ordered by name."""
    return await doctors_repo().list(filter={"is_active": True}, sort=[("name", 1)])


# --- Doctor / admin (before /{doctor_id} so "manage" isn't read as an id) -----


@router.get("/manage", response_model=list[DoctorPublic])
async def list_doctors_admin(
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> list[DoctorPublic]:
    """List ALL team members incl. inactive (doctor/admin)."""
    return await doctors_repo().list(sort=[("name", 1)])


@router.post("", response_model=DoctorPublic, status_code=status.HTTP_201_CREATED)
async def create_doctor(
    body: DoctorCreate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> DoctorPublic:
    now = utcnow()
    document = body.model_dump()
    document["user_id"] = None  # panel-created profiles aren't linked to a login
    document["created_at"] = now
    document["updated_at"] = now
    new_id = await doctors_repo().insert_one(document)
    created = await doctors_repo().get(new_id)
    assert created is not None
    return created


@router.patch("/{doctor_id}", response_model=DoctorPublic)
async def update_doctor(
    doctor_id: str,
    body: DoctorUpdate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> DoctorPublic:
    repo = doctors_repo()
    if await repo.get(doctor_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    changes = body.model_dump(exclude_unset=True)
    changes["updated_at"] = utcnow()
    await repo.update_by_id(doctor_id, changes)
    updated = await repo.get(doctor_id)
    assert updated is not None
    return updated


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(
    doctor_id: str,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> None:
    if not await doctors_repo().delete_by_id(doctor_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")


@router.get("/{doctor_id}", response_model=DoctorPublic)
async def get_doctor(doctor_id: str) -> DoctorPublic:
    """Return a single active doctor by id."""
    doctor = await doctors_repo().get(doctor_id)
    if doctor is None or not doctor.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doctor
