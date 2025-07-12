from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, Token, User as UserSchema
from app.config import get_settings
from app.utils.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
)

settings = get_settings()

router = APIRouter()


@router.post(
    "/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED
)
def register(user: UserCreate, db: Annotated[Session, Depends(get_db)]):
    db_user = (
        db.query(User)
        .filter((User.email == user.email) | (User.username == user.username))
        .first()
    )
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered",
        )

    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token)
def login(form_data: UserLogin, db: Annotated[Session, Depends(get_db)]):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(current_user: Annotated[User, Depends(get_current_user)]):
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
