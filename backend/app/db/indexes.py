"""Index creation, run once on startup.

Indexes cover the fields used for lookup and filtering — unique keys (email,
service slug) and the appointment/history filters (doctor, patient, date,
status). ``create_index`` is idempotent, so this is safe to run every boot.
"""

import logging

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db import collections as c

logger = logging.getLogger(__name__)


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    # Users — unique email for authentication.
    await db[c.USERS].create_index("email", unique=True)

    # Services — unique slug for detail-page routing; category for grouping.
    await db[c.SERVICES].create_index("slug", unique=True)
    await db[c.SERVICES].create_index("category")

    # Doctors — active filter for the public directory; user linkage.
    await db[c.DOCTORS].create_index("is_active")
    await db[c.DOCTORS].create_index("user_id")

    # Appointments — filtered by doctor, patient, date, and status.
    await db[c.APPOINTMENTS].create_index("doctor_id")
    await db[c.APPOINTMENTS].create_index("patient_id")
    await db[c.APPOINTMENTS].create_index("scheduled_at")
    await db[c.APPOINTMENTS].create_index("status")

    # Patient history — looked up by patient and by doctor.
    await db[c.PATIENT_HISTORY].create_index("patient_id")
    await db[c.PATIENT_HISTORY].create_index("doctor_id")

    # Testimonials — published filter for the public site.
    await db[c.TESTIMONIALS].create_index("is_published")

    # Gallery — ascending display order.
    await db[c.GALLERY].create_index("sort_order")

    # Email verification codes — one active code per email, auto-expired by TTL.
    await db[c.EMAIL_OTPS].create_index("email", unique=True)
    await db[c.EMAIL_OTPS].create_index("expires_at", expireAfterSeconds=0)

    logger.info("MongoDB indexes ensured")
