"""Create the default doctor/admin account.

Idempotent: if the admin already exists, it is left untouched. If no
``ADMIN_PASSWORD`` is configured, a strong password is generated and printed
once — copy it, then change it after first login. Run from ``backend``:

    python -m app.seed_admin
"""

import asyncio
import logging
import secrets

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings
from app.core.security import hash_password
from app.db import collections as c
from app.models.common import UserRole, utcnow

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("seed_admin")


async def seed_admin() -> None:
    settings = get_settings()
    email = settings.admin_email.lower()

    client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=10000)
    db = client[settings.mongo_db_name]
    try:
        await client.admin.command("ping")

        if await db[c.USERS].find_one({"email": email}) is not None:
            logger.info("Doctor/admin account already exists: %s (unchanged)", email)
            return

        password = settings.admin_password or secrets.token_urlsafe(12)
        await db[c.USERS].insert_one(
            {
                "name": settings.admin_name,
                "email": email,
                "phone": None,
                "role": UserRole.DOCTOR.value,
                "password_hash": hash_password(password),
                "created_at": utcnow(),
            }
        )

        print("\n" + "=" * 56)
        print("  DOCTOR / ADMIN ACCOUNT CREATED")
        print("=" * 56)
        print(f"  Email:    {email}")
        print(f"  Password: {password}")
        print("  Role:     doctor")
        print("  >> Log in and change this password from the panel.")
        print("=" * 56 + "\n")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_admin())
