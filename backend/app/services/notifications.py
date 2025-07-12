from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationCreate
from app.websockets.manager import manager


class NotificationService:
    @staticmethod
    async def create_notification(
        db: Session, notification: NotificationCreate
    ) -> Notification:
        db_notification = Notification(**notification.model_dump())
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)

        unread_count = (
            db.query(Notification)
            .filter(
                Notification.user_id == notification.user_id,
                Notification.is_read == False,
            )
            .count()
        )

        await manager.send_notification(
            notification.user_id, notification.message, unread_count
        )

        return db_notification

    @staticmethod
    def mark_all_read(db: Session, user_id: int) -> None:
        db.query(Notification).filter(
            Notification.user_id == user_id, Notification.is_read == False
        ).update({Notification.is_read: True})
        db.commit()

    @staticmethod
    def get_user_notifications(
        db: Session, user_id: int, skip: int = 0, limit: int = 50
    ):
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .count()
        )


notification_service = NotificationService()
