from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserList, UserUpdate
from app.utils.auth import get_current_user
from app.utils.user import (
    get_current_admin_user,
    check_user_permission,
    get_user_by_id,
    check_email_username_exists,
)

router = APIRouter()


@router.get("/users", response_model=UserList)
async def list_users(
    current_user: Annotated[User, Depends(get_current_admin_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    skip = (page - 1) * size
    total = db.query(User).count()
    users = db.query(User).offset(skip).limit(size).all()

    return {"total": total, "items": users, "page": page, "size": size}


@router.get("/users/{user_id}", response_model=UserSchema)
async def get_user(user_id: int, db: Annotated[Session, Depends(get_db)]):
    return await get_user_by_id(user_id, db)


@router.put("/users/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    check_user_permission(user_id, current_user)
    db_user = await get_user_by_id(user_id, db)

    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )

    if "email" in update_data or "username" in update_data:
        check_email_username_exists(
            db,
            email=update_data.get("email"),
            username=update_data.get("username"),
            exclude_user_id=user_id,
        )

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    user = await get_user_by_id(user_id, db)
    db.delete(user)
    db.commit()


@router.post("/users/{user_id}/promote", response_model=UserSchema)
async def promote_to_admin(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    user = await get_user_by_id(user_id, db)

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="User is already an admin")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot promote yourself")

    user.role = "admin"
    user.created_by_id = current_user.id
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/demote", response_model=UserSchema)
async def demote_admin(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_admin_user)],
    db: Annotated[Session, Depends(get_db)],
):
    user = await get_user_by_id(user_id, db)

    if user.role != "admin":
        raise HTTPException(status_code=400, detail="User is not an admin")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot demote yourself")

    user.role = "user"
    user.created_by_id = None
    db.commit()
    db.refresh(user)
    return user
