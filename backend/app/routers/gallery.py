"""Public gallery endpoint for clinic photos."""

from fastapi import APIRouter

from app.models.gallery import GalleryImagePublic
from app.repositories import gallery_repo

router = APIRouter(prefix="/gallery", tags=["gallery"])


@router.get("", response_model=list[GalleryImagePublic])
async def list_gallery() -> list[GalleryImagePublic]:
    """List gallery images in display order."""
    return await gallery_repo().list(sort=[("sort_order", 1)])
