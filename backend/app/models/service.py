"""Service schemas.

Each service has a URL ``slug`` for its detail page, a category for grouping,
a description, and a free-text ``visits_text`` (e.g. "1–3, depending on case").
"""

from pydantic import BaseModel

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


class ServicePublic(MongoModel, ServiceBase):
    pass
