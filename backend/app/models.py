"""
SQLAlchemy Database Models

Purpose: Define database schema using SQLAlchemy ORM
Contains all table definitions and relationships for the Orbit Skill application

Models:
- User: User accounts with authentication
- ManagerEmployee: Manager-employee relationships
- EmployeeCompetency: Employee skill competencies and targets
- AdditionalSkill: Self-reported additional skills
- Trainer: Trainer information and expertise
- TrainingDetail: Training session details
- TrainingAssignment: Training assignments to employees
- TrainingRequest: Training approval requests
- AssignmentSubmission: Assignment exam submissions
- FeedbackSubmission: Training feedback submissions
- SharedAssignment: Shared assignments from trainers
- SharedFeedback: Shared feedback forms from trainers
- ManagerPerformanceFeedback: Manager feedback on employee performance

@author Orbit Skill Development Team
@date 2025
"""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Boolean, Text
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    """
    User model - Stores user account information and authentication data.
    
    Attributes:
        id: Primary key
        username: Unique employee ID (used for login)
        hashed_password: Bcrypt hashed password
        created_at: Account creation timestamp
    """
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class ManagerEmployee(Base):
    """
    Manager-Employee Relationship Model - Maps hierarchical reporting relationships.
    
    This table stores the organizational hierarchy and trainer designations.
    A manager can have multiple employees, and both managers and employees can be trainers.
    
    Attributes:
        manager_empid: Employee ID of the manager (references users table)
        manager_name: Full name of the manager
        employee_empid: Employee ID of the employee (references users table)
        employee_name: Full name of the employee
        manager_is_trainer: Flag indicating if manager is qualified as a trainer
        employee_is_trainer: Flag indicating if employee is qualified as a trainer
    """
    __tablename__ = 'manager_employee'
    manager_empid = Column(String, ForeignKey('users.username'), primary_key=True)
    manager_name = Column(String)
    employee_empid = Column(String, ForeignKey('users.username'), primary_key=True)
    employee_name = Column(String)
    manager_is_trainer = Column(Boolean, default=False, nullable=False)
    employee_is_trainer = Column(Boolean, default=False, nullable=False)

class EmployeeCompetency(Base):
    """
    Employee Competency Model - Tracks employee skills and expertise levels.
    
    This table stores the current and target expertise levels for each skill
    assigned to an employee. It forms the basis for skill gap analysis and
    training recommendations.
    
    Attributes:
        id: Primary key
        employee_empid: Employee ID (references users table)
        employee_name: Employee's full name
        department: Department name (e.g., Software, Testing, Hardware)
        division: Division/business unit
        project: Current project assignment
        role_specific_comp: Role-specific competency area
        destination: Career path or target role
        competency: Competency category (e.g., Programming, Testing, Design)
        skill: Specific skill name (e.g., Python, C++, AUTOSAR)
        current_expertise: Current skill level (L0-L5 or Beginner/Intermediate/Advanced/Expert)
        target_expertise: Desired skill level
        comments: Additional notes or observations
        target_date: Target date to achieve the desired expertise level
        employee: Relationship to User model
    """
    __tablename__ = 'employee_competency'
    id = Column(Integer, primary_key=True, index=True)
    employee_empid = Column(String, ForeignKey('users.username'))
    employee_name = Column(String)
    department = Column(String)
    division = Column(String)
    project = Column(String)
    role_specific_comp = Column(String)
    destination = Column(String)
    competency = Column(String)
    skill = Column(String)
    current_expertise = Column(String)
    target_expertise = Column(String)
    comments = Column(String)
    target_date = Column(Date)
    employee = relationship("User")

class AdditionalSkill(Base):
    """
    Additional Skills Model - Self-reported skills beyond assigned competencies.
    
    Allows employees to add skills not covered in their formal competency matrix.
    This enables skill discovery and helps identify hidden talents in the organization.
    
    Attributes:
        id: Primary key
        employee_empid: Employee ID (references users table)
        skill_name: Name of the skill (e.g., Docker, Kubernetes, React)
        skill_level: Proficiency level (Beginner/Intermediate/Advanced/Expert)
        skill_category: Category (Technical/Soft Skill/Certification/Language)
        description: Optional notes about skill application or projects
        created_at: Timestamp when skill was added
        updated_at: Timestamp of last update
        employee: Relationship to User model
    """
    __tablename__ = 'additional_skills'
    id = Column(Integer, primary_key=True, index=True)
    employee_empid = Column(String, ForeignKey('users.username'), nullable=False)
    skill_name = Column(String, nullable=False)
    skill_level = Column(String, nullable=False)
    skill_category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    employee = relationship("User")

class Trainer(Base):
    """
    Trainer Model - Qualified trainers and their areas of expertise.
    
    Stores information about internal trainers who can conduct training sessions.
    A trainer can have expertise in multiple skills and competencies.
    
    Attributes:
        id: Primary key
        skill: Skill area of expertise (e.g., Python, AUTOSAR, Testing)
        competency: Competency category
        trainer_name: Trainer's full name or employee ID
        expertise_level: Level of expertise in this skill (Expert/Advanced)
    """
    __tablename__ = "trainers"
    id = Column(Integer, primary_key=True, index=True)
    skill = Column(String, nullable=False)
    competency = Column(String, nullable=False)
    trainer_name = Column(String, nullable=False)
    expertise_level = Column(String, nullable=False)

class TrainingDetail(Base):
    """
    Training Detail Model - Training sessions and courses available.
    
    Stores comprehensive information about training programs, workshops,
    and online courses. Supports both in-person and virtual training.
    
    Attributes:
        id: Primary key
        division: Target division
        department: Target department
        competency: Competency area covered
        skill: Specific skill being trained
        training_name: Name/title of the training
        training_topics: Comma-separated list of topics covered
        prerequisites: Required prior knowledge or skills
        skill_category: Category classification
        trainer_name: Name or ID of the trainer conducting the session
        lecture_url: Optional URL to recorded lecture or online course
        description: Detailed description for online courses
        email: Trainer's contact email
        training_date: Scheduled date of the training
        duration: Training duration (e.g., "2 days", "4 hours")
        time: Training time (e.g., "9:00 AM - 5:00 PM")
        training_type: Type (In-person/Virtual/Hybrid/Self-paced)
        seats: Number of available seats
        assessment_details: Information about post-training assessment
    """
    __tablename__ = "training_details"
    id = Column(Integer, primary_key=True, index=True)
    division = Column(String, nullable=True)
    department = Column(String, nullable=True)
    competency = Column(String, nullable=True)
    skill = Column(String, nullable=True)
    training_name = Column(String, nullable=False)
    training_topics = Column(String, nullable=True)
    prerequisites = Column(String, nullable=True)
    skill_category = Column(String, nullable=True)
    trainer_name = Column(String, nullable=False)
    # Optional: link to recorded lecture / online course URL
    lecture_url = Column(String, nullable=True)
    # Optional free-form description or summary for the training (used for online courses)
    description = Column(String, nullable=True)
    email = Column(String, nullable=True)
    training_date = Column(Date, nullable=True) # CHANGED: From String to Date for proper sorting/filtering
    duration = Column(String, nullable=True)
    time = Column(String, nullable=True)
    training_type = Column(String, nullable=True)
    seats = Column(String, nullable=True)
    assessment_details = Column(String, nullable=True)

class TrainingAssignment(Base):
    """
    Training Assignment Model - Tracks training assignments to employees.
    
    Records when a manager assigns a training to an employee. This is the initial
    step in the training workflow, followed by attendance marking and assessment.
    
    Attributes:
        id: Primary key
        training_id: Reference to training_details table
        employee_empid: Employee receiving the assignment (references users table)
        manager_empid: Manager who made the assignment (references users table)
        assignment_date: Timestamp when assignment was created
        target_date: Optional target completion date set by manager
        training: Relationship to TrainingDetail model
        user: Relationship to User model (employee)
        assigned_at: Alias for assignment_date for consistency
    """
    __tablename__ = 'training_assignments'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    employee_empid = Column(String, ForeignKey('users.username'), nullable=False)
    manager_empid = Column(String, ForeignKey('users.username'), nullable=False)
    # Match existing DB column name 'assignment_date' (timestamp)
    assignment_date = Column(DateTime, default=datetime.utcnow)
    # Optional target completion date set by manager at the time of assignment
    target_date = Column(Date, nullable=True)
    # Relationships
    training = relationship("TrainingDetail")
    user = relationship("User", foreign_keys=[employee_empid])
    assigned_at = assignment_date  # Alias for consistency

class TrainingAttendance(Base):
    """
    Training Attendance Model - Records actual attendance for trainings.
    
    Trainers mark attendance after conducting a training session. Only employees
    who attended can access assignments and submit feedback for that training.
    
    Attributes:
        id: Primary key
        training_id: Reference to training_details table
        employee_empid: Employee whose attendance is being recorded
        attended: Boolean flag - True if attended, False if absent
        marked_at: Timestamp when attendance was marked
        training: Relationship to TrainingDetail model
        employee: Relationship to User model
    """
    __tablename__ = 'training_attendance'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    employee_empid = Column(String, ForeignKey('users.username'), nullable=False)
    attended = Column(Boolean, default=False, nullable=False)
    marked_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")
    employee = relationship("User", foreign_keys=[employee_empid])

class TrainingRequest(Base):
    """
    Training Request Model - Employee training enrollment requests.
    
    Employees can request to enroll in trainings, which then require manager approval.
    This implements a request-approval workflow for training enrollment.
    
    Attributes:
        id: Primary key
        training_id: Reference to requested training
        employee_empid: Employee requesting the training
        manager_empid: Manager who will approve/reject the request
        request_date: Timestamp when request was submitted
        status: Request status ('pending', 'approved', 'rejected')
        manager_notes: Optional notes from manager explaining decision
        response_date: Timestamp when manager responded to request
        training: Relationship to TrainingDetail model
        employee: Relationship to User model (employee)
        manager: Relationship to User model (manager)
    """
    __tablename__ = 'training_requests'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    employee_empid = Column(String, ForeignKey('users.username'), nullable=False)
    manager_empid = Column(String, ForeignKey('users.username'), nullable=False)
    request_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default='pending')  # pending, approved, rejected
    manager_notes = Column(String, nullable=True)
    response_date = Column(DateTime, nullable=True)
    # Relationships
    training = relationship("TrainingDetail")
    employee = relationship("User", foreign_keys=[employee_empid])
    manager = relationship("User", foreign_keys=[manager_empid])

class SharedAssignment(Base):
    """
    Shared Assignment Model - Quiz/assessment questions shared by trainers.
    
    Trainers create assignments (quizzes/tests) for their training sessions.
    These are stored as JSON data with questions, options, and correct answers.
    
    Attributes:
        id: Primary key
        training_id: Reference to associated training
        trainer_username: Trainer who created the assignment
        title: Assignment title
        description: Optional instructions or description
        assignment_data: JSON string containing questions, options, and answers
        created_at: Creation timestamp
        updated_at: Last modification timestamp
        training: Relationship to TrainingDetail model
        trainer: Relationship to User model (trainer)
    """
    __tablename__ = 'shared_assignments'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    trainer_username = Column(String, ForeignKey('users.username'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    assignment_data = Column(Text, nullable=False)  # JSON string storing questions and options
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")
    trainer = relationship("User", foreign_keys=[trainer_username])

class SharedFeedback(Base):
    """
    Shared Feedback Model - Feedback forms created by trainers.
    
    Trainers create feedback forms to collect training effectiveness data.
    Stored as JSON with questions (rating scales, multiple choice, text).
    
    Attributes:
        id: Primary key
        training_id: Reference to associated training
        trainer_username: Trainer who created the feedback form
        feedback_data: JSON string containing feedback questions
        created_at: Creation timestamp
        updated_at: Last modification timestamp
        training: Relationship to TrainingDetail model
        trainer: Relationship to User model (trainer)
    """
    __tablename__ = 'shared_feedback'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    trainer_username = Column(String, ForeignKey('users.username'), nullable=False)
    feedback_data = Column(Text, nullable=False)  # JSON string storing feedback questions
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")
    trainer = relationship("User", foreign_keys=[trainer_username])

class AssignmentSubmission(Base):
    __tablename__ = 'assignment_submissions'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    shared_assignment_id = Column(Integer, ForeignKey('shared_assignments.id'), nullable=False)
    employee_empid = Column(String, ForeignKey('users.username'), nullable=False)
    answers_data = Column(Text, nullable=False)  # JSON string storing user answers
    score = Column(Integer, nullable=True)  # Score out of 100
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")
    shared_assignment = relationship("SharedAssignment")
    employee = relationship("User", foreign_keys=[employee_empid])

class FeedbackSubmission(Base):
    __tablename__ = 'feedback_submissions'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    shared_feedback_id = Column(Integer, ForeignKey('shared_feedback.id'), nullable=False)
    employee_empid = Column(String, ForeignKey('users.username'), nullable=False)
    responses_data = Column(Text, nullable=False)  # JSON string storing feedback responses
    submitted_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")
    shared_feedback = relationship("SharedFeedback")
    employee = relationship("User", foreign_keys=[employee_empid])

class ManagerPerformanceFeedback(Base):
    __tablename__ = 'manager_performance_feedback'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    employee_empid = Column(String, ForeignKey('users.username'), nullable=False)
    manager_empid = Column(String, ForeignKey('users.username'), nullable=False)
    # Performance factors (ratings 1-5)
    application_of_training = Column(Integer, nullable=True)  # How effectively the employee is using the learned concepts/tools in real tasks
    quality_of_deliverables = Column(Integer, nullable=True)  # Impact of training on code quality, test quality, design accuracy, defect reduction, etc.
    problem_solving_capability = Column(Integer, nullable=True)  # Ability to apply trained methods to analyze issues, debug, and provide correct solutions
    productivity_independence = Column(Integer, nullable=True)  # Whether the employee completes tasks faster, with less support, and shows improved efficiency after training
    process_compliance_adherence = Column(Integer, nullable=True)  # Correct use of processes, tools, templates, and standards learned during training (ASPICE, ISO26262, etc.)
    improvement_areas = Column(Text, nullable=True)  # Areas that need improvement
    strengths = Column(Text, nullable=True)  # Key strengths demonstrated
    overall_performance = Column(Integer, nullable=False)  # Overall performance rating (1-5)
    additional_comments = Column(Text, nullable=True)  # Additional comments from manager
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")
    employee = relationship("User", foreign_keys=[employee_empid])
    manager = relationship("User", foreign_keys=[manager_empid])

class TrainingQuestionFile(Base):
    __tablename__ = 'training_question_files'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    trainer_username = Column(String, ForeignKey('users.username'), nullable=False)
    file_path = Column(String, nullable=False)  # Path to the uploaded PDF file
    file_name = Column(String, nullable=False)  # Original filename
    file_size = Column(Integer, nullable=True)  # File size in bytes
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")
    trainer = relationship("User", foreign_keys=[trainer_username])

class TrainingSolutionFile(Base):
    __tablename__ = 'training_solution_files'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    employee_empid = Column(String, ForeignKey('users.username'), nullable=False)
    file_path = Column(String, nullable=False)  # Path to the uploaded PDF file
    file_name = Column(String, nullable=False)  # Original filename
    file_size = Column(Integer, nullable=True)  # File size in bytes
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")
    employee = relationship("User", foreign_keys=[employee_empid])


class TrainingRecording(Base):
    __tablename__ = 'training_recordings'
    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey('training_details.id'), nullable=False)
    lecture_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    training = relationship("TrainingDetail")

class Notification(Base):
    """
    Notification model - Stores in-app notifications for users.
    
    Attributes:
        id: Primary key
        user_empid: Employee ID of the user receiving the notification
        title: Notification title/heading
        message: Notification message content
        type: Notification type (info, success, warning, error, assignment, approval, etc.)
        is_read: Whether the notification has been read
        related_id: Optional ID of related entity (training_id, request_id, etc.)
        related_type: Type of related entity (training, request, assignment, etc.)
        action_url: Optional URL to navigate to when notification is clicked
        created_at: Notification creation timestamp
        read_at: Timestamp when notification was marked as read
    """
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True, index=True)
    user_empid = Column(String, ForeignKey('users.username'), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False, default='info')  # info, success, warning, error, assignment, approval, etc.
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    related_id = Column(Integer, nullable=True)  # ID of related entity (training_id, request_id, etc.)
    related_type = Column(String, nullable=True)  # Type of related entity (training, request, assignment, etc.)
    action_url = Column(String, nullable=True)  # URL to navigate to when notification is clicked
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    read_at = Column(DateTime, nullable=True)
    # Relationships
    user = relationship("User", foreign_keys=[user_empid])

class Admin(Base):
    """
    Admin model - Stores admin user information.
    Only users in this table have admin privileges.
    
    Attributes:
        id: Primary key
        username: Foreign key to users.username (unique)
        created_at: When admin access was granted
        created_by: Who granted admin access (optional, for audit trail)
    """
    __tablename__ = 'admins'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, ForeignKey('users.username'), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, nullable=True)  # Optional: track who made them admin
    # Relationships
    user = relationship("User")


