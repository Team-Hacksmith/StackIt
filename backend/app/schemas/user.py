from typing import List
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    name: str | None = None
    email: EmailStr | None = None
    username: str | None = None


class User(UserBase):
    id: int
    role: str
    karma: int

    class Config:
        from_attributes = True


class UserList(BaseModel):
    total: int
    items: List[User]
    page: int
    size: int


class UserPublic(BaseModel):
    id: int
    name: str
    username: str
    role: str

    class Config:
        from_attributes = True
