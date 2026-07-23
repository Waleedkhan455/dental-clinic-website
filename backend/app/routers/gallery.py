"""Gallery endpoints.

Public: all images in display order. Doctor/admin: full CRUD (add, edit,
reorder via ``sort_order``, delete).
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import require_role
from app.models.common import UserRole, utcnow
from app.models.gallery import (
    GalleryImageCreate,
    GalleryImagePublic,
    GalleryImageUpdate,
)
from app.models.user import UserInDB
from app.repositories import gallery_repo

router = APIRouter(prefix="/gallery", tags=["gallery"])


@router.get("", response_model=list[GalleryImagePublic])
async def list_gallery() -> list[GalleryImagePublic]:
    """List gallery images in display order (used by both public site and panel)."""
    return await gallery_repo().list(sort=[("sort_order", 1), ("_id", 1)])


@router.post("", response_model=GalleryImagePublic, status_code=status.HTTP_201_CREATED)
async def create_gallery_image(
    body: GalleryImageCreate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> GalleryImagePublic:
    document = body.model_dump()
    document["created_at"] = utcnow()
    new_id = await gallery_repo().insert_one(document)
    created = await gallery_repo().get(new_id)
    assert created is not None
    return created


@router.patch("/{image_id}", response_model=GalleryImagePublic)
async def update_gallery_image(
    image_id: str,
    body: GalleryImageUpdate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> GalleryImagePublic:
    repo = gallery_repo()
    if await repo.get(image_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    changes = body.model_dump(exclude_unset=True)
    changes["updated_at"] = utcnow()
    await repo.update_by_id(image_id, changes)
    updated = await repo.get(image_id)
    assert updated is not None
    return updated


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_image(
    image_id: str,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> None:
    if not await gallery_repo().delete_by_id(image_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
