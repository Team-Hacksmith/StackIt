from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate, Post as PostSchema
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/posts", response_model=List[PostSchema])
def list_posts(db: Annotated[Session, Depends(get_db)]):
    posts = db.query(Post).all()
    return posts


@router.post("/posts", response_model=PostSchema, status_code=status.HTTP_201_CREATED)
def create_post(
    post: PostCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_post = Post(title=post.title, body=post.body, user_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.get("/posts/{id}", response_model=PostSchema)
def get_post(id: int, db: Annotated[Session, Depends(get_db)]):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/posts/{id}", response_model=PostSchema)
def update_post(
    id: int,
    post: PostCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this post"
        )

    db_post.title = post.title
    db_post.body = post.body
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/posts/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this post"
        )

    db.delete(db_post)
    db.commit()
    return None
