from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from core.db import get_session
from core.auth import current_active_user
from models.user_model import User
from models.class_model import Class, ClassEnrollment, ClassRole


router = APIRouter(prefix="/api/classes", tags=["classes"])


# Pydantic Schemas
class ClassCreate(BaseModel):
    class_name: str
    subject: Optional[str] = None
    description: Optional[str] = None


class ClassUpdate(BaseModel):
    class_name: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ClassRead(BaseModel):
    id: int
    class_name: str
    subject: Optional[str]
    description: Optional[str]
    class_code: str
    teacher_id: int
    teacher_name: str
    teacher_email: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    student_count: int = 0
    assignment_count: int = 0
    user_role: Optional[str] = None

    class Config:
        from_attributes = True


@router.post("", response_model=ClassRead, status_code=status.HTTP_201_CREATED)
async def create_class(
    class_data: ClassCreate,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Create a new class (teacher only)"""
    
    # Generate unique class code
    class_code = Class.generate_class_code()
    
    # Check if code already exists (very unlikely but just in case)
    while True:
        result = await session.execute(
            select(Class).where(Class.class_code == class_code)
        )
        if not result.scalar_one_or_none():
            break
        class_code = Class.generate_class_code()
    
    # Create new class
    new_class = Class(
        class_name=class_data.class_name,
        subject=class_data.subject,
        description=class_data.description,
        class_code=class_code,
        teacher_id=current_user.id,
    )
    
    session.add(new_class)
    
    try:
        # Flush to get the class ID before creating enrollment
        await session.flush()
        
        # Automatically enroll teacher as teacher
        enrollment = ClassEnrollment(
            class_id=new_class.id,
            user_id=current_user.id,
            role=ClassRole.TEACHER,
        )
        session.add(enrollment)
        
        # Now commit both
        await session.commit()
        await session.refresh(new_class)
        
        return ClassRead(
            id=new_class.id,
            class_name=new_class.class_name,
            subject=new_class.subject,
            description=new_class.description,
            class_code=new_class.class_code,
            teacher_id=new_class.teacher_id,
            teacher_name=current_user.fullname,
            teacher_email=current_user.email,
            created_at=new_class.created_at,
            updated_at=new_class.updated_at,
            is_active=new_class.is_active,
            student_count=0,
            assignment_count=0,
            user_role="teacher",
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create class: {str(e)}"
        )


@router.get("", response_model=List[ClassRead])
async def get_user_classes(
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all classes where user is enrolled (as teacher or student)"""
    from sqlalchemy.orm import selectinload
    from sqlalchemy import func
    from models.class_model import Assignment
    
    # Get all enrollments for current user
    result = await session.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.user_id == current_user.id)
        .options(selectinload(ClassEnrollment.class_obj).selectinload(Class.teacher))
    )
    enrollments = result.scalars().all()
    
    classes_data = []
    for enrollment in enrollments:
        class_obj = enrollment.class_obj
        
        # Count students
        student_count_result = await session.execute(
            select(func.count(ClassEnrollment.id))
            .where(
                and_(
                    ClassEnrollment.class_id == class_obj.id,
                    ClassEnrollment.role == ClassRole.STUDENT
                )
            )
        )
        student_count = student_count_result.scalar()
        
        # Count assignments
        assignment_count_result = await session.execute(
            select(func.count(Assignment.id))
            .where(Assignment.class_id == class_obj.id)
        )
        assignment_count = assignment_count_result.scalar()
        
        classes_data.append(ClassRead(
            id=class_obj.id,
            class_name=class_obj.class_name,
            subject=class_obj.subject,
            description=class_obj.description,
            class_code=class_obj.class_code,
            teacher_id=class_obj.teacher_id,
            teacher_name=class_obj.teacher.fullname,
            teacher_email=class_obj.teacher.email,
            created_at=class_obj.created_at,
            updated_at=class_obj.updated_at,
            is_active=class_obj.is_active,
            student_count=student_count,
            assignment_count=assignment_count,
            user_role=enrollment.role.value,
        ))
    
    return classes_data


@router.get("/{class_id}", response_model=ClassRead)
async def get_class_detail(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get class details"""
    from sqlalchemy.orm import selectinload
    from sqlalchemy import func
    from models.class_model import Assignment
    
    # Check if user is enrolled in this class
    enrollment_result = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == class_id,
                ClassEnrollment.user_id == current_user.id
            )
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # Get class details
    result = await session.execute(
        select(Class)
        .where(Class.id == class_id)
        .options(selectinload(Class.teacher))
    )
    class_obj = result.scalar_one_or_none()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Count students
    student_count_result = await session.execute(
        select(func.count(ClassEnrollment.id))
        .where(
            and_(
                ClassEnrollment.class_id == class_id,
                ClassEnrollment.role == ClassRole.STUDENT
            )
        )
    )
    student_count = student_count_result.scalar()
    
    # Count assignments
    assignment_count_result = await session.execute(
        select(func.count(Assignment.id))
        .where(Assignment.class_id == class_id)
    )
    assignment_count = assignment_count_result.scalar()
    
    return ClassRead(
        id=class_obj.id,
        class_name=class_obj.class_name,
        subject=class_obj.subject,
        description=class_obj.description,
        class_code=class_obj.class_code,
        teacher_id=class_obj.teacher_id,
        teacher_name=class_obj.teacher.fullname,
        teacher_email=class_obj.teacher.email,
        created_at=class_obj.created_at,
        updated_at=class_obj.updated_at,
        is_active=class_obj.is_active,
        student_count=student_count,
        assignment_count=assignment_count,
        user_role=enrollment.role.value,
    )


@router.patch("/{class_id}", response_model=ClassRead)
async def update_class(
    class_id: int,
    class_update: ClassUpdate,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Update class (teacher only)"""
    
    # Get class
    result = await session.execute(
        select(Class).where(Class.id == class_id)
    )
    class_obj = result.scalar_one_or_none()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if current user is the teacher
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can update this class"
        )
    
    # Update fields
    update_data = class_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(class_obj, field, value)
    
    try:
        await session.commit()
        await session.refresh(class_obj)
        
        # Count students and assignments
        from sqlalchemy import func
        from models.class_model import Assignment
        
        student_count_result = await session.execute(
            select(func.count(ClassEnrollment.id))
            .where(
                and_(
                    ClassEnrollment.class_id == class_id,
                    ClassEnrollment.role == ClassRole.STUDENT
                )
            )
        )
        student_count = student_count_result.scalar()
        
        assignment_count_result = await session.execute(
            select(func.count(Assignment.id))
            .where(Assignment.class_id == class_id)
        )
        assignment_count = assignment_count_result.scalar()
        
        return ClassRead(
            id=class_obj.id,
            class_name=class_obj.class_name,
            subject=class_obj.subject,
            description=class_obj.description,
            class_code=class_obj.class_code,
            teacher_id=class_obj.teacher_id,
            teacher_name=current_user.fullname,
            teacher_email=current_user.email,
            created_at=class_obj.created_at,
            updated_at=class_obj.updated_at,
            is_active=class_obj.is_active,
            student_count=student_count,
            assignment_count=assignment_count,
            user_role="teacher",
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update class: {str(e)}"
        )


@router.delete("/{class_id}")
async def delete_class(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete class (teacher only)"""
    
    # Get class
    result = await session.execute(
        select(Class).where(Class.id == class_id)
    )
    class_obj = result.scalar_one_or_none()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if current user is the teacher
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can delete this class"
        )
    
    try:
        await session.delete(class_obj)
        await session.commit()
        return {"message": "Class deleted successfully"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete class: {str(e)}"
        )


@router.post("/{class_id}/archive", status_code=status.HTTP_204_NO_CONTENT)
async def archive_class(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Archive a class (no return value)"""
    
    # Get class
    result = await session.execute(
        select(Class).where(Class.id == class_id)
    )
    class_obj = result.scalar_one_or_none()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if current user is the teacher
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can archive this class"
        )
    
    # Set is_active to False
    class_obj.is_active = False
    
    try:
        await session.commit()
        # No return value (204 No Content)
        return None
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to archive class: {str(e)}"
        )


@router.post("/{class_id}/unarchive", status_code=status.HTTP_204_NO_CONTENT)
async def unarchive_class(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Unarchive a class (no return value)"""
    
    # Get class
    result = await session.execute(
        select(Class).where(Class.id == class_id)
    )
    class_obj = result.scalar_one_or_none()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if current user is the teacher
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can unarchive this class"
        )
    
    # Set is_active to True
    class_obj.is_active = True
    
    try:
        await session.commit()
        # No return value (204 No Content)
        return None
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unarchive class: {str(e)}"
        )


@router.post("/{class_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_class(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Leave a class as student (no return value)"""
    
    # Get enrollment
    enrollment_result = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == class_id,
                ClassEnrollment.user_id == current_user.id
            )
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not enrolled in this class"
        )
    
    # Don't allow teacher to leave
    if enrollment.role == ClassRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teachers cannot leave their own class. Delete the class instead."
        )
    
    try:
        await session.delete(enrollment)
        await session.commit()
        # No return value (204 No Content)
        return None
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to leave class: {str(e)}"
        )


@router.post("/{class_id}/copy-code", status_code=status.HTTP_204_NO_CONTENT)
async def copy_class_code(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Copy class code (analytics endpoint, no return value)"""
    
    # Get class
    result = await session.execute(
        select(Class).where(Class.id == class_id)
    )
    class_obj = result.scalar_one_or_none()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Check if user is enrolled
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == class_id,
                ClassEnrollment.user_id == current_user.id
            )
        )
    )
    
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # In real app, this might log the copy action for analytics
    # No return value (204 No Content)
    return None
