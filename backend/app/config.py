"""
Environment Configuration Module

Purpose: Centralize application configuration and environment variables
Features:
- Database connection settings
- JWT authentication settings
- CORS configuration
- Email service settings
- Admin user configuration

Best Practice: Use environment variables in production to avoid hardcoding secrets.
For production deployment, create a .env file and use python-dotenv to load variables.

@author Orbit Skill Development Team
@date 2025
"""

import os
from typing import List

class Settings:
    """
    Application settings and configuration.
    
    In production, override these settings using environment variables:
    - Set DATABASE_URL environment variable for database connection
    - Set SECRET_KEY environment variable for JWT signing
    - Set CORS_ORIGINS environment variable (comma-separated URLs)
    - Set ADMIN_USERNAMES environment variable (comma-separated usernames)
    """
    
    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:admin123@localhost:5432/skillorbit"
    )
    
    # JWT Configuration
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "your-super-secret-key-change-this-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS Configuration
    # In production, set CORS_ORIGINS environment variable
    # Example: CORS_ORIGINS="https://app.example.com,https://www.example.com"
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:4200,http://127.0.0.1:4200"
    ).split(",")
    
    # Admin Configuration
    # In production, set ADMIN_USERNAMES environment variable
    # Example: ADMIN_USERNAMES="admin,INT00137,superadmin"
    ADMIN_USERNAMES: List[str] = os.getenv(
        "ADMIN_USERNAMES",
        "admin,INT00137"
    ).split(",")
    
    # Email Configuration (for Outlook email service)
    EMAIL_ENABLED: bool = os.getenv("EMAIL_ENABLED", "true").lower() == "true"
    DEFAULT_EMAIL_DOMAIN: str = os.getenv("DEFAULT_EMAIL_DOMAIN", "company.com")
    
    # Application Configuration
    APP_NAME: str = "SkillOrbit API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "API for managing skills and training data"
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", str(50 * 1024 * 1024)))  # 50MB default
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Default Password for Bulk User Creation
    # WARNING: This should only be used for initial development/testing
    # In production, force users to set passwords on first login
    DEFAULT_PASSWORD: str = os.getenv("DEFAULT_PASSWORD", "ChangeMe@123")


# Create a global settings instance
settings = Settings()


# Helper function to validate settings on startup
def validate_settings() -> bool:
    """
    Validate critical settings on application startup.
    
    Returns:
        bool: True if all settings are valid, False otherwise
    """
    issues = []
    
    # Check for default secret key in production
    if settings.SECRET_KEY == "your-super-secret-key-change-this-in-production":
        issues.append("⚠️  WARNING: Using default SECRET_KEY. Set SECRET_KEY environment variable in production!")
    
    # Check database URL
    if not settings.DATABASE_URL:
        issues.append("❌ ERROR: DATABASE_URL is not set")
    
    # Check CORS origins
    if not settings.CORS_ORIGINS:
        issues.append("⚠️  WARNING: No CORS origins configured")
    
    # Check admin usernames
    if not settings.ADMIN_USERNAMES:
        issues.append("⚠️  WARNING: No admin usernames configured")
    
    # Print any issues found
    if issues:
        print("\n" + "="*60)
        print("Configuration Validation Results:")
        print("="*60)
        for issue in issues:
            print(issue)
        print("="*60 + "\n")
        
        # Return False if there are critical errors (not just warnings)
        return not any("ERROR" in issue for issue in issues)
    
    return True


# Export commonly used settings for easy import
DATABASE_URL = settings.DATABASE_URL
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
CORS_ORIGINS = settings.CORS_ORIGINS
ADMIN_USERNAMES = settings.ADMIN_USERNAMES
