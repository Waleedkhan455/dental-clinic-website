"""Email one-time-password (OTP) verification for account sign-up.

Codes live in a TTL-expired MongoDB collection. Times are stored as naive UTC to
match what the Motor driver returns on read, so comparisons stay consistent.
"""

import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.db import collections as c
from app.db.mongodb import get_database
from app.services.email import send_otp_email

logger = logging.getLogger(__name__)

OTP_TTL = timedelta(minutes=10)
RESEND_COOLDOWN = timedelta(seconds=30)
MAX_ATTEMPTS = 5


def _utcnow() -> datetime:
    """Naive UTC now (matches Motor's naive datetimes for safe comparisons)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


async def create_and_send_otp(email: str) -> None:
    """Generate a code for ``email``, store it, and email it. Raises on failure."""
    col = get_database()[c.EMAIL_OTPS]
    now = _utcnow()

    existing = await col.find_one({"email": email})
    if existing is not None:
        created = existing.get("created_at")
        if created is not None and (now - created) < RESEND_COOLDOWN:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait a few seconds before requesting another code.",
            )

    code = _generate_code()
    await col.update_one(
        {"email": email},
        {
            "$set": {
                "email": email,
                "code": code,
                "attempts": 0,
                "created_at": now,
                "expires_at": now + OTP_TTL,
            }
        },
        upsert=True,
    )

    # Dev convenience: surface the code in the server log so local testing works
    # even if email is slow or filtered. Never logged in production.
    if get_settings().environment == "development":
        logger.warning("DEV ONLY - verification code for %s is %s", email, code)

    sent = await send_otp_email(to_email=email, code=code)
    if not sent:
        # Roll back so the user can retry cleanly.
        await col.delete_one({"email": email})
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send the verification email. Please try again.",
        )


async def verify_otp(email: str, code: str, *, consume: bool = True) -> None:
    """Validate ``code`` for ``email``. Raises on any failure.

    ``consume=False`` checks the code without deleting it (used by the verify
    step, so the final account-creation step can validate it again).
    """
    col = get_database()[c.EMAIL_OTPS]
    now = _utcnow()

    doc = await col.find_one({"email": email})
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please request a verification code first.",
        )
    if doc.get("expires_at") is not None and now > doc["expires_at"]:
        await col.delete_one({"email": email})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your verification code has expired. Please request a new one.",
        )
    if doc.get("attempts", 0) >= MAX_ATTEMPTS:
        await col.delete_one({"email": email})
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Please request a new code.",
        )
    if code != doc.get("code"):
        await col.update_one({"email": email}, {"$inc": {"attempts": 1}})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect verification code.",
        )

    # Valid. Consume it (single-use) only when finalising registration.
    if consume:
        await col.delete_one({"email": email})
