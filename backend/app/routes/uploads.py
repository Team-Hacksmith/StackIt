from fastapi import APIRouter, UploadFile, HTTPException
from app.services.file_service import save_upload_file, FileValidationError

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile):
    try:
        file_path = await save_upload_file(file)
        return {"url": file_path}
    except FileValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to upload file")
