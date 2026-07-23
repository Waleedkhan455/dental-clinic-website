"""Patient treatment-history schemas.

History is created and managed by doctors and is strictly read-only for
patients. Each record links a patient, a doctor, and optionally the
appointment it relates to.
"""

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.common import MongoModel, PyObjectId


class PatientHistoryBase(BaseModel):
    patient_id: PyObjectId
    doctor_id: PyObjectId
    appointment_id: PyObjectId | None = None
    treatment: str
    notes: str | None = None
    attachments: list[str] = Field(default_factory=list)


class PatientHistoryCreate(BaseModel):
    """Admin create payload for a treatment record."""

    patient_id: PyObjectId
    doctor_id: PyObjectId
    appointment_id: PyObjectId | None = None
    treatment: str = Field(min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=4000)
    attachments: list[str] = Field(default_factory=list)


class PatientHistoryUpdate(BaseModel):
    """Admin update payload — every field optional (partial update)."""

    doctor_id: PyObjectId | None = None
    appointment_id: PyObjectId | None = None
    treatment: str | None = Field(default=None, min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=4000)
    attachments: list[str] | None = None


class PatientHistoryPublic(MongoModel, PatientHistoryBase):
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PatientHistoryDetail(PatientHistoryPublic):
    """A treatment record enriched with the treating doctor's display name."""

    doctor_name: str | None = None
    doctor_designation: str | None = None


class PatientHistoryAdminDetail(PatientHistoryDetail):
    """Doctor-panel view — also carries the patient's name/phone for display."""

    patient_name: str | None = None
    patient_phone: str | None = None
