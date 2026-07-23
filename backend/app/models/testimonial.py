"""Testimonial schemas. Only published testimonials are shown publicly."""

from pydantic import BaseModel, Field

from app.models.common import MongoModel


class TestimonialBase(BaseModel):
    patient_name: str
    message: str
    rating: int = Field(ge=1, le=5)
    is_published: bool = True


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    """Admin update payload — every field optional."""

    patient_name: str | None = Field(default=None, min_length=1, max_length=120)
    message: str | None = Field(default=None, min_length=1, max_length=2000)
    rating: int | None = Field(default=None, ge=1, le=5)
    is_published: bool | None = None


class TestimonialPublic(MongoModel, TestimonialBase):
    pass
