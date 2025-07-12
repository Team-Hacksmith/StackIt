from datetime import datetime
from enum import Enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from app.database import Base


class NotificationType(str, Enum):
    ANSWER = "answer"
    COMMENT = "comment"
    MENTION = "mention"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    type = Column(SQLEnum(NotificationType))
    reference_id = Column(Integer)

    user = relationship("User", back_populates="notifications")
