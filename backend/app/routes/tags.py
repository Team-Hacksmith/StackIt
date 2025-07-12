from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tag import Tag
from app.models.user import User
from app.schemas.tag import TagCreate, Tag as TagSchema
from app.utils.auth import get_current_user, is_admin

router = APIRouter()


@router.get("/tags", response_model=List[TagSchema])
def list_tags(db: Annotated[Session, Depends(get_db)]):
    tags = db.query(Tag).all()
    return tags


@router.post("/tags", response_model=TagSchema, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag: TagCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    is_admin: Annotated[bool, Depends(is_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create tags")

    # Check if tag already exists
    existing_tag = db.query(Tag).filter(Tag.title == tag.title).first()
    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag already exists")

    db_tag = Tag(title=tag.title)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.put("/tags/{tag_id}", response_model=TagSchema)
def update_tag(
    tag_id: int,
    tag: TagCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    is_admin: Annotated[bool, Depends(is_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update tags")

    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Check if new title conflicts with existing tag
    existing_tag = db.query(Tag).filter(Tag.title == tag.title).first()
    if existing_tag and existing_tag.id != tag_id:
        raise HTTPException(
            status_code=400, detail="Tag with this title already exists"
        )

    db_tag.title = tag.title
    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    is_admin: Annotated[bool, Depends(is_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete tags")

    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    db.delete(db_tag)
    db.commit()
    return None
