from typing import List
from pydantic import BaseModel, Field

from app.schemas.tag import Tag


class PostBase(BaseModel):
    title: str
    body: str
    tag_ids: List[int]


class PostCreate(PostBase):
    pass


class Post(BaseModel):
    id: int
    user_id: int
    title: str
    body: str
    tags: List[Tag] = []

    class Config:
        from_attributes = True
