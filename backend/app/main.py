from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.database import engine, Base

from app.routes import auth, posts, comments, tags, users, notifications, uploads

from app.config import get_settings
from app.models import relationships

settings = get_settings()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StackIt API")

# Mount uploads directory for serving static files
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Auth"])
app.include_router(users.router, tags=["Users"])
app.include_router(posts.router, tags=["Posts"])
app.include_router(comments.router, tags=["Comments"])
app.include_router(tags.router, tags=["Tags"])
app.include_router(notifications.router, tags=["Notifications"])
app.include_router(uploads.router, tags=["Uploads"])


@app.get("/")
def read_root():
    return {"message": "Welcome to StackIt API"}
