"""
Authentication Routes Module

Purpose: Handle user registration and login functionality
Features:
- User registration with password hashing
- User login with JWT token generation
- Role detection (manager/employee) based on manager_employee table
- Password verification using bcrypt

Endpoints:
- POST /register: Register a new user
- POST /login: Authenticate user and return JWT token

@author Orbit Skill Development Team
@date 2025
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db_async
from app.models import User, ManagerEmployee
from app.schemas import UserCreate, UserLogin
from app.auth_utils import get_password_hash, verify_password, create_access_token
from app.config import ADMIN_USERNAMES

router = APIRouter()

@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db_async)):
    """
    Register a new user account.
    
    Creates a new user with hashed password. Username must be unique.
    
    Args:
        user: UserCreate schema containing username and password
        db: Database session dependency
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: 400 if username already exists
    """
    # Check if user already exists
    stmt = select(User).where(User.username == user.username)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Hash password before storing using pbkdf2_sha256 (no length limit)
    hashed = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db_async)):
    """
    Authenticate user and return JWT access token.
    
    Verifies user credentials and determines role (manager/employee/admin) based on
    manager_employee table relationships.
    
    Args:
        user: UserLogin schema containing username and password
        db: Database session dependency
        
    Returns:
        dict: Access token, token type, and user role
        
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    # Verify user exists
    stmt = select(User).where(User.username == user.username)
    result = await db.execute(stmt)
    db_user = result.scalar_one_or_none()
    
    # Check credentials
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Determine user role based on manager_employee relationships
    emp_id = user.username
    
    # Check if user is admin (using configured admin usernames)
    if emp_id in ADMIN_USERNAMES:
        role = "admin"
    else:
        # Check manager/employee roles
        manager_stmt = select(ManagerEmployee).where(ManagerEmployee.manager_empid == emp_id)
        manager_result = await db.execute(manager_stmt)
        is_manager = manager_result.scalar_one_or_none()
        
        employee_stmt = select(ManagerEmployee).where(ManagerEmployee.employee_empid == emp_id)
        employee_result = await db.execute(employee_stmt)
        is_employee = employee_result.scalar_one_or_none()
        
        if is_manager:
            role = "manager"
        elif is_employee:
            role = "employee"
        else:
            role = "unknown"

    # Generate JWT token with username and role
    token = create_access_token({"sub": user.username, "role": role})
    return {"access_token": token, "token_type": "bearer", "role": role}
