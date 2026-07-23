"""Public testimonial endpoint. Only published testimonials are returned."""

from fastapi import APIRouter

from app.models.testimonial import TestimonialPublic
from app.repositories import testimonials_repo

router = APIRouter(prefix="/testimonials", tags=["testimonials"])


@router.get("", response_model=list[TestimonialPublic])
async def list_testimonials() -> list[TestimonialPublic]:
    """List published testimonials, newest first."""
    return await testimonials_repo().list(
        filter={"is_published": True}, sort=[("_id", -1)]
    )
