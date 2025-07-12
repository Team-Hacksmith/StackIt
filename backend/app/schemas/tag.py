from typing import List
from pydantic import BaseModel


class TagBase(BaseModel):
    title: str


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True


class TagWithPosts(Tag):
    posts: List["Post"]  # type: ignore

    class Config:
        from_attributes = True
