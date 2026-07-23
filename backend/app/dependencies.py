"""Reusable FastAPI dependencies for authentication and authorisation.

Role checks are enforced here on the server — the frontend is never trusted to
hide privileged actions.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import JWTError, decode_access_token
from app.models.common import UserRole
from app.models.user import UserInDB
from app.repositories import users_repo

_bearer_scheme = HTTPBearer(auto_error=False)

_CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> UserInDB:
    """Resolve the authenticated user from the bearer token, or raise 401."""
    if credentials is None:
        raise _CREDENTIALS_ERROR
    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user_id = payload.get("sub")
    user = await users_repo().get(user_id) if user_id else None
    if user is None:
        raise _CREDENTIALS_ERROR
    return user


def require_role(*roles: UserRole):
    """Dependency factory enforcing that the current user has one of ``roles``."""

    async def _check(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return _check


# Convenience dependencies used by the panels.
require_doctor = require_role(UserRole.DOCTOR)
require_patient = require_role(UserRole.PATIENT)
