"""
Training Routes Module

Purpose: API routes for training management
Features:
- Create new training sessions (trainers only)
- Get all available trainings
- Get training by ID
- Update training details
- Delete training

Endpoints:
- POST /trainings/: Create a new training
- GET /trainings/: Get all trainings
- GET /trainings/{id}: Get training by ID
- PUT /trainings/{id}: Update training
- DELETE /trainings/{id}: Delete training

@author Orbit Skill Development Team
@date 2025
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import date, datetime

from app.database import get_db_async
from app.models import TrainingDetail, User, ManagerEmployee, TrainingAssignment, TrainingRecording
from app.schemas import TrainingCreate, TrainingResponse, TrainingRecordingResponse
from app.auth_utils import get_current_active_user

router = APIRouter(prefix="/trainings", tags=["Trainings"])

@router.post("/", response_model=TrainingResponse, status_code=status.HTTP_201_CREATED)
async def create_new_training(
    training_data: TrainingCreate,
    db: AsyncSession = Depends(get_db_async),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Endpoint for a designated trainer to create a new training module.
    It verifies the user's trainer status before proceeding.
    """
    current_username = current_user.get("username")
    if not current_username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    stmt = select(ManagerEmployee).where(
        (ManagerEmployee.manager_empid == current_username) | 
        (ManagerEmployee.employee_empid == current_username)
    )
    result = await db.execute(stmt)
    
    # CORRECTED: .scalars().first() correctly handles cases where a user (manager)
    # might appear in multiple rows. It safely gets the first match or None.
    relation = result.scalars().first()

    is_trainer = False
    if relation:
        if relation.manager_empid == current_username and relation.manager_is_trainer:
            is_trainer = True
        elif relation.employee_empid == current_username and relation.employee_is_trainer:
            is_trainer = True

    if not is_trainer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only designated trainers can create new training modules."
        )

    new_training = TrainingDetail(
        **training_data.dict(),
        trainer_name=current_username,
        email=current_username
    )

    db.add(new_training)
    await db.commit()
    await db.refresh(new_training)

    # If a lecture_url or description was provided, save it in the separate recordings table
    if getattr(training_data, 'lecture_url', None) or getattr(training_data, 'description', None):
        recording = TrainingRecording(
            training_id=new_training.id,
            lecture_url=getattr(training_data, 'lecture_url', None),
            description=getattr(training_data, 'description', None)
        )
        db.add(recording)
        await db.commit()
        await db.refresh(recording)

        # Attach values to training object so response_model still contains them
        new_training.lecture_url = recording.lecture_url
        new_training.description = recording.description

    return new_training

@router.get("/", response_model=List[TrainingResponse])
async def get_all_trainings(
    db: AsyncSession = Depends(get_db_async),
    current_user: dict = Depends(get_current_active_user) 
):
    """
    Fetches all training details for the Training Catalog.
    """
    if not current_user.get("username"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials for fetching trainings",
        )
        
    result = await db.execute(select(TrainingDetail).order_by(TrainingDetail.training_date.desc()))
    trainings = result.scalars().all()
    return trainings


@router.get("/recorded", response_model=List[TrainingRecordingResponse])
async def get_recorded_trainings(
    db: AsyncSession = Depends(get_db_async),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Returns recorded trainings stored in the `training_recordings` table joined
    with basic training details for display in the Recorded tab.
    """
    # Simple join: select recordings and load related training info
    stmt = select(TrainingRecording)
    result = await db.execute(stmt)
    recordings = result.scalars().all()

    # Eagerly load training details for each recording
    combined = []
    for rec in recordings:
        training = None
        try:
            stmt2 = select(TrainingDetail).where(TrainingDetail.id == rec.training_id)
            res2 = await db.execute(stmt2)
            training = res2.scalars().first()
        except Exception:
            training = None

        combined.append(
            TrainingRecordingResponse(
                id=rec.id,
                training_id=rec.training_id,
                training_name=getattr(training, 'training_name', None) if training else None,
                trainer_name=getattr(training, 'trainer_name', None) if training else None,
                skill=getattr(training, 'skill', None) if training else None,
                skill_category=getattr(training, 'skill_category', None) if training else None,
                lecture_url=rec.lecture_url,
                description=rec.description,
                created_at=rec.created_at
            )
        )

    return combined

@router.get("/my-trainings", response_model=List[TrainingResponse])
async def get_my_trainings(
    db: AsyncSession = Depends(get_db_async),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Returns trainings where the current user is the trainer.
    Uses the same verification logic as the candidates endpoint to ensure accurate matching.
    This ensures trainers can see all their trainings, even if trainer_name doesn't match exactly.
    """
    trainer_username = current_user.get("username")
    if not trainer_username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    # Get employee/manager name for matching
    employee_result = await db.execute(
        select(ManagerEmployee.employee_name).where(
            ManagerEmployee.employee_empid == trainer_username
        ).distinct()
    )
    employee_name = employee_result.scalar_one_or_none()
    
    manager_result = await db.execute(
        select(ManagerEmployee.manager_name).where(
            ManagerEmployee.manager_empid == trainer_username
        ).distinct()
    )
    manager_name = manager_result.scalar_one_or_none()
    
    display_name = employee_name or manager_name
    trainer_username_lower = str(trainer_username).lower().strip()
    display_name_lower = (display_name or "").lower().strip() if display_name else ""
    
    # Get all trainings
    all_trainings_stmt = select(TrainingDetail)
    all_trainings_result = await db.execute(all_trainings_stmt)
    all_trainings = all_trainings_result.scalars().all()
    
    # Filter trainings where current user is the trainer
    my_trainings = []
    for training in all_trainings:
        trainer_name = str(training.trainer_name or "").strip()
        if not trainer_name:
            continue
        
        trainer_name_lower = trainer_name.lower().strip()
        
        # Check if current user is the trainer using multiple matching strategies
        is_trainer = (
            trainer_username_lower == trainer_name_lower or
            (display_name_lower and display_name_lower == trainer_name_lower) or
            (trainer_username_lower in trainer_name_lower) or
            (display_name_lower and display_name_lower in trainer_name_lower) or
            (display_name_lower and trainer_name_lower in display_name_lower)
        )
        
        # Also check if trainer_name contains any part of display name (for cases like "Sharib Jawed" matching "Sharib")
        if not is_trainer and display_name_lower:
            name_parts = [part.strip() for part in display_name_lower.split() if len(part.strip()) > 2]
            for part in name_parts:
                if part in trainer_name_lower or trainer_name_lower in part:
                    is_trainer = True
                    break
        
        if is_trainer:
            my_trainings.append(training)
    
    # Sort by training date descending
    my_trainings.sort(key=lambda t: t.training_date if t.training_date else date.min, reverse=True)
    
    return my_trainings

