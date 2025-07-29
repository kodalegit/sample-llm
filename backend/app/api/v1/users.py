from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import User as UserSchema

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def read_user_me(current_user: User = Depends(get_current_user)) -> Any:
    """Get current user"""
    return current_user


@router.get("/{user_id}", response_model=UserSchema)
async def read_user_by_id(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    """Get a specific user by id"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Only allow users to access their own information
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return user