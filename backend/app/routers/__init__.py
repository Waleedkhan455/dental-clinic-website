"""API routers.

Routers are organised by domain per the specification: ``auth``, ``doctors``,
``services``, ``appointments``, ``history``, ``testimonials``, ``gallery``.
Domain routers are added in later phases as their endpoints are built; the
aggregate ``api_router`` below is what ``main.py`` mounts under the API prefix.
"""

from fastapi import APIRouter

from app.routers import meta

api_router = APIRouter()
api_router.include_router(meta.router)

__all__ = ["api_router"]
