"""
Dashboard Routes Module

Purpose: API routes for engineer and manager dashboard data
Features:
- Engineer dashboard data endpoint
- Manager dashboard data endpoint (with team information)
- Skill update functionality for managers
- Additional skills management

Endpoints:
- GET /data/engineer: Get engineer dashboard data
- GET /data/manager/dashboard: Get manager dashboard data
- PATCH /data/manager/team-skill: Update team member skill levels

@author Orbit Skill Development Team
@date 2025
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, func
from datetime import datetime, date
from app.database import get_db_async
# Ensure you import your AdditionalSkill model
from app.models import (
    User, ManagerEmployee, EmployeeCompetency, AdditionalSkill, TrainingDetail, 
    TrainingAssignment, TrainingRequest, TrainingAttendance, AssignmentSubmission,
    ManagerPerformanceFeedback
)
from app.auth_utils import get_current_active_user, get_current_active_manager, get_current_active_admin
from app.utils import calculate_weighted_actual_progress
from pydantic import BaseModel

# Create a single router for both endpoints with a common prefix
router = APIRouter(prefix="/data", tags=["Dashboard"])


@router.get("/admin/trainers")
async def get_admin_trainers(
    current_user: dict = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db_async)
):
    """Return unique list of trainers (manager or employee flagged as trainer)."""
    manager_trainers_result = await db.execute(
        select(func.distinct(ManagerEmployee.manager_empid), ManagerEmployee.manager_name)
        .where(ManagerEmployee.manager_is_trainer == True)
    )
    employee_trainers_result = await db.execute(
        select(func.distinct(ManagerEmployee.employee_empid), ManagerEmployee.employee_name)
        .where(ManagerEmployee.employee_is_trainer == True)
    )

    manager_rows = manager_trainers_result.all()
    employee_rows = employee_trainers_result.all()

    # Determine which usernames are managers in the mapping table
    manager_usernames_result = await db.execute(select(func.distinct(ManagerEmployee.manager_empid)))
    manager_usernames = set(manager_usernames_result.scalars().all())

    trainers_by_username: dict[str, dict] = {}
    for username, name in manager_rows:
        if not username:
            continue
        trainers_by_username[username] = {
            "username": username,
            "name": name or username,
            "role": "manager" if username in manager_usernames else "employee",
        }

    for username, name in employee_rows:
        if not username:
            continue
        if username in trainers_by_username:
            # Prefer a non-empty name if we already have the user from manager list
            if name and trainers_by_username[username].get("name") in (None, "", username):
                trainers_by_username[username]["name"] = name
            continue
        trainers_by_username[username] = {
            "username": username,
            "name": name or username,
            "role": "manager" if username in manager_usernames else "employee",
        }

    trainers = sorted(trainers_by_username.values(), key=lambda x: (x["name"] or "", x["username"]))
    return {"trainers": trainers, "total": len(trainers)}

# Pydantic models for API requests
class SkillUpdateRequest(BaseModel):
    """Request schema for updating team member skill levels"""
    employee_username: str
    skill_name: str
    current_expertise: str
    target_expertise: str

# Helper function to get status based on string levels
def get_status_from_levels(current_level_str: str, target_level_str: str) -> str:
    """
    Compares two level strings (e.g., 'L0', 'L2' or 'Beginner', 'Expert') to determine competency status.
    
    Supports both L-format (L1-L5) and text format (Beginner, Intermediate, Advanced, Expert).
    Returns 'Met' if current >= target, 'Gap' if current < target, 'Error' if invalid.
    
    Args:
        current_level_str: Current expertise level
        target_level_str: Target expertise level
        
    Returns:
        str: 'Met', 'Gap', or 'Error'
    """
    # Check for None values and return 'Error' immediately
    if current_level_str is None or target_level_str is None:
        return "Error"

    def convert_to_numeric(level_str: str) -> int:
        """Convert level string to numeric value for comparison"""
        level_str = level_str.strip()

        # Handle L-format (L0, L1, L2, L3, L4, L5)
        if level_str.upper().startswith('L'):
            return int(level_str.upper().lstrip('L'))

        # Handle text format (Beginner, Intermediate, Advanced, Expert)
        level_mapping = {
            'BEGINNER': 1,
            'INTERMEDIATE': 2,
            'ADVANCED': 3,
            'EXPERT': 4
        }
        return level_mapping.get(level_str.upper(), -1)

    try:
        current_level_num = convert_to_numeric(current_level_str)
        target_level_num = convert_to_numeric(target_level_str)

        # If either conversion failed, return Error
        if current_level_num == -1 or target_level_num == -1:
            return "Error"

        if current_level_num >= target_level_num:
            return "Met"
        else:
            return "Gap"
    except (ValueError, IndexError, TypeError):
        return "Error"

async def get_weighted_actual_progress_for_skill(
    employee_username: str,
    skill_name: str,
    db: AsyncSession
) -> int:
    """
    Calculate weighted actual progress for a skill based on:
    1. Training Completion (30%): Attendance status
    2. Assignment Score (40%): Quiz/assignment performance  
    3. Manager Feedback (30%): Average of manager performance ratings
    
    Args:
        employee_username: Employee ID
        skill_name: Skill name
        db: Database session
        
    Returns:
        int: Weighted actual progress (0-100)
    """
    # Fetch all training assignments for this skill
    assignments_result = await db.execute(
        select(
            TrainingAssignment.id,
            TrainingAssignment.training_id,
            TrainingDetail.skill
        ).join(
            TrainingDetail,
            TrainingDetail.id == TrainingAssignment.training_id
        ).where(
            TrainingAssignment.employee_empid == employee_username,
            TrainingDetail.skill == skill_name
        )
    )
    assignments = assignments_result.all()
    
    if not assignments:
        return 0
    
    # Collect metrics from all assignments for this skill
    training_completed = False
    assignment_scores = []
    feedback_ratings = []
    
    for assignment in assignments:
        training_id = assignment[1]
        assignment_id = assignment[0]
        
        # Check training attendance
        attendance_result = await db.execute(
            select(TrainingAttendance.attended).where(
                TrainingAttendance.training_id == training_id,
                TrainingAttendance.employee_empid == employee_username
            )
        )
        attendance = attendance_result.scalar_one_or_none()
        if attendance:
            training_completed = True
        
        # Get assignment submission score
        submission_result = await db.execute(
            select(AssignmentSubmission.score).where(
                AssignmentSubmission.training_id == training_id,
                AssignmentSubmission.employee_empid == employee_username
            ).order_by(AssignmentSubmission.submitted_at.desc())
        )
        submission = submission_result.scalars().first()
        if submission is not None:
            assignment_scores.append(submission)
        
        # Get manager performance feedback ratings
        feedback_result = await db.execute(
            select(
                ManagerPerformanceFeedback.application_of_training,
                ManagerPerformanceFeedback.quality_of_deliverables,
                ManagerPerformanceFeedback.problem_solving_capability,
                ManagerPerformanceFeedback.productivity_independence,
                ManagerPerformanceFeedback.process_compliance_adherence,
                ManagerPerformanceFeedback.overall_performance
            ).where(
                ManagerPerformanceFeedback.training_id == training_id,
                ManagerPerformanceFeedback.employee_empid == employee_username
            )
        )
        feedback = feedback_result.first()
        if feedback:
            # Collect all non-null ratings
            ratings = [r for r in feedback if r is not None]
            feedback_ratings.extend(ratings)
    
    # Calculate average assignment score
    avg_assignment_score = None
    if assignment_scores:
        avg_assignment_score = sum(assignment_scores) / len(assignment_scores)
    
    # Calculate weighted actual progress
    return calculate_weighted_actual_progress(
        training_attended=training_completed,
        assignment_score=int(avg_assignment_score) if avg_assignment_score is not None else None,
        manager_feedback_ratings=feedback_ratings
    )

@router.get("/manager/dashboard")
async def get_manager_data(
    current_user: dict = Depends(get_current_active_manager),
    db: AsyncSession = Depends(get_db_async)
):
    """
    Fetches dashboard data for a manager, including their own skills 
    and their team's core AND additional skills.
    """
    manager_username = current_user.get("username")

    # Resolve manager display name from ManagerEmployee table if available
    manager_name_result = await db.execute(
        select(ManagerEmployee.manager_name).where(ManagerEmployee.manager_empid == manager_username)
    )
    manager_name_row = manager_name_result.first()
    manager_display_name = manager_name_row[0] if manager_name_row and manager_name_row[0] else manager_username

    # Fetch manager's own skills
    manager_skills_result = await db.execute(
        select(EmployeeCompetency).where(EmployeeCompetency.employee_empid == manager_username)
    )
    manager_skills_orm = manager_skills_result.scalars().all()

    # Fetch training assignments for manager (to get assignment dates and target dates for their own skills)
    manager_assignments_result = await db.execute(
        select(
            TrainingAssignment.id,
            TrainingAssignment.training_id,
            TrainingAssignment.assignment_date,
            TrainingAssignment.target_date,
            TrainingDetail.skill,
            TrainingDetail.competency
        ).join(
            TrainingDetail,
            TrainingDetail.id == TrainingAssignment.training_id
        ).where(
            TrainingAssignment.employee_empid == manager_username
        )
    )
    manager_assignments_data = manager_assignments_result.all()

    # Build a map: (skill, competency) -> (assignment_start_date, target_completion_date)
    manager_assignment_map = {}
    for assignment in manager_assignments_data:
        skill = assignment[4]
        competency = assignment[5]
        assignment_date = assignment[2]
        target_date = assignment[3]
        
        key = (skill, competency)
        if key not in manager_assignment_map:
            manager_assignment_map[key] = {
                "assignment_start_date": assignment_date,
                "target_completion_date": target_date
            }
        else:
            # Use earliest assignment date
            if assignment_date and (not manager_assignment_map[key]["assignment_start_date"] or 
                                   assignment_date < manager_assignment_map[key]["assignment_start_date"]):
                manager_assignment_map[key]["assignment_start_date"] = assignment_date
            # Use latest target date
            if target_date and (not manager_assignment_map[key]["target_completion_date"] or 
                               target_date > manager_assignment_map[key]["target_completion_date"]):
                manager_assignment_map[key]["target_completion_date"] = target_date

    def to_iso(val):
        """Convert date/datetime to ISO string format"""
        if val is None:
            return None
        if isinstance(val, str):
            try:
                return datetime.fromisoformat(val).date().isoformat()
            except Exception:
                return val
        if isinstance(val, datetime):
            return val.date().isoformat()
        if isinstance(val, date):
            return val.isoformat()
        return None

    manager_skills_list = []
    for comp in manager_skills_orm:
        skill_obj = {
            "skill": comp.skill,
            "competency": comp.competency,
            "current_expertise": comp.current_expertise,
            "target_expertise": comp.target_expertise,
            "status": get_status_from_levels(comp.current_expertise, comp.target_expertise)
        }
        
        # Add assignment dates if available
        key = (comp.skill, comp.competency)
        if key in manager_assignment_map:
            assignment_info = manager_assignment_map[key]
            skill_obj["assignment_start_date"] = to_iso(assignment_info["assignment_start_date"])
            skill_obj["target_completion_date"] = to_iso(assignment_info["target_completion_date"])
        
        manager_skills_list.append(skill_obj)

    # Fetch manager_is_trainer from ManagerEmployee table
    manager_trainer_result = await db.execute(
        select(ManagerEmployee.manager_is_trainer).where(ManagerEmployee.manager_empid == manager_username)
    )
    manager_is_trainer_row = manager_trainer_result.first()
    manager_is_trainer = manager_is_trainer_row[0] if manager_is_trainer_row else False
    
    # Step 1: Get all employee IDs and names reporting to the current manager
    manager_relations_result = await db.execute(
        select(ManagerEmployee.employee_empid, ManagerEmployee.employee_name).where(ManagerEmployee.manager_empid == manager_username)
    )
    team_members = manager_relations_result.all()
    team_member_usernames = [member.employee_empid for member in team_members]
    team_member_names = {member.employee_empid: member.employee_name for member in team_members}

    # Step 2: Prepare the base structure for all team members, including 'additional_skills'
    team_members_data = {
        username: {"id": username, "name": team_member_names.get(username, username), "skills": [], "additional_skills": []}
        for username in team_member_usernames
    }
    
    if not team_member_usernames:
        return {
            "name": manager_display_name,
            "role": "manager",
            "id": manager_username,
            "skills": manager_skills_list,
            "team": [],
            "manager_is_trainer": manager_is_trainer
        }

    # Step 3: Fetch all CORE competency data for the team members in a single query
    competencies_result = await db.execute(
        select(EmployeeCompetency).where(EmployeeCompetency.employee_empid.in_(team_member_usernames))
    )
    competencies_data = competencies_result.scalars().all()

    # Step 3.5: Fetch training assignments for all team members made by this manager
    team_assignments_result = await db.execute(
        select(
            TrainingAssignment.id,
            TrainingAssignment.training_id,
            TrainingAssignment.assignment_date,
            TrainingAssignment.target_date,
            TrainingAssignment.employee_empid,
            TrainingDetail.skill,
            TrainingDetail.competency
        ).join(
            TrainingDetail,
            TrainingDetail.id == TrainingAssignment.training_id
        ).where(
            TrainingAssignment.employee_empid.in_(team_member_usernames),
            TrainingAssignment.manager_empid == manager_username
        )
    )
    team_assignments_data = team_assignments_result.all()

    # Build a nested map: employee_empid -> (skill, competency) -> (assignment_start_date, target_completion_date)
    team_assignment_map = {}
    for assignment in team_assignments_data:
        employee_empid = assignment[4]
        skill = assignment[5]
        competency = assignment[6]
        assignment_date = assignment[2]
        target_date = assignment[3]
        
        if employee_empid not in team_assignment_map:
            team_assignment_map[employee_empid] = {}
        
        key = (skill, competency)
        if key not in team_assignment_map[employee_empid]:
            team_assignment_map[employee_empid][key] = {
                "assignment_start_date": assignment_date,
                "target_completion_date": target_date
            }
        else:
            # Use earliest assignment date
            if assignment_date and (not team_assignment_map[employee_empid][key]["assignment_start_date"] or 
                                   assignment_date < team_assignment_map[employee_empid][key]["assignment_start_date"]):
                team_assignment_map[employee_empid][key]["assignment_start_date"] = assignment_date
            # Use latest target date
            if target_date and (not team_assignment_map[employee_empid][key]["target_completion_date"] or 
                               target_date > team_assignment_map[employee_empid][key]["target_completion_date"]):
                team_assignment_map[employee_empid][key]["target_completion_date"] = target_date
    
    # Step 4: Populate the CORE skills for each team member
    for competency in competencies_data:
        username = competency.employee_empid
        if username in team_members_data:
            status_val = get_status_from_levels(competency.current_expertise, competency.target_expertise)
            
            skill_obj = {
                "skill": competency.skill,
                "competency": competency.competency,
                "current_expertise": competency.current_expertise,
                "target_expertise": competency.target_expertise,
                "status": status_val
            }
            
            # Add assignment dates if available from manager's assignments
            key = (competency.skill, competency.competency)
            if username in team_assignment_map and key in team_assignment_map[username]:
                assignment_info = team_assignment_map[username][key]
                skill_obj["assignment_start_date"] = to_iso(assignment_info["assignment_start_date"])
                skill_obj["target_completion_date"] = to_iso(assignment_info["target_completion_date"])
            
            team_members_data[username]["skills"].append(skill_obj)
    
    # Step 5: Fetch all ADDITIONAL skill data for the team in a single query
    additional_skills_result = await db.execute(
        select(AdditionalSkill).where(AdditionalSkill.employee_empid.in_(team_member_usernames))
    )
    additional_skills_data = additional_skills_result.scalars().all()

    # Step 6: Populate the ADDITIONAL skills for each team member
    for add_skill in additional_skills_data:
        username = add_skill.employee_empid
        if username in team_members_data:
            team_members_data[username]["additional_skills"].append({
                "id": add_skill.id,
                "skill_name": add_skill.skill_name,
                "skill_level": add_skill.skill_level,
                "skill_category": add_skill.skill_category,
                "description": add_skill.description,
                "created_at": add_skill.created_at.isoformat() if add_skill.created_at else None
            })

    return {
        "name": manager_display_name,
        "role": "manager",
        "id": manager_username,
        "skills": manager_skills_list,
        "team": list(team_members_data.values()),
        "manager_is_trainer": manager_is_trainer
    }

@router.get("/engineer")
async def get_engineer_data(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_async)
):
    """
    Fetches skill competency data for a single engineer.
    """
    employee_username = current_user.get("username")

    if current_user.get("role") != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )

    # MODIFIED: Fetch employee's name and trainer status in one query
    employee_details_result = await db.execute(
        select(
            ManagerEmployee.employee_name,
            ManagerEmployee.employee_is_trainer
        ).where(ManagerEmployee.employee_empid == employee_username)
    )
    employee_details = employee_details_result.first()

    # Safely unpack details, providing default values if the employee is not found
    employee_name = employee_details.employee_name if employee_details else None
    is_trainer = employee_details.employee_is_trainer if employee_details else False
    
    # Fetch user ID
    user_id_result = await db.execute(
        select(User.id).where(User.username == employee_username)
    )
    user_id = user_id_result.scalar_one_or_none()

    # Fetch employee's competencies
    competencies_result = await db.execute(
        select(EmployeeCompetency).where(EmployeeCompetency.employee_empid == employee_username)
    )
    competencies_orm = competencies_result.scalars().all()

    skills_list = [
        {
            "id": comp.id,
            "skill": comp.skill,
            "current_expertise": comp.current_expertise,
            "target_expertise": comp.target_expertise,
            "status": get_status_from_levels(comp.current_expertise, comp.target_expertise),
        }
        for comp in competencies_orm
    ]

    # MODIFIED: Added 'employee_is_trainer' to the response
    return {
        "username": employee_username,
        "employee_name": employee_name,
        "employee_id": user_id,
        "employee_is_trainer": is_trainer,
        "skills": skills_list
    }

@router.get("/engineer/skills-with-assignments")
async def get_engineer_skills_with_assignments(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db_async)
):
    """
    Fetches skill competency data for a single engineer enriched with training assignment information.
    Includes assignment_start_date and target_completion_date for each skill.
    """
    employee_username = current_user.get("username")

    if current_user.get("role") != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )

    # Fetch employee's competencies
    competencies_result = await db.execute(
        select(EmployeeCompetency).where(EmployeeCompetency.employee_empid == employee_username)
    )
    competencies_orm = competencies_result.scalars().all()

    # Fetch all training assignments for this employee
    assignments_result = await db.execute(
        select(
            TrainingAssignment.id,
            TrainingAssignment.training_id,
            TrainingAssignment.assignment_date,
            TrainingAssignment.target_date,
            TrainingDetail.skill,
            TrainingDetail.competency
        ).join(
            TrainingDetail,
            TrainingDetail.id == TrainingAssignment.training_id
        ).where(
            TrainingAssignment.employee_empid == employee_username
        )
    )
    assignments_data = assignments_result.all()

    # Build a map: (skill, competency) -> (assignment_start_date, target_completion_date)
    # Use the earliest assignment date and the latest target date for each skill
    assignment_map = {}
    for assignment in assignments_data:
        skill = assignment[4]
        competency = assignment[5]
        assignment_date = assignment[2]  # assignment_date from TrainingAssignment
        target_date = assignment[3]  # target_date from TrainingAssignment
        
        key = (skill, competency)
        if key not in assignment_map:
            assignment_map[key] = {
                "assignment_start_date": assignment_date,
                "target_completion_date": target_date
            }
        else:
            # Use earliest assignment date
            if assignment_date and (not assignment_map[key]["assignment_start_date"] or 
                                   assignment_date < assignment_map[key]["assignment_start_date"]):
                assignment_map[key]["assignment_start_date"] = assignment_date
            # Use latest target date
            if target_date and (not assignment_map[key]["target_completion_date"] or 
                               target_date > assignment_map[key]["target_completion_date"]):
                assignment_map[key]["target_completion_date"] = target_date

    def to_iso(val):
        """Convert date/datetime to ISO string format"""
        if val is None:
            return None
        if isinstance(val, str):
            try:
                return datetime.fromisoformat(val).date().isoformat()
            except Exception:
                return val
        if isinstance(val, datetime):
            return val.date().isoformat()
        if isinstance(val, date):
            return val.isoformat()
        return None

    skills_list = []
    for comp in competencies_orm:
        skill_obj = {
            "id": comp.id,
            "skill": comp.skill,
            "current_expertise": comp.current_expertise,
            "target_expertise": comp.target_expertise,
            "status": get_status_from_levels(comp.current_expertise, comp.target_expertise),
        }
        
        # Add assignment dates if available
        key = (comp.skill, comp.competency)
        if key in assignment_map:
            assignment_info = assignment_map[key]
            skill_obj["assignment_start_date"] = to_iso(assignment_info["assignment_start_date"])
            skill_obj["target_completion_date"] = to_iso(assignment_info["target_completion_date"])
        
        # Calculate and add weighted actual progress for the skill
        weighted_progress = await get_weighted_actual_progress_for_skill(
            employee_username,
            comp.skill,
            db
        )
        skill_obj["weighted_actual_progress"] = weighted_progress
        
        skills_list.append(skill_obj)

    # Fetch employee details
    employee_details_result = await db.execute(
        select(
            ManagerEmployee.employee_name,
            ManagerEmployee.employee_is_trainer
        ).where(ManagerEmployee.employee_empid == employee_username)
    )
    employee_details = employee_details_result.first()
    employee_name = employee_details.employee_name if employee_details else None
    is_trainer = employee_details.employee_is_trainer if employee_details else False

    user_id_result = await db.execute(
        select(User.id).where(User.username == employee_username)
    )
    user_id = user_id_result.scalar_one_or_none()

    return {
        "username": employee_username,
        "employee_name": employee_name,
        "employee_id": user_id,
        "employee_is_trainer": is_trainer,
        "skills": skills_list
    }

@router.put("/manager/team-skill")
async def update_team_member_skill(
    skill_update: SkillUpdateRequest,
    current_manager: dict = Depends(get_current_active_manager),
    db: AsyncSession = Depends(get_db_async)
):
    """
    Update a team member's skill current and target expertise levels.
    """
    try:
        # Verify the employee is part of the manager's team
        team_check_result = await db.execute(
            select(ManagerEmployee.employee_empid)
            .where(
                ManagerEmployee.manager_empid == current_manager['username'],
                ManagerEmployee.employee_empid == skill_update.employee_username
            )
        )
        if not team_check_result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update skills for your team members"
            )

        new_status = get_status_from_levels(
            skill_update.current_expertise,
            skill_update.target_expertise
        )

        update_stmt = (
            update(EmployeeCompetency)
            .where(
                EmployeeCompetency.employee_empid == skill_update.employee_username,
                EmployeeCompetency.skill == skill_update.skill_name
            )
            .values(
                current_expertise=skill_update.current_expertise,
                target_expertise=skill_update.target_expertise
            )
        )
        result = await db.execute(update_stmt)

        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found for this employee"
            )

        await db.commit()

        return {
            "message": "Skill updated successfully",
            "employee_username": skill_update.employee_username,
            "skill_name": skill_update.skill_name,
            "current_expertise": skill_update.current_expertise,
            "target_expertise": skill_update.target_expertise,
            "status": new_status
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update skill: {str(e)}"
        )

@router.get("/admin/dashboard")
async def get_admin_dashboard_data(
    current_user: dict = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db_async)
):
    """
    Get admin dashboard data with metrics and overview.
    """
    admin_username = current_user.get("username")
    
    # Get admin name
    admin_name_result = await db.execute(
        select(ManagerEmployee.manager_name).where(ManagerEmployee.manager_empid == admin_username)
    )
    admin_name_row = admin_name_result.first()
    admin_name = admin_name_row[0] if admin_name_row else admin_username
    
    if admin_name == admin_username:
        emp_name_result = await db.execute(
            select(ManagerEmployee.employee_name).where(ManagerEmployee.employee_empid == admin_username)
        )
        emp_name_row = emp_name_result.first()
        admin_name = emp_name_row[0] if emp_name_row else admin_username
    
    # Calculate metrics
    total_users = await db.execute(select(func.count(User.id)))
    total_users_count = total_users.scalar() or 0
    
    total_trainings = await db.execute(select(func.count(TrainingDetail.id)))
    total_trainings_count = total_trainings.scalar() or 0
    
    total_assignments = await db.execute(select(func.count(TrainingAssignment.id)))
    total_assignments_count = total_assignments.scalar() or 0

    # Attendance rate (overall): attended assignments / total assignments
    # Note: attendance rows may not exist for every assignment until marked.
    attended_assignments = await db.execute(
        select(func.count(TrainingAttendance.id)).where(TrainingAttendance.attended == True)
    )
    attended_assignments_count = attended_assignments.scalar() or 0
    attendance_rate = round((attended_assignments_count / total_assignments_count) * 100, 2) if total_assignments_count else 0
    
    total_skills = await db.execute(select(func.count(EmployeeCompetency.id)))
    total_skills_count = total_skills.scalar() or 0
    
    pending_requests = await db.execute(
        select(func.count(TrainingRequest.id)).where(TrainingRequest.status == 'pending')
    )
    pending_requests_count = pending_requests.scalar() or 0
    
    managers_count = await db.execute(
        select(func.count(func.distinct(ManagerEmployee.manager_empid)))
    )
    managers = managers_count.scalar() or 0
    
    employees_count = await db.execute(
        select(func.count(func.distinct(ManagerEmployee.employee_empid)))
    )
    employees = employees_count.scalar() or 0
    
    # Active trainers: unique usernames that are flagged as trainer either as manager or employee
    manager_trainer_usernames_result = await db.execute(
        select(func.distinct(ManagerEmployee.manager_empid)).where(ManagerEmployee.manager_is_trainer == True)
    )
    employee_trainer_usernames_result = await db.execute(
        select(func.distinct(ManagerEmployee.employee_empid)).where(ManagerEmployee.employee_is_trainer == True)
    )
    trainer_usernames = set(manager_trainer_usernames_result.scalars().all()) | set(employee_trainer_usernames_result.scalars().all())
    trainers = len({u for u in trainer_usernames if u})
    
    return {
        "admin_name": admin_name,
        "admin_id": admin_username,
        "metrics": {
            "total_users": total_users_count,
            "total_managers": managers,
            "total_employees": employees,
            "total_trainings": total_trainings_count,
            "total_assignments": total_assignments_count,
            "attended_assignments": attended_assignments_count,
            "attendance_rate": attendance_rate,
            "total_skills": total_skills_count,
            "pending_requests": pending_requests_count,
            "active_trainers": trainers
        }
    }
    