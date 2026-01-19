from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()

@router.post("/subscribe-to-nano-gallery")
async def subscribe_to_nano_gallery(
    subscribe: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.nano_banana_gallery_subscribed = subscribe
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "subscribed": current_user.nano_banana_gallery_subscribed}