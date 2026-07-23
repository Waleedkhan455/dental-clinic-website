"""Gallery image schemas. ``sort_order`` controls display order (ascending)."""

from pydantic import BaseModel, Field

from app.models.common import MongoModel


class GalleryImageBase(BaseModel):
    image_url: str
    caption: str | None = None
    sort_order: int = 0


class GalleryImageCreate(BaseModel):
    image_url: str = Field(min_length=1, max_length=2000)
    caption: str | None = Field(default=None, max_length=300)
    sort_order: int = 0


class GalleryImageUpdate(BaseModel):
    """Admin update payload — every field optional."""

    image_url: str | None = Field(default=None, min_length=1, max_length=2000)
    caption: str | None = Field(default=None, max_length=300)
    sort_order: int | None = None


class GalleryImagePublic(MongoModel, GalleryImageBase):
    pass
