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


class TestimonialPublic(MongoModel, TestimonialBase):
    pass
