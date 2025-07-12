from pydantic import BaseModel


class PostBase(BaseModel):
    title: str
    body: str


class PostCreate(PostBase):
    pass


class Post(PostBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
