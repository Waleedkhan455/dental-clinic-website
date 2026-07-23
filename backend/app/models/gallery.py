"""Gallery image schemas. ``sort_order`` controls display order (ascending)."""

from pydantic import BaseModel

from app.models.common import MongoModel


class GalleryImageBase(BaseModel):
    image_url: str
    caption: str | None = None
    sort_order: int = 0


class GalleryImageCreate(GalleryImageBase):
    pass


class GalleryImagePublic(MongoModel, GalleryImageBase):
    pass
