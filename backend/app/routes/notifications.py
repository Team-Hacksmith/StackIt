from fastapi import (
    APIRouter,
    Depends,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    Query,
)
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.notification import Notification
from app.services.notifications import notification_service
from app.utils.auth import get_current_user, get_user_from_token
from app.websockets.manager import manager

router = APIRouter(prefix="/notifications", tags=["Notification"])


@router.get("/", response_model=List[Notification])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.get_user_notifications(db, current_user.id, skip, limit)


@router.post("/read_all")
async def mark_all_as_read(
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    notification_service.mark_all_read(db, current_user.id)
    return {"status": "success"}


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, token: str, db: Session = Depends(get_db)
):
    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, user.id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user.id)
