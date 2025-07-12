from typing import Annotated
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user


async def get_current_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action",
        )
    return current_user


def check_user_permission(user_id: int, current_user: User):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )


async def get_user_by_id(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


def check_email_username_exists(
    db: Session,
    email: str | None = None,
    username: str | None = None,
    exclude_user_id: int | None = None,
) -> None:
    query = db.query(User)
    if email:
        email_query = query.filter(User.email == email)
        if exclude_user_id:
            email_query = email_query.filter(User.id != exclude_user_id)
        if email_query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    if username:
        username_query = query.filter(User.username == username)
        if exclude_user_id:
            username_query = username_query.filter(User.id != exclude_user_id)
        if username_query.first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
