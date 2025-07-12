from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.post import Post
from app.models.tag import Tag
from app.models.user import User
from app.models.notification import NotificationType
from app.schemas.post import PostCreate, Post as PostSchema
from app.schemas.notification import NotificationCreate
from app.services.notifications import notification_service
from app.utils.auth import get_current_user
from app.utils.mentions import get_mentioned_users

router = APIRouter()


@router.get("/posts", response_model=List[PostSchema])
def list_posts(db: Annotated[Session, Depends(get_db)]):
    posts = db.query(Post).join(Post.user).all()
    return posts


@router.post("/posts", response_model=PostSchema, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if not post.tag_ids:
        raise HTTPException(status_code=400, detail="At least one tag is required")

    tags = db.query(Tag).filter(Tag.id.in_(post.tag_ids)).all()
    if len(tags) != len(post.tag_ids):
        raise HTTPException(status_code=400, detail="One or more tag IDs are invalid")
    if len(tags) == 0:
        raise HTTPException(status_code=400, detail="At least one tag is required")

    # Create the post
    db_post = Post(title=post.title, body=post.body, user_id=current_user.id)
    db_post.tags = tags

    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # Handle @mentions in the post
    mentioned_users = get_mentioned_users(db, post.body)
    for user in mentioned_users:
        if user.id != current_user.id:
            notification = NotificationCreate(
                user_id=user.id,
                message=f"@{current_user.username} mentioned you in a post",
                type=NotificationType.MENTION,
                reference_id=db_post.id,
            )
            await notification_service.create_notification(db, notification)

    return db_post


@router.get("/posts/{id}", response_model=PostSchema)
def get_post(id: int, db: Annotated[Session, Depends(get_db)]):
    post = db.query(Post).join(Post.user).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/posts/{id}", response_model=PostSchema)
async def update_post(
    id: int,
    post: PostCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Allow both post owner and admins to update
    if db_post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to update this post"
        )

    # Store old body for mention comparison
    old_mentions = get_mentioned_users(db, db_post.body)

    # Update basic fields
    db_post.title = post.title
    db_post.body = post.body

    # Validate and update tags
    if not post.tag_ids:
        raise HTTPException(status_code=400, detail="At least one tag is required")

    tags = db.query(Tag).filter(Tag.id.in_(post.tag_ids)).all()
    if len(tags) != len(post.tag_ids):
        raise HTTPException(status_code=400, detail="One or more tag IDs are invalid")
    db_post.tags = tags

    db.commit()
    db.refresh(db_post)

    # Handle new @mentions in updated post body
    new_mentions = get_mentioned_users(db, post.body)
    for user in new_mentions:
        if user.id != current_user.id and user not in old_mentions:
            notification = NotificationCreate(
                user_id=user.id,
                message=f"@{current_user.username} mentioned you in an updated post: {post.title}",
                type=NotificationType.MENTION,
                reference_id=db_post.id,
            )
            await notification_service.create_notification(db, notification)

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
    # Allow both post owner and admins to delete
    if db_post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this post"
        )

    db.delete(db_post)
    db.commit()
    return None


@router.get("/posts/by-tag/{tag_id}", response_model=List[PostSchema])
def list_posts_by_tag(
    tag_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Get posts with user data
    posts = db.query(Post).join(Post.user).filter(Post.tags.contains(tag)).all()
    return posts
