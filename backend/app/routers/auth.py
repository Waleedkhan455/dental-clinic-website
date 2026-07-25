"""Authentication endpoints: register, login, and current-user lookup."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.dependencies import get_current_user
from app.models.auth import (
    LoginRequest,
    OtpRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    TokenResponse,
)
from app.models.common import UserRole, utcnow
from app.models.user import UserInDB, UserPublic
from app.repositories import users_repo
from app.services.otp import create_and_send_otp, verify_otp


def _to_public(user: UserInDB) -> UserPublic:
    """Strip the password hash and return the public representation."""
    return UserPublic.model_validate(user.model_dump())


def _issue_token(user: UserInDB) -> TokenResponse:
    token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenResponse(access_token=token, user=_to_public(user))


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/request-otp", status_code=status.HTTP_200_OK)
async def request_otp(body: OtpRequest) -> dict[str, str]:
    """Email a verification code so sign-up can confirm the address is real."""
    email = body.email.lower()
    if await users_repo().find_one({"email": email}) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please sign in instead.",
        )
    await create_and_send_otp(email)
    return {"message": "A verification code has been sent to your email."}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest) -> TokenResponse:
    """Register a new patient (after email verification) and auto-login."""
    repo = users_repo()
    email = body.email.lower()
    if await repo.find_one({"email": email}) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Confirm the emailed code before creating the account.
    await verify_otp(email, body.otp)

    document = {
        "name": body.name,
        "email": email,
        "phone": body.phone,
        "role": UserRole.PATIENT.value,  # self-registration is always a patient
        "password_hash": hash_password(body.password),
        "created_at": utcnow(),
    }
    user_id = await repo.insert_one(document)
    user = await repo.get(user_id)
    assert user is not None  # just inserted
    return _issue_token(user)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    """Authenticate with email + password and return an access token."""
    user = await users_repo().find_one({"email": body.email.lower()})
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return _issue_token(user)


@router.get("/me", response_model=UserPublic)
async def me(current_user: UserInDB = Depends(get_current_user)) -> UserPublic:
    """Return the currently authenticated user."""
    return _to_public(current_user)


@router.patch("/me", response_model=UserPublic)
async def update_me(
    body: ProfileUpdateRequest,
    current_user: UserInDB = Depends(get_current_user),
) -> UserPublic:
    """Update the signed-in user's own profile (name and phone only).

    A user can only ever edit their own record — the target is taken from the
    token, never from the request body.
    """
    repo = users_repo()
    await repo.update_by_id(
        current_user.id,
        {
            "name": body.name,
            "phone": body.phone,
            "avatar_url": body.avatar_url,
            "updated_at": utcnow(),
        },
    )
    updated = await repo.get(current_user.id)
    assert updated is not None  # the authenticated user must still exist
    return _to_public(updated)
