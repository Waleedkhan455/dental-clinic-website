"""Business rules for appointment booking.

Time handling: the clinic is in Mansehra, Pakistan (UTC+5). Patients pick a
clinic-local time. Weekday/availability and past-date checks run against that
local time, while storage and slot-clash comparisons use UTC for consistency.
"""

from datetime import datetime, timedelta, timezone

from app.models.common import AvailabilityType
from app.models.doctor import Availability

CLINIC_TZ = timezone(timedelta(hours=5))  # Pakistan Standard Time (UTC+5)

_WEEKDAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


class BookingError(Exception):
    """Raised when a booking violates a rule. The message is user-facing."""


def to_clinic_local(value: datetime) -> datetime:
    """Interpret a naive datetime as clinic-local; convert an aware one to it."""
    if value.tzinfo is None:
        return value.replace(tzinfo=CLINIC_TZ)
    return value.astimezone(CLINIC_TZ)


def to_utc(value: datetime) -> datetime:
    """Normalise to UTC for storage and slot comparison."""
    return to_clinic_local(value).astimezone(timezone.utc)


def validate_not_in_past(scheduled_at: datetime) -> None:
    if to_clinic_local(scheduled_at) < datetime.now(CLINIC_TZ):
        raise BookingError("Please choose a future date and time.")


def validate_availability(availability: Availability, scheduled_at: datetime) -> None:
    """Enforce a doctor's availability rule for the requested time.

    - specific_days: the weekday must be one the doctor works (e.g. Fridays).
    - by_appointment / regular_hours: any day may be requested; the booking
      stays ``pending`` until the clinic confirms it.
    """
    if availability.type != AvailabilityType.SPECIFIC_DAYS:
        return

    weekday = to_clinic_local(scheduled_at).weekday()
    if weekday not in availability.weekdays:
        allowed = ", ".join(_WEEKDAY_NAMES[day] for day in availability.weekdays)
        allowed = allowed or "the doctor's available days"
        raise BookingError(
            f"This doctor is available on {allowed} only. Please choose one of those days."
        )
