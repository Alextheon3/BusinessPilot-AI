#!/usr/bin/env python3
"""
Script to create a test user for BusinessPilot AI
"""

import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the app directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models.user import User
from app.core.database import Base

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_test_user():
    # Database connection
    DATABASE_URL = "sqlite:///./businesspilot.db"
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.email == "test@businesspilot.ai").first()
        if existing_user:
            print("✅ Test user already exists!")
            print("📧 Email: test@businesspilot.ai")
            print("🔐 Password: testpassword123")
            return
        
        # Create test user
        test_user = User(
            email="test@businesspilot.ai",
            full_name="Test User",
            business_name="Test Business",
            business_type="retail",
            hashed_password=hash_password("testpassword123"),
            is_active=True
        )
        
        db.add(test_user)
        db.commit()
        
        print("✅ Test user created successfully!")
        print("📧 Email: test@businesspilot.ai")
        print("🔐 Password: testpassword123")
        print("🏢 Business: Test Business")
        print("📊 Type: Retail")
        print("")
        print("You can now log in to the application with these credentials.")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()