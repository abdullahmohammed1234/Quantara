"""
Authentication module with register/login endpoints
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import database

router = APIRouter(prefix="/auth", tags=["auth"])


# Request/Response models
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    error: Optional[str] = None


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """Register a new user"""
    # Validate input
    if not request.username or len(request.username) < 3:
        return AuthResponse(success=False, error="Username must be at least 3 characters")
    
    if not request.password or len(request.password) < 4:
        return AuthResponse(success=False, error="Password must be at least 4 characters")
    
    # Create user in database
    result = database.create_user(request.username, request.email, request.password)
    
    if result["success"]:
        return AuthResponse(success=True, user=result["user"])
    else:
        return AuthResponse(success=False, error=result.get("error", "Registration failed"))


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login user"""
    # Authenticate user
    result = database.authenticate_user(request.email, request.password)
    
    if result["success"]:
        return AuthResponse(success=True, user=result["user"])
    else:
        return AuthResponse(success=False, error=result.get("error", "Invalid credentials"))


@router.get("/user/{user_id}")
async def get_user(user_id: int):
    """Get user by ID"""
    result = database.get_user_by_id(user_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=404, detail=result.get("error", "User not found"))
