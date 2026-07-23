"""Meta endpoints: a lightweight ping used to confirm the frontend can reach
the API. Database health lives on the top-level ``/health`` route in main.py.
"""

from fastapi import APIRouter

router = APIRouter(tags=["meta"])


@router.get("/ping")
async def ping() -> dict[str, str]:
    """Return a simple pong so the frontend can verify API connectivity."""
    return {"message": "pong"}
