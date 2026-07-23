"""Repository factories bound to each collection and its read model.

Routers call these to read data instead of touching Motor collections directly.
Each factory resolves the active database at call time.
"""

from app.db import collections as c
from app.db.mongodb import get_database
from app.db.repository import Repository
from app.models.doctor import DoctorPublic
from app.models.gallery import GalleryImagePublic
from app.models.service import ServicePublic
from app.models.testimonial import TestimonialPublic


def doctors_repo() -> Repository[DoctorPublic]:
    return Repository(get_database()[c.DOCTORS], DoctorPublic)


def services_repo() -> Repository[ServicePublic]:
    return Repository(get_database()[c.SERVICES], ServicePublic)


def testimonials_repo() -> Repository[TestimonialPublic]:
    return Repository(get_database()[c.TESTIMONIALS], TestimonialPublic)


def gallery_repo() -> Repository[GalleryImagePublic]:
    return Repository(get_database()[c.GALLERY], GalleryImagePublic)
