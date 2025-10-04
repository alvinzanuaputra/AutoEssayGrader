#!/usr/bin/env python3
"""
Script to create a user directly in the database.
This is useful for creating initial admin users or for testing purposes.
"""

import asyncio
from core.db import get_session, create_tables
from core.user_manager import get_user_manager
from models.user_model import UserCreate
from fastapi_users.exceptions import UserAlreadyExists


async def create_user(email: str, password: str, name: str, is_superuser: bool = False):
    """Create a new user directly in the database."""
    
    # Ensure tables exist
    await create_tables()
    
    # Get database session
    async for session in get_session():
        try:
            # Get user manager
            user_manager = await get_user_manager(session)
            
            # Create user data
            user_create = UserCreate(
                email=email,
                password=password,
                name=name,
                is_superuser=is_superuser
            )
            
            # Create the user
            user = await user_manager.create(user_create)
            print(f"✅ User created successfully!")
            print(f"   ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Name: {user.name}")
            print(f"   Is Active: {user.is_active}")
            print(f"   Is Superuser: {user.is_superuser}")
            
            return user
            
        except UserAlreadyExists:
            print(f"❌ User with email '{email}' already exists!")
            return None
        except Exception as e:
            print(f"❌ Error creating user: {str(e)}")
            return None
        finally:
            await session.close()


async def main():
    """Main function to demonstrate user creation."""
    
    # Example 1: Create a regular user
    print("Creating regular user...")
    await create_user(
        email="user1@example.com",
        password="password123",
        name="Regular User"
    )
    
    print("\n" + "="*50 + "\n")
    
    # Example 2: Create a superuser/admin
    print("Creating admin user...")
    await create_user(
        email="admin@example.com", 
        password="adminpass123",
        name="Admin User",
        is_superuser=True
    )


if __name__ == "__main__":
    print("🚀 Starting user creation script...\n")
    asyncio.run(main())
    print("\n✨ Script completed!")