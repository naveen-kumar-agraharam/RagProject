"""
Utility functions for CollegeGPT backend.
"""

import hashlib
import re
import unicodedata
from pathlib import Path


def sanitize_filename(filename: str) -> str:
    """
    Create a safe filename from user input.
    Removes special chars, normalizes unicode, replaces spaces with underscores.
    """
    # Normalize unicode characters
    filename = unicodedata.normalize("NFKD", filename)
    filename = filename.encode("ascii", "ignore").decode("ascii")

    # Get stem and suffix
    p = Path(filename)
    stem = p.stem
    suffix = p.suffix.lower()

    # Remove non-alphanumeric characters (keep hyphens and underscores)
    stem = re.sub(r"[^\w\s-]", "", stem)
    stem = re.sub(r"[\s]+", "_", stem.strip())
    stem = re.sub(r"[-]+", "-", stem)

    if not stem:
        stem = "document"

    return f"{stem}{suffix}"


def compute_md5(data: bytes) -> str:
    """Compute MD5 hash of bytes data."""
    return hashlib.md5(data).hexdigest()


def truncate_text(text: str, max_chars: int = 200) -> str:
    """Truncate text to a maximum number of characters, adding ellipsis."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(" ", 1)[0] + "..."


def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable form."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"


def clean_text_for_embedding(text: str) -> str:
    """
    Clean text specifically for embedding generation.
    Removes excessive whitespace and normalizes punctuation.
    """
    # Remove null bytes
    text = text.replace("\x00", "")
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    return text.strip()
