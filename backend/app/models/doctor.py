"""Doctor schemas.

A Doctor is the public-facing clinician profile shown in "Meet Our Dentists".
``user_id`` optionally links the profile to a login account (created in the
auth phase); the display fields live on the Doctor document so the public
directory works independently of authentication.
"""

from pydantic import BaseModel, Field

from app.models.common import AvailabilityType, MongoModel, PyObjectId


class Availability(BaseModel):
    """Structured availability — drives both display and booking enforcement."""

    type: AvailabilityType
    # Weekdays as Python weekday() integers (Mon=0 … Sun=6); used when
    # type == specific_days (e.g. Dr. Safa Nawaz → [4] for Friday).
    weekdays: list[int] = Field(default_factory=list)
    # Human-readable text shown on the site, e.g. "Fridays only".
    label: str


class DoctorBase(BaseModel):
    name: str
    designation: str
    qualifications: list[str] = Field(default_factory=list)
    bio: str | None = None
    photo_url: str | None = None
    availability: Availability
    is_active: bool = True


class DoctorCreate(DoctorBase):
    # Linked to a login account in the auth phase; optional at creation time.
    user_id: PyObjectId | None = None


class DoctorPublic(MongoModel, DoctorBase):
    """Doctor as returned by the public API (no internal user linkage)."""
