import os
import aiofiles
from fastapi import UploadFile
from uuid import uuid4
from app.config import get_settings

settings = get_settings()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


class FileValidationError(Exception):
    pass


async def save_upload_file(file: UploadFile) -> str:
    """
    Save an uploaded file and return its URL path
    """
    # Validate file size
    file_size = 0
    chunk_size = 1024
    while chunk := await file.read(chunk_size):
        file_size += len(chunk)
        if file_size > MAX_FILE_SIZE:
            raise FileValidationError("File size exceeds maximum limit")
    await file.seek(0)

    # Validate file extension
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise FileValidationError("File type not allowed")

    # Generate unique filename
    filename = f"{uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Create uploads directory if it doesn't exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Save the file
    async with aiofiles.open(filepath, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    # Return the URL path
    return f"/uploads/{filename}"
