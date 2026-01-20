"""
Report Service Module

Purpose: Service layer for report generation and data aggregation
Features:
- Common report generation utilities
- Data aggregation functions
- Excel formatting helpers
- Chart data transformation

@author Orbit Skill Development Team
@date 2025
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_

from app.models import (
    User, ManagerEmployee, EmployeeCompetency, TrainingDetail,
    TrainingAssignment, TrainingAttendance, FeedbackSubmission,
    AssignmentSubmission, TrainingRequest, Trainer
)

class ReportService:
    """Service class for report generation and data aggregation"""
    
    @staticmethod
    async def get_employee_name(db: AsyncSession, empid: str) -> str:
        """Get employee name from manager_employee table"""
        result = await db.execute(
            select(ManagerEmployee).where(
                or_(
                    ManagerEmployee.employee_empid == empid,
                    ManagerEmployee.manager_empid == empid
                )
            ).limit(1)
        )
        emp_row = result.scalars().first()
        if emp_row:
            return emp_row.employee_name if emp_row.employee_empid == empid else emp_row.manager_name
        return empid
    
    @staticmethod
    def get_expertise_level_value(expertise: str) -> int:
        """Convert expertise level string to numeric value for comparison"""
        expertise_map = {
            "L0": 0, "Beginner": 1, "L1": 1,
            "L2": 2, "Intermediate": 2,
            "L3": 3, "Advanced": 3,
            "L4": 4, "Expert": 4,
            "L5": 5
        }
        return expertise_map.get(expertise, 0)
    
    @staticmethod
    def normalize_expertise_level(expertise: str) -> str:
        """Normalize expertise level to standard categories"""
        if expertise in ["L0", "L1", "Beginner"]:
            return "Beginner"
        elif expertise in ["L2", "Intermediate"]:
            return "Intermediate"
        elif expertise in ["L3", "Advanced"]:
            return "Advanced"
        elif expertise in ["L4", "L5", "Expert"]:
            return "Expert"
        return "Unknown"
    
    @staticmethod
    def get_month_range(months: int = 6) -> List[str]:
        """Get list of month strings for the last N months"""
        current = datetime.now()
        months_list = []
        for i in range(months):
            month_date = current - timedelta(days=30 * i)
            months_list.append(month_date.strftime('%Y-%m'))
        return sorted(months_list)
    
    @staticmethod
    async def get_user_statistics(db: AsyncSession) -> Dict[str, Any]:
        """Get comprehensive user statistics"""
        users_result = await db.execute(select(User))
        all_users = users_result.scalars().all()
        
        me_result = await db.execute(select(ManagerEmployee))
        me_relationships = me_result.scalars().all()
        
        # Build role and trainer mappings
        role_map = {}
        trainer_map = {}
        
        for rel in me_relationships:
            if rel.manager_empid not in role_map:
                role_map[rel.manager_empid] = 'manager'
            trainer_map[rel.manager_empid] = rel.manager_is_trainer
            
            if rel.employee_empid not in role_map:
                role_map[rel.employee_empid] = 'employee'
            trainer_map[rel.employee_empid] = rel.employee_is_trainer
        
        stats = {
            "total_users": len(all_users),
            "managers": sum(1 for role in role_map.values() if role == 'manager'),
            "employees": 0,
            "trainers": sum(1 for is_trainer in trainer_map.values() if is_trainer),
            "users_by_role": {"manager": 0, "employee": 0, "admin": 0}
        }
        
        stats["employees"] = stats["total_users"] - stats["managers"]
        stats["users_by_role"]["manager"] = stats["managers"]
        stats["users_by_role"]["employee"] = stats["employees"]
        
        return stats
    
    @staticmethod
    async def get_training_statistics(db: AsyncSession) -> Dict[str, Any]:
        """Get comprehensive training statistics"""
        trainings_result = await db.execute(
            select(TrainingDetail)
        )
        trainings = trainings_result.scalars().all()
        
        assignments_result = await db.execute(
            select(TrainingAssignment)
        )
        assignments = assignments_result.scalars().all()
        
        attendance_result = await db.execute(
            select(TrainingAttendance)
        )
        attendances = attendance_result.scalars().all()
        
        total_attended = sum(1 for att in attendances if att.attended)
        
        stats = {
            "total_trainings": len(trainings),
            "total_assignments": len(assignments),
            "total_attended": total_attended,
            "completion_rate": (total_attended / len(assignments) * 100) if len(assignments) > 0 else 0,
            "trainings_by_type": {},
            "trainings_by_department": {},
            "trainings_by_skill": {}
        }
        
        # Aggregate by type, department, skill
        for training in trainings:
            # By type
            training_type = training.training_type or "Unknown"
            stats["trainings_by_type"][training_type] = stats["trainings_by_type"].get(training_type, 0) + 1
            
            # By department
            dept = training.department or "Unknown"
            stats["trainings_by_department"][dept] = stats["trainings_by_department"].get(dept, 0) + 1
            
            # By skill
            skill = training.skill or "General"
            stats["trainings_by_skill"][skill] = stats["trainings_by_skill"].get(skill, 0) + 1
        
        return stats
    
    @staticmethod
    async def get_feedback_statistics(db: AsyncSession) -> Dict[str, Any]:
        """Get comprehensive feedback statistics"""
        feedback_result = await db.execute(
            select(FeedbackSubmission)
        )
        feedbacks = feedback_result.scalars().all()
        
        assignments_result = await db.execute(
            select(TrainingAssignment)
        )
        assignments = assignments_result.scalars().all()
        
        stats = {
            "total_feedbacks": len(feedbacks),
            "total_assignments": len(assignments),
            "response_rate": (len(feedbacks) / len(assignments) * 100) if len(assignments) > 0 else 0,
            "feedbacks_by_training": {},
            "feedbacks_by_month": {}
        }
        
        # Aggregate by training and month
        for feedback in feedbacks:
            # By training
            training_id = feedback.training_id
            stats["feedbacks_by_training"][training_id] = stats["feedbacks_by_training"].get(training_id, 0) + 1
            
            # By month
            if feedback.submitted_at:
                month_key = feedback.submitted_at.strftime('%Y-%m')
                stats["feedbacks_by_month"][month_key] = stats["feedbacks_by_month"].get(month_key, 0) + 1
        
        return stats
    
    @staticmethod
    async def get_skills_gap_statistics(db: AsyncSession) -> Dict[str, Any]:
        """Get comprehensive skills gap statistics"""
        competencies_result = await db.execute(
            select(EmployeeCompetency)
        )
        competencies = competencies_result.scalars().all()
        
        stats = {
            "total_skills": len(competencies),
            "skills_with_gap": 0,
            "skills_met": 0,
            "gap_percentage": 0,
            "gaps_by_skill": {},
            "gaps_by_department": {},
            "expertise_distribution": {
                "current": {"Beginner": 0, "Intermediate": 0, "Advanced": 0, "Expert": 0},
                "target": {"Beginner": 0, "Intermediate": 0, "Advanced": 0, "Expert": 0}
            }
        }
        
        for comp in competencies:
            current_level = ReportService.get_expertise_level_value(comp.current_expertise)
            target_level = ReportService.get_expertise_level_value(comp.target_expertise)
            
            # Count gaps
            if current_level < target_level:
                stats["skills_with_gap"] += 1
                gap = target_level - current_level
                
                # By skill
                skill = comp.skill or "Unknown"
                if skill not in stats["gaps_by_skill"]:
                    stats["gaps_by_skill"][skill] = {"count": 0, "total_gap": 0}
                stats["gaps_by_skill"][skill]["count"] += 1
                stats["gaps_by_skill"][skill]["total_gap"] += gap
                
                # By department
                dept = comp.department or "Unknown"
                if dept not in stats["gaps_by_department"]:
                    stats["gaps_by_department"][dept] = {"count": 0, "total_gap": 0}
                stats["gaps_by_department"][dept]["count"] += 1
                stats["gaps_by_department"][dept]["total_gap"] += gap
            else:
                stats["skills_met"] += 1
            
            # Expertise distribution
            current_norm = ReportService.normalize_expertise_level(comp.current_expertise)
            target_norm = ReportService.normalize_expertise_level(comp.target_expertise)
            
            if current_norm != "Unknown":
                stats["expertise_distribution"]["current"][current_norm] += 1
            if target_norm != "Unknown":
                stats["expertise_distribution"]["target"][target_norm] += 1
        
        stats["gap_percentage"] = (stats["skills_with_gap"] / stats["total_skills"] * 100) if stats["total_skills"] > 0 else 0
        
        return stats
    
    @staticmethod
    def format_chart_data(
        labels: List[str],
        data: List[Any],
        chart_type: str,
        title: str,
        colors: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Format data for chart visualization"""
        default_colors = [
            "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
            "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"
        ]
        
        return {
            "labels": labels,
            "datasets": [{
                "label": title,
                "data": data,
                "backgroundColor": colors or default_colors[:len(data)],
                "borderColor": colors or default_colors[:len(data)],
                "borderWidth": 2
            }],
            "chartType": chart_type,
            "title": title
        }
    
    @staticmethod
    def calculate_percentage(part: int, total: int, decimals: int = 2) -> float:
        """Calculate percentage with safe division"""
        if total == 0:
            return 0.0
        return round((part / total * 100), decimals)
