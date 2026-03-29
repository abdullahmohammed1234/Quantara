"""
Authentication module with register/login endpoints
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import database
import secrets
import time

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


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    success: bool
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    error: Optional[str] = None


# Token storage (in production, use a database)
token_store = {}

TOKEN_EXPIRY = 3600  # 1 hour
REFRESH_TOKEN_EXPIRY = 604800  # 7 days


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
        # Generate tokens
        access_token = secrets.token_urlsafe(32)
        refresh_token = secrets.token_urlsafe(32)
        
        # Store tokens
        user_id = result["user"]["id"]
        token_store[user_id] = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "created_at": time.time(),
            "expires_at": time.time() + TOKEN_EXPIRY,
            "refresh_expires_at": time.time() + REFRESH_TOKEN_EXPIRY
        }
        
        # Add tokens to user data
        result["user"]["access_token"] = access_token
        result["user"]["refresh_token"] = refresh_token
        result["user"]["expires_in"] = TOKEN_EXPIRY
        
        return AuthResponse(success=True, user=result["user"])
    else:
        return AuthResponse(success=False, error=result.get("error", "Registration failed"))


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login user"""
    # Authenticate user
    result = database.authenticate_user(request.email, request.password)
    
    if result["success"]:
        # Generate tokens
        access_token = secrets.token_urlsafe(32)
        refresh_token = secrets.token_urlsafe(32)
        
        # Store tokens
        user_id = result["user"]["id"]
        token_store[user_id] = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "created_at": time.time(),
            "expires_at": time.time() + TOKEN_EXPIRY,
            "refresh_expires_at": time.time() + REFRESH_TOKEN_EXPIRY
        }
        
        # Add tokens to user data
        result["user"]["access_token"] = access_token
        result["user"]["refresh_token"] = refresh_token
        result["user"]["expires_in"] = TOKEN_EXPIRY
        
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


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    # Find user with this refresh token
    user_id = None
    for uid, tokens in token_store.items():
        if tokens.get("refresh_token") == request.refresh_token:
            user_id = uid
            break
    
    if not user_id:
        return TokenResponse(success=False, error="Invalid refresh token")
    
    # Check if refresh token is still valid
    token_data = token_store.get(user_id)
    if not token_data:
        return TokenResponse(success=False, error="Token not found")
    
    current_time = time.time()
    if current_time > token_data.get("refresh_expires_at", 0):
        # Refresh token expired, remove from store
        del token_store[user_id]
        return TokenResponse(success=False, error="Refresh token expired. Please login again.")
    
    # Generate new access token
    new_access_token = secrets.token_urlsafe(32)
    
    # Update token store
    token_store[user_id]["access_token"] = new_access_token
    token_store[user_id]["expires_at"] = current_time + TOKEN_EXPIRY
    
    return TokenResponse(
        success=True,
        access_token=new_access_token,
        refresh_token=request.refresh_token,
        expires_in=TOKEN_EXPIRY
    )


@router.post("/logout")
async def logout(request: RefreshTokenRequest):
    """Logout user and invalidate tokens"""
    # Find user with this refresh token
    user_id = None
    for uid, tokens in token_store.items():
        if tokens.get("refresh_token") == request.refresh_token:
            user_id = uid
            break
    
    if user_id and user_id in token_store:
        del token_store[user_id]
    return {"success": True, "message": "Logged out successfully"}
