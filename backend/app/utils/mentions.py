import re
from typing import List
from sqlalchemy.orm import Session
from app.models.user import User


def extract_mentions(text: str) -> List[str]:
    mention_pattern = r"@(\w+)"
    return list(set(re.findall(mention_pattern, text)))


def get_mentioned_users(db: Session, text: str) -> List[User]:
    usernames = extract_mentions(text)
    if not usernames:
        return []

    return db.query(User).filter(User.username.in_(usernames)).all()
