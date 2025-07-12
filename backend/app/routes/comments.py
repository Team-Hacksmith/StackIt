from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import CommentCreate, Comment as CommentSchema
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/posts/{post_id}/comments", response_model=List[CommentSchema])
def list_comments(post_id: int, db: Annotated[Session, Depends(get_db)]):
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    return comments


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentSchema,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    post_id: int,
    comment: CommentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db_comment = Comment(body=comment.body, user_id=current_user.id, post_id=post_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.put("/comments/{comment_id}", response_model=CommentSchema)
def update_comment(
    comment_id: int,
    comment: CommentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    # Allow both comment owner and admins to update
    if db_comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to update this comment"
        )

    db_comment.body = comment.body
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    # Allow both comment owner and admins to delete
    if db_comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this comment"
        )

    db.delete(db_comment)
    db.commit()
    return None


@router.post("/comments/{comment_id}/accept", response_model=CommentSchema)
def accept_comment(
    comment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    post = db.query(Post).filter(Post.id == db_comment.post_id).first()
    # Allow both post owner and admins to accept comments
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only the post owner or admins can accept comments"
        )

    db_comment.is_accepted = True
    db.commit()
    db.refresh(db_comment)
    return db_comment
