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


class PatientHistoryCreate(PatientHistoryBase):
    pass


class PatientHistoryPublic(MongoModel, PatientHistoryBase):
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PatientHistoryDetail(PatientHistoryPublic):
    """A treatment record enriched with the treating doctor's display name."""

    doctor_name: str | None = None
    doctor_designation: str | None = None
