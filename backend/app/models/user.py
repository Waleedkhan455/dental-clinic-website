"""User schemas.

The stored password is always hashed (never plain text). ``UserCreate`` takes a
plain password which is hashed in the auth layer before persistence, and
``UserPublic`` never exposes the hash.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.common import MongoModel, UserRole


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    role: UserRole = UserRole.PATIENT


class UserCreate(UserBase):
    # Plain password from the client; hashed before storage (auth phase).
    password: str = Field(min_length=8, max_length=128)


class UserPublic(MongoModel, UserBase):
    """User as returned by the API — never includes the password hash."""

    created_at: datetime | None = None


class UserInDB(MongoModel, UserBase):
    """Internal user record including the password hash. Never returned as-is."""

    password_hash: str
    created_at: datetime | None = None
