#!/usr/bin/env python3
"""
Script to check and fix admin user setup for INT00137.
This script will:
1. Check if user exists in users table
2. Check if user is in admins table
3. Create user if missing
4. Add to admins table if missing
5. Reset password if needed

Usage: python check_and_fix_admin.py [username] [password]
Example: python check_and_fix_admin.py INT00137 admin123
"""

import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import DATABASE_URL
from app.auth_utils import get_password_hash

async def check_and_fix_admin(username: str = "INT00137", password: str = None):
    """Check and fix admin user setup."""
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    try:
        async with engine.begin() as conn:
            print(f"\n🔍 Checking user '{username}'...\n")
            
            # Check if user exists
            user_check = await conn.execute(
                text("SELECT username, hashed_password FROM users WHERE username = :username"),
                {"username": username}
            )
            user_row = user_check.fetchone()
            
            user_exists = user_row is not None
            current_password_hash = user_row[1] if user_row else None
            
            if not user_exists:
                print(f"❌ User '{username}' does NOT exist in users table.")
                if password:
                    print(f"📝 Creating user '{username}' with provided password...")
                    hashed_password = get_password_hash(password)
                    await conn.execute(
                        text("""
                            INSERT INTO users (username, hashed_password, created_at)
                            VALUES (:username, :hashed_password, CURRENT_TIMESTAMP)
                        """),
                        {"username": username, "hashed_password": hashed_password}
                    )
                    print(f"✅ User '{username}' created successfully!")
                    user_exists = True
                else:
                    print(f"⚠️  Cannot create user without password.")
                    print(f"   Please provide a password or register the user first.")
                    return False
            else:
                print(f"✅ User '{username}' exists in users table.")
                if password:
                    print(f"🔄 Updating password for '{username}'...")
                    hashed_password = get_password_hash(password)
                    await conn.execute(
                        text("""
                            UPDATE users 
                            SET hashed_password = :hashed_password 
                            WHERE username = :username
                        """),
                        {"username": username, "hashed_password": hashed_password}
                    )
                    print(f"✅ Password updated for '{username}'!")
            
            # Check if admins table exists
            table_check = await conn.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'admins'
            """))
            admins_table_exists = table_check.fetchone() is not None
            
            if not admins_table_exists:
                print(f"\n❌ Admins table does NOT exist.")
                print(f"📋 Creating admins table...")
                await conn.execute(text("""
                    CREATE TABLE admins (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR NOT NULL UNIQUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_by VARCHAR,
                        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
                    )
                """))
                await conn.execute(text("""
                    CREATE INDEX idx_admins_username ON admins(username)
                """))
                print(f"✅ Admins table created!")
            
            # Check if user is admin
            admin_check = await conn.execute(
                text("SELECT username FROM admins WHERE username = :username"),
                {"username": username}
            )
            is_admin = admin_check.fetchone() is not None
            
            if not is_admin:
                print(f"\n❌ User '{username}' is NOT in admins table.")
                print(f"👑 Adding '{username}' to admins table...")
                await conn.execute(
                    text("""
                        INSERT INTO admins (username, created_by) 
                        VALUES (:username, :created_by)
                    """),
                    {"username": username, "created_by": "system"}
                )
                print(f"✅ User '{username}' is now an admin!")
            else:
                print(f"\n✅ User '{username}' is already in admins table.")
            
            print(f"\n🎉 Setup complete! User '{username}' can now login as admin.")
            if password:
                print(f"📝 Password: {password}")
            print(f"\n")
            return True
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await engine.dispose()

async def main():
    username = sys.argv[1] if len(sys.argv) > 1 else "INT00137"
    password = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not password:
        print("⚠️  No password provided. User will be checked but not created/updated.")
        print("   Usage: python check_and_fix_admin.py [username] [password]")
        print("   Example: python check_and_fix_admin.py INT00137 admin123\n")
    
    success = await check_and_fix_admin(username, password)
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())










