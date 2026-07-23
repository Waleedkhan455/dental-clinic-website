"""MongoDB connection management using the async Motor driver.

A single client is created for the application's lifetime. The connection is
verified with a ``ping`` before any feature relies on it — per the project
specification, a failed connection is reported, not worked around.
"""

import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class _MongoState:
    """Holds the process-wide Motor client and database handle."""

    client: AsyncIOMotorClient | None = None
    database: AsyncIOMotorDatabase | None = None


mongo = _MongoState()


async def connect_to_mongo() -> None:
    """Open the Motor client and verify the connection with a ping.

    Raises whatever exception Motor/PyMongo raises if the server is
    unreachable, so the caller can decide how to handle a failed connection.
    """
    settings = get_settings()
    client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.mongo_uri,
        serverSelectionTimeoutMS=5000,
        uuidRepresentation="standard",
    )
    # Fail fast if the server cannot be reached.
    await client.admin.command("ping")

    mongo.client = client
    mongo.database = client[settings.mongo_db_name]
    logger.info("Connected to MongoDB database '%s'", settings.mongo_db_name)


async def close_mongo_connection() -> None:
    """Close the Motor client if it is open."""
    if mongo.client is not None:
        mongo.client.close()
        mongo.client = None
        mongo.database = None
        logger.info("Closed MongoDB connection")


async def ping() -> bool:
    """Return True if the database currently responds to a ping."""
    if mongo.client is None:
        return False
    try:
        await mongo.client.admin.command("ping")
        return True
    except Exception:  # noqa: BLE001 - any failure means "not healthy"
        return False


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database handle for use in routers and services.

    Raises RuntimeError if the connection was never established, which makes
    misconfiguration obvious instead of failing silently later.
    """
    if mongo.database is None:
        raise RuntimeError(
            "MongoDB is not connected. Ensure MONGO_URI is set and the server is reachable."
        )
    return mongo.database
