"""Public service endpoints for the Services listing and detail pages."""

from fastapi import APIRouter, HTTPException, status

from app.models.service import ServicePublic
from app.repositories import services_repo

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServicePublic])
async def list_services(category: str | None = None) -> list[ServicePublic]:
    """List active services, optionally filtered by category.

    Ordered by category then name so the frontend can group them directly.
    """
    query: dict = {"is_active": True}
    if category:
        query["category"] = category
    return await services_repo().list(filter=query, sort=[("category", 1), ("name", 1)])


@router.get("/{slug}", response_model=ServicePublic)
async def get_service(slug: str) -> ServicePublic:
    """Return a single active service by its URL slug (detail page)."""
    service = await services_repo().find_one({"slug": slug, "is_active": True})
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service
