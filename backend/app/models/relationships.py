from sqlalchemy.orm import relationship
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment

# Set up User relationships
User.posts = relationship("Post", back_populates="user")
User.comments = relationship("Comment", back_populates="user")

# Set up Post relationships
Post.user = relationship("User", back_populates="posts")
Post.comments = relationship(
    "Comment", back_populates="post", cascade="all, delete-orphan"
)

# Set up Comment relationships
Comment.user = relationship("User", back_populates="comments")
Comment.post = relationship("Post", back_populates="comments")
