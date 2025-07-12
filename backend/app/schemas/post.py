from typing import List, Optional
from pydantic import BaseModel

from app.schemas.tag import Tag


class PostBase(BaseModel):
    title: str
    body: str
    tag_ids: Optional[List[int]] = None


class PostCreate(PostBase):
    pass


class Post(PostBase):
    id: int
    user_id: int
    tags: List[Tag] = []

    class Config:
        from_attributes = True
