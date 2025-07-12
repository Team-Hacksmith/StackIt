from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.models.notification import NotificationType
from app.models.vote import CommentVote, VoteType
from app.schemas.comment import CommentCreate, Comment as CommentSchema
from app.schemas.notification import NotificationCreate
from app.services.notifications import notification_service
from app.utils.auth import get_current_user
from app.utils.mentions import get_mentioned_users
from app.services.karma import karma_service

router = APIRouter()


@router.get("/posts/{post_id}/comments", response_model=List[CommentSchema])
def list_comments(post_id: int, db: Annotated[Session, Depends(get_db)]):
    comments = (
        db.query(Comment).join(Comment.user).filter(Comment.post_id == post_id).all()
    )
    return comments


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentSchema,
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
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

    # Award karma for creating a comment
    await karma_service.award_comment_creation(db, current_user.id)

    # Notify post owner about the new comment
    if post.user_id != current_user.id:
        notification = NotificationCreate(
            user_id=post.user_id,
            message=f"@{current_user.username} commented on your post: {post.title}",
            type=NotificationType.COMMENT,
            reference_id=db_comment.id,
        )
        await notification_service.create_notification(db, notification)

    # Handle @mentions
    mentioned_users = get_mentioned_users(db, comment.body)
    for user in mentioned_users:
        if user.id != current_user.id:
            notification = NotificationCreate(
                user_id=user.id,
                message=f"@{current_user.username} mentioned you in a comment",
                type=NotificationType.MENTION,
                reference_id=db_comment.id,
            )
            await notification_service.create_notification(db, notification)

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
async def toggle_accept_comment(
    comment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    post = db.query(Post).filter(Post.id == db_comment.post_id).first()
    # Allow both post owner and admins to accept/unaccept comments
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only the post owner or admins can accept comments"
        )

    if db_comment.is_accepted:
        # If comment is already accepted, unaccept it
        db_comment.is_accepted = False
        db.commit()
        db.refresh(db_comment)
        return db_comment

    # Check if any other comment is already accepted for this post
    existing_accepted = (
        db.query(Comment)
        .filter(Comment.post_id == post.id, Comment.is_accepted == True)
        .first()
    )
    if existing_accepted:
        raise HTTPException(
            status_code=400, detail="Another comment is already accepted for this post"
        )

    # Set comment as accepted
    db_comment.is_accepted = True
    db.commit()
    db.refresh(db_comment)

    # Award karma for getting comment accepted
    await karma_service.award_comment_accepted(db, db_comment.user_id)

    # Notify comment author that their comment was accepted
    notification = NotificationCreate(
        user_id=db_comment.user_id,
        message=f"Your comment on '{post.title}' was accepted as the answer",
        type=NotificationType.ANSWER,
        reference_id=db_comment.id,
    )
    await notification_service.create_notification(db, notification)

    return db_comment


@router.post("/comments/{comment_id}/vote/{vote_type}", response_model=CommentSchema)
async def vote_comment(
    comment_id: int,
    vote_type: VoteType,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check if user has already voted
    existing_vote = (
        db.query(CommentVote)
        .filter(
            CommentVote.comment_id == comment_id, CommentVote.user_id == current_user.id
        )
        .first()
    )

    if existing_vote:
        if existing_vote.vote_type == vote_type:
            # Remove vote if clicking the same button
            db.delete(existing_vote)
            # Update score and karma
            if vote_type == VoteType.UPVOTE:
                comment.score -= 1
                await karma_service.handle_comment_vote(db, comment.user_id, False)
            else:
                comment.score += 1
                await karma_service.handle_comment_vote(db, comment.user_id, True)
        else:
            # Change vote type if voting differently
            existing_vote.vote_type = vote_type
            # Update score and karma
            if vote_type == VoteType.UPVOTE:
                comment.score += 2  # -1 -> +1 = +2
                await karma_service.handle_comment_vote(db, comment.user_id, True)
                await karma_service.handle_comment_vote(
                    db, comment.user_id, True
                )  # Double karma change for vote switch
            else:
                comment.score -= 2  # +1 -> -1 = -2
                await karma_service.handle_comment_vote(db, comment.user_id, False)
                await karma_service.handle_comment_vote(
                    db, comment.user_id, False
                )  # Double karma change for vote switch
    else:
        # Create new vote
        vote = CommentVote(
            user_id=current_user.id, comment_id=comment_id, vote_type=vote_type
        )
        db.add(vote)
        # Update score and karma
        if vote_type == VoteType.UPVOTE:
            comment.score += 1
            await karma_service.handle_comment_vote(db, comment.user_id, True)
        else:
            comment.score -= 1
            await karma_service.handle_comment_vote(db, comment.user_id, False)

    db.commit()
    db.refresh(comment)
    return comment
