from pydantic import BaseModel


class CommentBase(BaseModel):
    body: str


class CommentCreate(CommentBase):
    pass


class Comment(CommentBase):
    id: int
    user_id: int
    post_id: int
    score: int
    is_accepted: bool

    class Config:
        from_attributes = True
