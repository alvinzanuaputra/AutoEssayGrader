from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import current_active_user
from core.db import get_session
from models.user_model import User, UserRead, UserUpdate
from services.user_service import get_user_service, UserService

router = APIRouter(tags=["users"])


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    is_superuser: bool
    is_verified: bool

    class Config:
        from_attributes = True


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    user_service = await get_user_service(session)
    users = await user_service.get_all_users(skip=skip, limit=limit)
    return users


@router.get("/users/me", response_model=UserResponse)
async def get_current_user(current_user: User = Depends(current_active_user)):
    return current_user


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    user_service = await get_user_service(session)
    user = await user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="not found")

    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="no perms")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="error")

    user_service = await get_user_service(session)
    await user_service.delete_user(user_id)
    return {"message": "User deleted successfully"}


@router.patch("/users/me", response_model=UserRead)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Update current user profile information"""
    from sqlalchemy import select
    
    # Get fresh user from database in this session
    result = await session.execute(
        select(User).where(User.id == current_user.id)
    )
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields yang diberikan
    update_data = user_update.dict(exclude_unset=True)
    
    # Jika update password, hash dulu menggunakan passlib
    if "password" in update_data and update_data["password"]:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        update_data["hashed_password"] = pwd_context.hash(update_data["password"])
        del update_data["password"]
    
    # Update user fields
    for field, value in update_data.items():
        if hasattr(db_user, field) and field != "password":
            setattr(db_user, field, value)
    
    try:
        await session.commit()
        await session.refresh(db_user)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")
    
    # Return dengan is_oauth_user flag
    return UserRead(
        id=db_user.id,
        fullname=db_user.fullname,
        username=db_user.username,
        email=db_user.email,
        notelp=db_user.notelp,
        institution=db_user.institution,
        biografi=db_user.biografi,
        profile_picture=db_user.profile_picture,
        is_active=db_user.is_active,
        is_superuser=db_user.is_superuser,
        is_verified=db_user.is_verified,
        is_oauth_user=not bool(db_user.hashed_password),
    )


@router.delete("/users/me")
async def delete_current_user_account(
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete current user account"""
    from sqlalchemy import select, delete
    from models.user_model import UserSession, UserOAuth
    
    try:
        # Delete user sessions
        await session.execute(
            delete(UserSession).where(UserSession.user_id == current_user.id)
        )
        
        # Delete OAuth accounts
        await session.execute(
            delete(UserOAuth).where(UserOAuth.user_id == current_user.id)
        )
        
        # Delete user
        await session.execute(
            delete(User).where(User.id == current_user.id)
        )
        
        await session.commit()
        return {"message": "Account deleted successfully"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
