"""Public doctor endpoints for the "Meet Our Dentists" section."""

from fastapi import APIRouter, HTTPException, status

from app.models.doctor import DoctorPublic
from app.repositories import doctors_repo

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("", response_model=list[DoctorPublic])
async def list_doctors() -> list[DoctorPublic]:
    """List active doctors, ordered by name."""
    return await doctors_repo().list(filter={"is_active": True}, sort=[("name", 1)])


@router.get("/{doctor_id}", response_model=DoctorPublic)
async def get_doctor(doctor_id: str) -> DoctorPublic:
    """Return a single doctor by id."""
    doctor = await doctors_repo().get(doctor_id)
    if doctor is None or not doctor.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return doctor
