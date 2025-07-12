from sqlalchemy.orm import Session
from app.models.user import User


class KarmaPoints:
    POST_CREATED = 5
    COMMENT_CREATED = 2
    COMMENT_ACCEPTED = 15
    COMMENT_UPVOTED = 10
    COMMENT_DOWNVOTED = -2


class KarmaService:
    @staticmethod
    async def update_karma(db: Session, user_id: int, points: int) -> User:
        """Update a user's karma points in a transaction."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.karma += points
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    async def award_post_creation(db: Session, user_id: int) -> User:
        """Award karma points for creating a post."""
        return await KarmaService.update_karma(db, user_id, KarmaPoints.POST_CREATED)

    @staticmethod
    async def award_comment_creation(db: Session, user_id: int) -> User:
        """Award karma points for creating a comment."""
        return await KarmaService.update_karma(db, user_id, KarmaPoints.COMMENT_CREATED)

    @staticmethod
    async def award_comment_accepted(db: Session, user_id: int) -> User:
        """Award karma points when user's comment is accepted."""
        return await KarmaService.update_karma(
            db, user_id, KarmaPoints.COMMENT_ACCEPTED
        )

    @staticmethod
    async def handle_comment_vote(db: Session, user_id: int, is_upvote: bool) -> User:
        """Award or deduct karma points for comment votes."""
        points = (
            KarmaPoints.COMMENT_UPVOTED if is_upvote else KarmaPoints.COMMENT_DOWNVOTED
        )
        return await KarmaService.update_karma(db, user_id, points)


karma_service = KarmaService()
