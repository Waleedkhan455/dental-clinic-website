"""Service endpoints.

Public: list active services and fetch one by slug (Services pages).
Doctor/admin: full CRUD. Changes reflect immediately on the public site, which
reads with ``no-store``.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.slug import slugify
from app.dependencies import require_role
from app.models.common import UserRole, utcnow
from app.models.service import (
    ServiceAdminCreate,
    ServicePublic,
    ServiceUpdate,
)
from app.models.user import UserInDB
from app.repositories import services_repo

router = APIRouter(prefix="/services", tags=["services"])


async def _unique_slug(name: str, exclude_id: str | None = None) -> str:
    """A slug derived from ``name``, suffixed (-2, -3, …) if already taken."""
    repo = services_repo()
    base = slugify(name)
    candidate = base
    n = 1
    while True:
        existing = await repo.find_one({"slug": candidate})
        if existing is None or existing.id == exclude_id:
            return candidate
        n += 1
        candidate = f"{base}-{n}"


# --- Public -----------------------------------------------------------------


@router.get("", response_model=list[ServicePublic])
async def list_services(category: str | None = None) -> list[ServicePublic]:
    """List active services, optionally filtered by category (grouped order)."""
    query: dict = {"is_active": True}
    if category:
        query["category"] = category
    return await services_repo().list(filter=query, sort=[("category", 1), ("name", 1)])


# --- Doctor / admin (declared before /{slug} so "manage" isn't read as a slug) ---


@router.get("/manage", response_model=list[ServicePublic])
async def list_services_admin(
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> list[ServicePublic]:
    """List ALL services incl. inactive (doctor/admin)."""
    return await services_repo().list(sort=[("category", 1), ("name", 1)])


@router.post("", response_model=ServicePublic, status_code=status.HTTP_201_CREATED)
async def create_service(
    body: ServiceAdminCreate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> ServicePublic:
    now = utcnow()
    document = {
        "name": body.name,
        "slug": await _unique_slug(body.name),
        "category": body.category,
        "description": body.description,
        "visits_text": body.visits_text,
        "image_url": body.image_url,
        "is_active": body.is_active,
        "created_at": now,
        "updated_at": now,
    }
    new_id = await services_repo().insert_one(document)
    created = await services_repo().get(new_id)
    assert created is not None
    return created


@router.patch("/{service_id}", response_model=ServicePublic)
async def update_service(
    service_id: str,
    body: ServiceUpdate,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> ServicePublic:
    repo = services_repo()
    if await repo.get(service_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    changes = body.model_dump(exclude_unset=True)
    # Renaming regenerates the slug (kept unique), so the public URL follows.
    if "name" in changes:
        changes["slug"] = await _unique_slug(changes["name"], exclude_id=service_id)
    changes["updated_at"] = utcnow()

    await repo.update_by_id(service_id, changes)
    updated = await repo.get(service_id)
    assert updated is not None
    return updated


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: str,
    _: UserInDB = Depends(require_role(UserRole.DOCTOR)),
) -> None:
    if not await services_repo().delete_by_id(service_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")


@router.get("/{slug}", response_model=ServicePublic)
async def get_service(slug: str) -> ServicePublic:
    """Return a single active service by its URL slug (detail page)."""
    service = await services_repo().find_one({"slug": slug, "is_active": True})
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service
