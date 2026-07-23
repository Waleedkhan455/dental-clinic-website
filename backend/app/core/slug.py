"""URL-slug generation for services (and any other slugged content)."""

import re


def slugify(value: str) -> str:
    """Turn a display name into a URL-safe slug, e.g. "Root Canal (RCT)" -> "root-canal-rct"."""
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or "item"
