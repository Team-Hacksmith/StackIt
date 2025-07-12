from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth
from app.config import get_settings

settings = get_settings()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StackIt API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Auth"])


@app.get("/")
def read_root():
    return {"message": "Welcome to StackIt API"}
