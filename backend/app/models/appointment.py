"""Appointment schemas.

A booking is created with ``pending`` status and becomes ``confirmed`` only
after a doctor approves it. ``patient_id`` is set when a logged-in patient
books; ``patient_name``/``patient_phone`` capture contact details on the form.
"""

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.common import AppointmentStatus, MongoModel, PyObjectId


class AppointmentBase(BaseModel):
    patient_name: str
    patient_phone: str
    doctor_id: PyObjectId
    service_id: PyObjectId | None = None
    scheduled_at: datetime
    notes: str | None = None


class AppointmentCreate(AppointmentBase):
    pass


class BookingRequest(BaseModel):
    """Payload a logged-in patient submits to book an appointment.

    ``patient_id`` is taken from the authenticated user, and ``status`` is set
    to ``pending`` server-side — neither can be supplied by the client.
    """

    patient_name: str = Field(min_length=1, max_length=120)
    patient_phone: str = Field(min_length=3, max_length=40)
    doctor_id: PyObjectId
    service_id: PyObjectId | None = None
    scheduled_at: datetime
    notes: str | None = Field(default=None, max_length=1000)


class AppointmentPublic(MongoModel, AppointmentBase):
    patient_id: PyObjectId | None = None
    status: AppointmentStatus = AppointmentStatus.PENDING
    created_at: datetime | None = None
    updated_at: datetime | None = None


class AppointmentDetail(AppointmentPublic):
    """An appointment enriched with the doctor and service display names.

    Used by the patient and doctor panels so the client doesn't have to join
    ``doctor_id``/``service_id`` against separate lookups.
    """

    doctor_name: str | None = None
    doctor_designation: str | None = None
    service_name: str | None = None
