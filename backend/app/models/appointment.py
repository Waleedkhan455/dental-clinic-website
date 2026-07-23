"""Appointment schemas.

A booking is created with ``pending`` status and becomes ``confirmed`` only
after a doctor approves it. ``patient_id`` is set when a logged-in patient
books; ``patient_name``/``patient_phone`` capture contact details on the form.
"""

from datetime import datetime

from pydantic import BaseModel

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


class AppointmentPublic(MongoModel, AppointmentBase):
    patient_id: PyObjectId | None = None
    status: AppointmentStatus = AppointmentStatus.PENDING
    created_at: datetime | None = None
    updated_at: datetime | None = None
