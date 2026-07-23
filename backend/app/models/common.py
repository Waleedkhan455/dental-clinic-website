"""Shared model utilities: ObjectId handling, base document model, enums.

These types keep MongoDB's ``_id`` (a BSON ObjectId) mapped to a plain string
``id`` in the API layer, so responses are JSON-friendly and the frontend never
deals with BSON types.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Annotated, Any

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


def _validate_object_id(value: Any) -> Any:
    """Coerce a BSON ObjectId to a string; pass through valid strings."""
    if value is None:
        return None
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, str):
        return value
    raise ValueError("Invalid identifier")


# API-facing identifier: always serialised as a string, accepts ObjectId input.
PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


def utcnow() -> datetime:
    """Timezone-aware UTC now (stored consistently across the app)."""
    return datetime.now(timezone.utc)


class MongoModel(BaseModel):
    """Base for models read from MongoDB — maps ``_id`` to a string ``id``."""

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        str_strip_whitespace=True,
    )

    # Read from Mongo's ``_id`` but serialise as a clean ``id`` for the API.
    id: PyObjectId | None = Field(
        default=None, validation_alias="_id", serialization_alias="id"
    )


# --- Domain enumerations -----------------------------------------------------


class UserRole(str, Enum):
    DOCTOR = "doctor"
    PATIENT = "patient"


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AvailabilityType(str, Enum):
    """How a doctor can be booked.

    - ``specific_days``: bookable only on given weekdays (e.g. Fridays).
    - ``by_appointment``: requires manual confirmation from the panel.
    - ``regular_hours``: bookable during regular clinic hours.
    """

    SPECIFIC_DAYS = "specific_days"
    BY_APPOINTMENT = "by_appointment"
    REGULAR_HOURS = "regular_hours"


# Ordered list of the clinic's service categories (used for grouping/seeding).
SERVICE_CATEGORIES: list[str] = [
    "General Dentistry",
    "Restorative & Prosthodontics",
    "Orthodontics",
    "Cosmetic Dentistry",
    "Pediatric Dentistry",
]
