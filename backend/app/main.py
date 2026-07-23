"""FastAPI application entrypoint.

Wires up configuration, CORS for the Next.js frontend, the MongoDB connection
lifecycle, and the API routers. Business logic and database access live behind
this API — the frontend never talks to MongoDB directly.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.indexes import ensure_indexes
from app.db.mongodb import close_mongo_connection, connect_to_mongo, get_database, ping
from app.routers import api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open the MongoDB connection on startup and close it on shutdown.

    If the database is unreachable at startup the API still boots so the
    developer can inspect ``/health`` and the docs, but database-backed
    endpoints will surface a clear error until MONGO_URI is configured.
    """
    # Retry a few times so a transient DNS/network blip at boot does not leave
    # the API running without a database for the rest of its lifetime.
    attempts = 5
    for attempt in range(1, attempts + 1):
        try:
            await connect_to_mongo()
            await ensure_indexes(get_database())
            break
        except Exception as exc:  # noqa: BLE001
            if attempt < attempts:
                logger.warning(
                    "MongoDB connection attempt %d/%d failed: %s; retrying in 2s…",
                    attempt,
                    attempts,
                    exc,
                )
                await asyncio.sleep(2)
            else:
                logger.error(
                    "MongoDB connection failed after %d attempts: %s", attempts, exc
                )
                logger.error(
                    "API is running, but database endpoints will fail until a reachable "
                    "MONGO_URI is configured in backend/.env"
                )
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    description="REST API for Zimal Dental Clinic And Implant Center.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All domain endpoints are mounted under the configured API prefix (default /api).
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/health", tags=["health"])
async def health() -> dict:
    """Report service and database health.

    Used to verify — before building database features — that the connection
    actually succeeds, as required by the project specification.
    """
    database_connected = await ping()
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.environment,
        "database": {
            "connected": database_connected,
            "name": settings.mongo_db_name if database_connected else None,
        },
    }
