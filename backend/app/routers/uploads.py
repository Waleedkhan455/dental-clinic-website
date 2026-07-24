"""Image upload endpoint.

Authenticated users upload an image from their device; the file is stored on
disk and served back as a static URL. Used for team photos, service images,
gallery photos, and patient avatars — replacing pasted image links.
"""

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.dependencies import get_current_user
from app.models.user import UserInDB

router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = Path("uploads")
# Allowed image content types → file extension.
ALLOWED_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    _: UserInDB = Depends(get_current_user),
) -> dict[str, str]:
    """Store an uploaded image and return its absolute URL."""
    extension = ALLOWED_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Please upload a JPG, PNG, WEBP, or GIF image.",
        )

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image is too large. Please upload a file under 5 MB.",
        )
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded file is empty."
        )

    UPLOAD_DIR.mkdir(exist_ok=True)
    name = f"{uuid.uuid4().hex}{extension}"
    (UPLOAD_DIR / name).write_bytes(data)

    base = get_settings().public_api_url.rstrip("/")
    return {"url": f"{base}/uploads/{name}"}
