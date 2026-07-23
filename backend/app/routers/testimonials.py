"""Testimonial endpoints.

Public: only *published* testimonials. Doctor/admin: full CRUD incl. toggling
the published flag.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import require_role
from app.models.common import UserRole, utcnow
from app.models.testimonial import (
    TestimonialCreate,
    TestimonialPublic,
    TestimonialUpdate,
)
from app.models.user import UserInDB
from app.repositories import testimonials_repo

router = APIRouter(prefix="/testimonials", tags=["testimonials"])


@router.get("", response_model=list[TestimonialPublic])
async def list_testimonials() -> list[TestimonialPublic]:
    """List published testimonials, newest first."""
    return await testimonials_repo().list(filter={"is_published": True}, sort=[("_id", -1)])


@router.get("/manage", response_model=list[TestimonialPublic])
async def list_testimonials_admin(
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> list[TestimonialPublic]:
    """List ALL testimonials incl. unpublished (doctor/admin)."""
    return await testimonials_repo().list(sort=[("_id", -1)])


@router.post("", response_model=TestimonialPublic, status_code=status.HTTP_201_CREATED)
async def create_testimonial(
    body: TestimonialCreate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> TestimonialPublic:
    document = body.model_dump()
    document["created_at"] = utcnow()
    new_id = await testimonials_repo().insert_one(document)
    created = await testimonials_repo().get(new_id)
    assert created is not None
    return created


@router.patch("/{testimonial_id}", response_model=TestimonialPublic)
async def update_testimonial(
    testimonial_id: str,
    body: TestimonialUpdate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> TestimonialPublic:
    repo = testimonials_repo()
    if await repo.get(testimonial_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")
    changes = body.model_dump(exclude_unset=True)
    changes["updated_at"] = utcnow()
    await repo.update_by_id(testimonial_id, changes)
    updated = await repo.get(testimonial_id)
    assert updated is not None
    return updated


@router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testimonial(
    testimonial_id: str,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> None:
    if not await testimonials_repo().delete_by_id(testimonial_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")
