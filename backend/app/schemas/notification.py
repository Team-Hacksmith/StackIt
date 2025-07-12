from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    message: str
    type: NotificationType
    reference_id: Optional[int] = None


class NotificationCreate(NotificationBase):
    user_id: int


class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
