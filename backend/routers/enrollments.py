from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List
from datetime import datetime
from pydantic import BaseModel

from core.db import get_session
from core.auth import current_active_user
from models.user_model import User
from models.class_model import Class, ClassEnrollment, ClassRole


router = APIRouter(prefix="/api/classes", tags=["enrollments"])


# Pydantic Schemas
class EnrollmentCreate(BaseModel):
    class_code: str


class StudentAdd(BaseModel):
    email: str


class StudentRead(BaseModel):
    id: int
    user_id: int
    fullname: str
    username: str
    email: str
    profile_picture: str | None
    role: str
    enrolled_at: datetime

    class Config:
        from_attributes = True


@router.post("/enroll")
async def enroll_in_class_by_code(
    enrollment_data: EnrollmentCreate,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Enroll in a class using class code"""
    
    # Get class by code
    result = await session.execute(
        select(Class).where(Class.class_code == enrollment_data.class_code)
    )
    class_obj = result.scalar_one_or_none()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid class code"
        )
    
    # Check if user is already enrolled
    existing_enrollment = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == class_obj.id,
                ClassEnrollment.user_id == current_user.id
            )
        )
    )
    if existing_enrollment.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already enrolled in this class"
        )
    
    # Enroll user as student
    enrollment = ClassEnrollment(
        class_id=class_obj.id,
        user_id=current_user.id,
        role=ClassRole.STUDENT,
    )
    session.add(enrollment)
    
    try:
        await session.commit()
        return {"message": "Successfully enrolled in class", "class_id": class_obj.id}
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enroll: {str(e)}"
        )


@router.post("/{class_id}/enroll")
async def enroll_in_class(
    class_id: int,
    enrollment_data: EnrollmentCreate,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Enroll in a class using class code (deprecated - use /enroll instead)"""
    
    # Get class by code
    result = await session.execute(
        select(Class).where(Class.class_code == enrollment_data.class_code)
    )
    class_obj = result.scalar_one_or_none()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid class code"
        )
    
    # Check if user is already enrolled
    existing_enrollment = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == class_obj.id,
                ClassEnrollment.user_id == current_user.id
            )
        )
    )
    if existing_enrollment.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already enrolled in this class"
        )
    
    # Enroll user as student
    enrollment = ClassEnrollment(
        class_id=class_obj.id,
        user_id=current_user.id,
        role=ClassRole.STUDENT,
    )
    session.add(enrollment)
    
    try:
        await session.commit()
        return {"message": "Successfully enrolled in class", "class_id": class_obj.id}
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enroll: {str(e)}"
        )


@router.post("/{class_id}/students", response_model=StudentRead)
async def add_student_manually(
    class_id: int,
    student_data: StudentAdd,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Add student to class manually (teacher only)"""
    
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
            detail="Only the teacher can add students"
        )
    
    # Find user by email
    user_result = await session.execute(
        select(User).where(User.email == student_data.email)
    )
    student_user = user_result.scalar_one_or_none()
    
    if not student_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {student_data.email} not found"
        )
    
    # Check if user is already enrolled
    existing_enrollment = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == class_id,
                ClassEnrollment.user_id == student_user.id
            )
        )
    )
    if existing_enrollment.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in this class"
        )
    
    # Enroll student
    enrollment = ClassEnrollment(
        class_id=class_id,
        user_id=student_user.id,
        role=ClassRole.STUDENT,
    )
    session.add(enrollment)
    
    try:
        await session.commit()
        await session.refresh(enrollment)
        
        return StudentRead(
            id=enrollment.id,
            user_id=student_user.id,
            fullname=student_user.fullname,
            username=student_user.username,
            email=student_user.email,
            profile_picture=student_user.profile_picture,
            role=enrollment.role.value,
            enrolled_at=enrollment.enrolled_at,
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add student: {str(e)}"
        )


@router.get("/{class_id}/students", response_model=List[StudentRead])
async def get_class_students(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all students enrolled in a class"""
    
    # Check if user is enrolled in this class
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
    
    # Get all enrollments
    from sqlalchemy.orm import selectinload
    
    result = await session.execute(
        select(ClassEnrollment)
        .where(ClassEnrollment.class_id == class_id)
        .options(selectinload(ClassEnrollment.user))
    )
    enrollments = result.scalars().all()
    
    students_data = []
    for enrollment in enrollments:
        user = enrollment.user
        students_data.append(StudentRead(
            id=enrollment.id,
            user_id=user.id,
            fullname=user.fullname,
            username=user.username,
            email=user.email,
            profile_picture=user.profile_picture,
            role=enrollment.role.value,
            enrolled_at=enrollment.enrolled_at,
        ))
    
    return students_data


@router.delete("/{class_id}/students/{user_id}")
async def remove_student(
    class_id: int,
    user_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Remove student from class (teacher only)"""
    
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
            detail="Only the teacher can remove students"
        )
    
    # Get enrollment
    enrollment_result = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == class_id,
                ClassEnrollment.user_id == user_id
            )
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found in this class"
        )
    
    # Don't allow removing the teacher
    if enrollment.role == ClassRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the teacher from the class"
        )
    
    try:
        await session.delete(enrollment)
        await session.commit()
        return {"message": "Student removed successfully"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove student: {str(e)}"
        )


class InviteData(BaseModel):
    emails: List[str]


@router.post("/{class_id}/invite", status_code=status.HTTP_204_NO_CONTENT)
async def invite_students(
    class_id: int,
    invite_data: InviteData,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Invite students to class (no return value)"""
    
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
            detail="Only the teacher can invite students"
        )
    
    # Process invitations (in real app, this would send emails)
    # For now, just validate that we can process the request
    for email in invite_data.emails:
        # Here you would typically:
        # 1. Generate invitation token
        # 2. Send email with class code and invitation link
        # 3. Store invitation record in database
        pass
    
    # No return value (204 No Content)
    return None


@router.get("/{class_id}/participants", status_code=status.HTTP_204_NO_CONTENT)
async def view_class_participants(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """View class participants (no return value)"""
    
    # Check if user is enrolled in this class
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
    
    # In real app, this might log the view or update analytics
    # No return value (204 No Content)
    return None
