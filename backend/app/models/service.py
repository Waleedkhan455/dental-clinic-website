"""Service schemas.

Each service has a URL ``slug`` for its detail page, a category for grouping,
a description, and a free-text ``visits_text`` (e.g. "1–3, depending on case").
"""

from pydantic import BaseModel, Field

from app.models.common import MongoModel


class ServiceBase(BaseModel):
    name: str
    slug: str
    category: str
    description: str
    visits_text: str
    image_url: str | None = None
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceAdminCreate(BaseModel):
    """Admin create payload — the URL slug is generated server-side from the name."""

    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    description: str = Field(min_length=1, max_length=4000)
    visits_text: str = Field(min_length=1, max_length=120)
    image_url: str | None = Field(default=None, max_length=2000)
    is_active: bool = True


class ServiceUpdate(BaseModel):
    """Admin update payload — every field optional (partial update)."""

    name: str | None = Field(default=None, min_length=1, max_length=120)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, min_length=1, max_length=4000)
    visits_text: str | None = Field(default=None, min_length=1, max_length=120)
    image_url: str | None = Field(default=None, max_length=2000)
    is_active: bool | None = None


class ServicePublic(MongoModel, ServiceBase):
    pass
