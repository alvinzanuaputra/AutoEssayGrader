from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from core.db import get_session
from core.auth import current_active_user
from models.user_model import User
from models.class_model import (
    Class, ClassEnrollment, ClassRole, 
    Assignment, AssignmentSubmission, SubmissionStatus
)


router = APIRouter(prefix="/api", tags=["assignments"])


# Pydantic Schemas
class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    max_score: int = 100
    deadline: Optional[datetime] = None


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    max_score: Optional[int] = None
    deadline: Optional[datetime] = None


class AssignmentRead(BaseModel):
    id: int
    class_id: int
    title: str
    description: Optional[str]
    max_score: int
    deadline: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    created_by: int
    creator_name: str
    submission_count: int = 0
    graded_count: int = 0

    class Config:
        from_attributes = True


class SubmissionRead(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    student_name: str
    student_email: str
    student_profile_picture: Optional[str]
    submission_text: Optional[str]
    file_url: Optional[str]
    submitted_at: Optional[datetime]
    status: str
    score: Optional[int]
    feedback: Optional[str]
    graded_at: Optional[datetime]
    graded_by: Optional[int]
    grader_name: Optional[str]

    class Config:
        from_attributes = True


@router.post("/classes/{class_id}/assignments", response_model=AssignmentRead, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    class_id: int,
    assignment_data: AssignmentCreate,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Create new assignment (teacher only)"""
    
    # Check if user is teacher of this class
    enrollment_result = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == class_id,
                ClassEnrollment.user_id == current_user.id,
                ClassEnrollment.role == ClassRole.TEACHER
            )
        )
    )
    enrollment = enrollment_result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can create assignments"
        )
    
    # Create assignment
    new_assignment = Assignment(
        class_id=class_id,
        title=assignment_data.title,
        description=assignment_data.description,
        max_score=assignment_data.max_score,
        deadline=assignment_data.deadline,
        created_by=current_user.id,
    )
    
    session.add(new_assignment)
    
    try:
        await session.commit()
        await session.refresh(new_assignment)
        
        # Create submission records for all students
        students_result = await session.execute(
            select(ClassEnrollment).where(
                and_(
                    ClassEnrollment.class_id == class_id,
                    ClassEnrollment.role == ClassRole.STUDENT
                )
            )
        )
        students = students_result.scalars().all()
        
        for student_enrollment in students:
            submission = AssignmentSubmission(
                assignment_id=new_assignment.id,
                student_id=student_enrollment.user_id,
                status=SubmissionStatus.NOT_SUBMITTED,
            )
            session.add(submission)
        
        await session.commit()
        
        return AssignmentRead(
            id=new_assignment.id,
            class_id=new_assignment.class_id,
            title=new_assignment.title,
            description=new_assignment.description,
            max_score=new_assignment.max_score,
            deadline=new_assignment.deadline,
            created_at=new_assignment.created_at,
            updated_at=new_assignment.updated_at,
            created_by=new_assignment.created_by,
            creator_name=current_user.fullname,
            submission_count=0,
            graded_count=0,
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create assignment: {str(e)}"
        )


@router.get("/classes/{class_id}/assignments", response_model=List[AssignmentRead])
async def get_class_assignments(
    class_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all assignments for a class"""
    
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
    
    # Get all assignments
    from sqlalchemy.orm import selectinload
    
    result = await session.execute(
        select(Assignment)
        .where(Assignment.class_id == class_id)
        .options(selectinload(Assignment.creator))
        .order_by(Assignment.created_at.desc())
    )
    assignments = result.scalars().all()
    
    assignments_data = []
    for assignment in assignments:
        # Count submissions
        submission_count_result = await session.execute(
            select(func.count(AssignmentSubmission.id))
            .where(
                and_(
                    AssignmentSubmission.assignment_id == assignment.id,
                    AssignmentSubmission.status.in_([SubmissionStatus.SUBMITTED, SubmissionStatus.LATE, SubmissionStatus.GRADED])
                )
            )
        )
        submission_count = submission_count_result.scalar()
        
        # Count graded submissions
        graded_count_result = await session.execute(
            select(func.count(AssignmentSubmission.id))
            .where(
                and_(
                    AssignmentSubmission.assignment_id == assignment.id,
                    AssignmentSubmission.status == SubmissionStatus.GRADED
                )
            )
        )
        graded_count = graded_count_result.scalar()
        
        assignments_data.append(AssignmentRead(
            id=assignment.id,
            class_id=assignment.class_id,
            title=assignment.title,
            description=assignment.description,
            max_score=assignment.max_score,
            deadline=assignment.deadline,
            created_at=assignment.created_at,
            updated_at=assignment.updated_at,
            created_by=assignment.created_by,
            creator_name=assignment.creator.fullname,
            submission_count=submission_count,
            graded_count=graded_count,
        ))
    
    return assignments_data


@router.get("/assignments/{assignment_id}", response_model=AssignmentRead)
async def get_assignment_detail(
    assignment_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get assignment details"""
    from sqlalchemy.orm import selectinload
    
    # Get assignment
    result = await session.execute(
        select(Assignment)
        .where(Assignment.id == assignment_id)
        .options(selectinload(Assignment.creator))
    )
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if user is enrolled in the class
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == assignment.class_id,
                ClassEnrollment.user_id == current_user.id
            )
        )
    )
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this class"
        )
    
    # Count submissions and graded
    submission_count_result = await session.execute(
        select(func.count(AssignmentSubmission.id))
        .where(
            and_(
                AssignmentSubmission.assignment_id == assignment.id,
                AssignmentSubmission.status.in_([SubmissionStatus.SUBMITTED, SubmissionStatus.LATE, SubmissionStatus.GRADED])
            )
        )
    )
    submission_count = submission_count_result.scalar()
    
    graded_count_result = await session.execute(
        select(func.count(AssignmentSubmission.id))
        .where(
            and_(
                AssignmentSubmission.assignment_id == assignment.id,
                AssignmentSubmission.status == SubmissionStatus.GRADED
            )
        )
    )
    graded_count = graded_count_result.scalar()
    
    return AssignmentRead(
        id=assignment.id,
        class_id=assignment.class_id,
        title=assignment.title,
        description=assignment.description,
        max_score=assignment.max_score,
        deadline=assignment.deadline,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
        created_by=assignment.created_by,
        creator_name=assignment.creator.fullname,
        submission_count=submission_count,
        graded_count=graded_count,
    )


@router.get("/assignments/{assignment_id}/submissions", response_model=List[SubmissionRead])
async def get_assignment_submissions(
    assignment_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all submissions for an assignment (teacher only)"""
    from sqlalchemy.orm import selectinload
    
    # Get assignment
    assignment_result = await session.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = assignment_result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if user is teacher of this class
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == assignment.class_id,
                ClassEnrollment.user_id == current_user.id,
                ClassEnrollment.role == ClassRole.TEACHER
            )
        )
    )
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can view all submissions"
        )
    
    # Get all submissions
    result = await session.execute(
        select(AssignmentSubmission)
        .where(AssignmentSubmission.assignment_id == assignment_id)
        .options(
            selectinload(AssignmentSubmission.student),
            selectinload(AssignmentSubmission.grader)
        )
    )
    submissions = result.scalars().all()
    
    submissions_data = []
    for submission in submissions:
        submissions_data.append(SubmissionRead(
            id=submission.id,
            assignment_id=submission.assignment_id,
            student_id=submission.student_id,
            student_name=submission.student.fullname,
            student_email=submission.student.email,
            student_profile_picture=submission.student.profile_picture,
            submission_text=submission.submission_text,
            file_url=submission.file_url,
            submitted_at=submission.submitted_at,
            status=submission.status.value,
            score=submission.score,
            feedback=submission.feedback,
            graded_at=submission.graded_at,
            graded_by=submission.graded_by,
            grader_name=submission.grader.fullname if submission.grader else None,
        ))
    
    return submissions_data


@router.patch("/assignments/{assignment_id}", response_model=AssignmentRead)
async def update_assignment(
    assignment_id: int,
    assignment_update: AssignmentUpdate,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Update assignment (teacher only)"""
    from sqlalchemy.orm import selectinload
    
    # Get assignment
    result = await session.execute(
        select(Assignment)
        .where(Assignment.id == assignment_id)
        .options(selectinload(Assignment.creator))
    )
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if user is teacher
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == assignment.class_id,
                ClassEnrollment.user_id == current_user.id,
                ClassEnrollment.role == ClassRole.TEACHER
            )
        )
    )
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can update assignments"
        )
    
    # Update fields
    update_data = assignment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assignment, field, value)
    
    try:
        await session.commit()
        await session.refresh(assignment)
        
        # Count submissions and graded
        submission_count_result = await session.execute(
            select(func.count(AssignmentSubmission.id))
            .where(
                and_(
                    AssignmentSubmission.assignment_id == assignment.id,
                    AssignmentSubmission.status.in_([SubmissionStatus.SUBMITTED, SubmissionStatus.LATE, SubmissionStatus.GRADED])
                )
            )
        )
        submission_count = submission_count_result.scalar()
        
        graded_count_result = await session.execute(
            select(func.count(AssignmentSubmission.id))
            .where(
                and_(
                    AssignmentSubmission.assignment_id == assignment.id,
                    AssignmentSubmission.status == SubmissionStatus.GRADED
                )
            )
        )
        graded_count = graded_count_result.scalar()
        
        return AssignmentRead(
            id=assignment.id,
            class_id=assignment.class_id,
            title=assignment.title,
            description=assignment.description,
            max_score=assignment.max_score,
            deadline=assignment.deadline,
            created_at=assignment.created_at,
            updated_at=assignment.updated_at,
            created_by=assignment.created_by,
            creator_name=assignment.creator.fullname,
            submission_count=submission_count,
            graded_count=graded_count,
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update assignment: {str(e)}"
        )


@router.delete("/assignments/{assignment_id}")
async def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete assignment (teacher only)"""
    
    # Get assignment
    result = await session.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if user is teacher
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == assignment.class_id,
                ClassEnrollment.user_id == current_user.id,
                ClassEnrollment.role == ClassRole.TEACHER
            )
        )
    )
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can delete assignments"
        )
    
    try:
        await session.delete(assignment)
        await session.commit()
        return {"message": "Assignment deleted successfully"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete assignment: {str(e)}"
        )


@router.post("/assignments/{assignment_id}/publish", status_code=status.HTTP_204_NO_CONTENT)
async def publish_assignment(
    assignment_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Publish assignment to students (no return value)"""
    
    # Get assignment
    result = await session.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if user is teacher
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == assignment.class_id,
                ClassEnrollment.user_id == current_user.id,
                ClassEnrollment.role == ClassRole.TEACHER
            )
        )
    )
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can publish assignments"
        )
    
    # In real app, this would send notifications to all students
    # No return value (204 No Content)
    return None


@router.post("/assignments/{assignment_id}/unpublish", status_code=status.HTTP_204_NO_CONTENT)
async def unpublish_assignment(
    assignment_id: int,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Unpublish assignment from students (no return value)"""
    
    # Get assignment
    result = await session.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if user is teacher
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == assignment.class_id,
                ClassEnrollment.user_id == current_user.id,
                ClassEnrollment.role == ClassRole.TEACHER
            )
        )
    )
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can unpublish assignments"
        )
    
    # In real app, this would hide the assignment from students
    # No return value (204 No Content)
    return None


class SubmissionData(BaseModel):
    submission_text: Optional[str] = None
    file_url: Optional[str] = None


@router.post("/assignments/{assignment_id}/submit", status_code=status.HTTP_204_NO_CONTENT)
async def submit_assignment(
    assignment_id: int,
    submission_data: SubmissionData,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Submit assignment as student (no return value)"""
    
    # Get assignment
    assignment_result = await session.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = assignment_result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if user is student in this class
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == assignment.class_id,
                ClassEnrollment.user_id == current_user.id,
                ClassEnrollment.role == ClassRole.STUDENT
            )
        )
    )
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only enrolled students can submit assignments"
        )
    
    # Get or create submission
    submission_result = await session.execute(
        select(AssignmentSubmission).where(
            and_(
                AssignmentSubmission.assignment_id == assignment_id,
                AssignmentSubmission.student_id == current_user.id
            )
        )
    )
    submission = submission_result.scalar_one_or_none()
    
    now = datetime.utcnow()
    is_late = assignment.deadline and now > assignment.deadline
    
    if submission:
        # Update existing submission
        submission.submission_text = submission_data.submission_text
        submission.file_url = submission_data.file_url
        submission.submitted_at = now
        submission.status = SubmissionStatus.LATE if is_late else SubmissionStatus.SUBMITTED
    else:
        # Create new submission
        submission = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=current_user.id,
            submission_text=submission_data.submission_text,
            file_url=submission_data.file_url,
            submitted_at=now,
            status=SubmissionStatus.LATE if is_late else SubmissionStatus.SUBMITTED,
        )
        session.add(submission)
    
    try:
        await session.commit()
        # No return value (204 No Content)
        return None
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit assignment: {str(e)}"
        )


class GradeData(BaseModel):
    score: float
    feedback: Optional[str] = None


@router.post("/submissions/{submission_id}/grade", status_code=status.HTTP_204_NO_CONTENT)
async def grade_submission(
    submission_id: int,
    grade_data: GradeData,
    current_user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Grade a student submission (no return value)"""
    
    # Get submission
    submission_result = await session.execute(
        select(AssignmentSubmission).where(AssignmentSubmission.id == submission_id)
    )
    submission = submission_result.scalar_one_or_none()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Get assignment
    assignment_result = await session.execute(
        select(Assignment).where(Assignment.id == submission.assignment_id)
    )
    assignment = assignment_result.scalar_one_or_none()
    
    # Check if user is teacher
    enrollment_check = await session.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.class_id == assignment.class_id,
                ClassEnrollment.user_id == current_user.id,
                ClassEnrollment.role == ClassRole.TEACHER
            )
        )
    )
    if not enrollment_check.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the teacher can grade submissions"
        )
    
    # Validate score
    if grade_data.score < 0 or grade_data.score > assignment.max_score:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Score must be between 0 and {assignment.max_score}"
        )
    
    # Update submission
    submission.score = grade_data.score
    submission.feedback = grade_data.feedback
    submission.status = SubmissionStatus.GRADED
    submission.graded_at = datetime.utcnow()
    submission.graded_by = current_user.id
    
    try:
        await session.commit()
        # No return value (204 No Content)
        return None
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to grade submission: {str(e)}"
        )
