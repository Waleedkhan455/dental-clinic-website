"""Authentication request/response schemas.

``RegisterRequest`` intentionally has no ``role`` field: self-registration
always creates a patient. A doctor/admin account is provisioned separately, so
a registrant can never grant themselves elevated privileges.
"""

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserPublic


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdateRequest(BaseModel):
    """Fields a signed-in user may edit on their own profile.

    Email and role are intentionally omitted — email is the login identity and
    role can never be self-assigned.
    """

    name: str = Field(min_length=1, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    avatar_url: str | None = Field(default=None, max_length=2000)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
