"""
Common Utilities Module

Purpose: Shared utility functions used across the application
Features:
- Date and datetime conversion helpers
- Level comparison functions
- Data serialization helpers
- Common validation functions

This module promotes code reusability by centralizing frequently used utility functions.

@author Orbit Skill Development Team
@date 2025
"""

from datetime import datetime, date
from typing import Any, Optional, Union


def to_iso_date(val: Any) -> Optional[str]:
    """
    Convert various date formats to ISO format string (YYYY-MM-DD).
    
    Handles datetime objects, date objects, and ISO-formatted strings.
    Returns None if value is None or cannot be converted.
    
    Args:
        val: Value to convert (datetime, date, string, or None)
        
    Returns:
        ISO formatted date string (YYYY-MM-DD) or None
        
    Examples:
        >>> to_iso_date(datetime(2025, 1, 15))
        '2025-01-15'
        >>> to_iso_date(date(2025, 1, 15))
        '2025-01-15'
        >>> to_iso_date('2025-01-15T10:30:00')
        '2025-01-15'
        >>> to_iso_date(None)
        None
    """
    if val is None:
        return None
    
    # Handle datetime and date objects
    if isinstance(val, datetime):
        return val.date().isoformat()
    if isinstance(val, date):
        return val.isoformat()
    
    # Handle string values
    if isinstance(val, str):
        try:
            # Try to parse ISO-like strings
            return datetime.fromisoformat(val).date().isoformat()
        except (ValueError, AttributeError):
            return val  # Return as-is if can't parse
    
    return None


def convert_level_to_numeric(level_str: str) -> int:
    """
    Convert expertise level string to numeric value for comparison.
    
    Supports both L-format (L0-L5) and text format.
    Returns -1 for invalid/unknown levels.
    
    Args:
        level_str: Level string (e.g., 'L2', 'Intermediate', 'Expert')
        
    Returns:
        int: Numeric level value (0-5) or -1 for invalid input
        
    Examples:
        >>> convert_level_to_numeric('L3')
        3
        >>> convert_level_to_numeric('Expert')
        4
        >>> convert_level_to_numeric('Invalid')
        -1
    """
    if not level_str:
        return -1
    
    level_str = level_str.strip()
    
    # Handle L-format (L0, L1, L2, L3, L4, L5)
    if level_str.upper().startswith('L'):
        try:
            return int(level_str.upper().lstrip('L'))
        except ValueError:
            return -1
    
    # Handle text format mapping
    level_mapping = {
        'BEGINNER': 1,
        'INTERMEDIATE': 2,
        'ADVANCED': 3,
        'EXPERT': 4,
        'MASTER': 5  # Optional advanced level
    }
    
    return level_mapping.get(level_str.upper(), -1)


def compare_expertise_levels(current_level: str, target_level: str) -> str:
    """
    Compare two expertise levels and return status.
    
    This is the recommended function for level comparison across the application.
    
    Args:
        current_level: Current expertise level
        target_level: Target expertise level
        
    Returns:
        str: 'Met' if current >= target, 'Gap' if current < target, 'Error' if invalid
        
    Examples:
        >>> compare_expertise_levels('L3', 'L2')
        'Met'
        >>> compare_expertise_levels('Beginner', 'Expert')
        'Gap'
    """
    # Check for None values
    if current_level is None or target_level is None:
        return "Error"
    
    try:
        current_num = convert_level_to_numeric(current_level)
        target_num = convert_level_to_numeric(target_level)
        
        # If either conversion failed, return Error
        if current_num == -1 or target_num == -1:
            return "Error"
        
        return "Met" if current_num >= target_num else "Gap"
    except (ValueError, TypeError, AttributeError):
        return "Error"


def safe_string_convert(value: Any) -> Optional[str]:
    """
    Safely convert a value to string, handling None and NaN values.
    
    Returns None if the value is None, NaN, or empty after conversion.
    Useful for cleaning data from Excel imports or API responses.
    
    Args:
        value: Value to convert
        
    Returns:
        String representation of value or None
        
    Examples:
        >>> safe_string_convert(None)
        None
        >>> safe_string_convert(float('nan'))
        None
        >>> safe_string_convert('  test  ')
        'test'
        >>> safe_string_convert(123)
        '123'
    """
    if value is None:
        return None
    
    # Handle pandas NaN values
    try:
        import pandas as pd
        if isinstance(value, float) and pd.isna(value):
            return None
    except ImportError:
        # pandas not available, just check for nan
        if isinstance(value, float):
            import math
            if math.isnan(value):
                return None
    
    # Convert to string and strip whitespace
    str_value = str(value).strip()
    return str_value if str_value else None


def calculate_percentage(numerator: Union[int, float], denominator: Union[int, float]) -> int:
    """
    Calculate percentage with safe division.
    
    Returns 0 if denominator is 0 or invalid input.
    Result is rounded to nearest integer.
    
    Args:
        numerator: Numerator value
        denominator: Denominator value
        
    Returns:
        int: Percentage value (0-100)
        
    Examples:
        >>> calculate_percentage(75, 100)
        75
        >>> calculate_percentage(1, 3)
        33
        >>> calculate_percentage(10, 0)
        0
    """
    try:
        if denominator == 0:
            return 0
        result = (numerator / denominator) * 100
        return int(round(max(0, min(100, result))))
    except (TypeError, ValueError, ZeroDivisionError):
        return 0


def validate_email(email: str) -> bool:
    """
    Basic email validation.
    
    Checks if string contains @ and . in correct positions.
    For production, consider using a more robust validation library.
    
    Args:
        email: Email address string to validate
        
    Returns:
        bool: True if email format appears valid, False otherwise
        
    Examples:
        >>> validate_email('user@example.com')
        True
        >>> validate_email('invalid.email')
        False
        >>> validate_email('@example.com')
        False
    """
    if not email or not isinstance(email, str):
        return False
    
    email = email.strip()
    
    # Basic checks
    if '@' not in email or '.' not in email:
        return False
    
    # Split by @ and check parts
    parts = email.split('@')
    if len(parts) != 2:
        return False
    
    local, domain = parts
    
    # Check local and domain parts are not empty
    if not local or not domain:
        return False
    
    # Check domain has a dot
    if '.' not in domain:
        return False
    
    return True


def truncate_string(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate string to maximum length with suffix.
    
    Useful for displaying long text in UI or logs.
    
    Args:
        text: Text to truncate
        max_length: Maximum length (including suffix)
        suffix: Suffix to append when truncated (default: "...")
        
    Returns:
        Truncated string with suffix if needed
        
    Examples:
        >>> truncate_string('This is a very long text', 15)
        'This is a ve...'
        >>> truncate_string('Short', 15)
        'Short'
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix
