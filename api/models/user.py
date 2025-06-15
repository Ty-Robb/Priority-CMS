from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    """User model for authentication and user information"""
    id: str
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    
class UserCreate(BaseModel):
    """Model for creating a new user"""
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    
class UserUpdate(BaseModel):
    """Model for updating user information"""
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    
class UserResponse(BaseModel):
    """Response model for user information"""
    id: str
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
