#!/usr/bin/env python3
"""
Database migration script to add target_date column to training_assignments table.
Run this script once to update your existing database schema.
"""

import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import DATABASE_URL


async def add_target_date_column():
  """Add target_date column to training_assignments if it does not exist."""

  engine = create_async_engine(DATABASE_URL)

  try:
    async with engine.begin() as conn:
      # Check if column already exists
      result = await conn.execute(
        text(
          """
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'training_assignments' 
            AND table_schema = 'public'
            AND column_name = 'target_date'
          """
        )
      )
      column = result.fetchone()

      if column:
        print("✅ 'target_date' column already exists on training_assignments.")
      else:
        print("🔧 Adding 'target_date' column to training_assignments...")
        await conn.execute(
          text(
            """
            ALTER TABLE training_assignments 
            ADD COLUMN target_date DATE NULL
            """
          )
        )
        print("✅ Successfully added 'target_date' column.")

  except Exception as e:
    print(f"❌ Error updating training_assignments table: {e}")
    raise
  finally:
    await engine.dispose()


async def main():
  """Main entrypoint for the migration."""
  print("🚀 Starting migration: add target_date to training_assignments...")
  await add_target_date_column()
  print("🎉 Migration completed successfully!")


if __name__ == "__main__":
  asyncio.run(main())


