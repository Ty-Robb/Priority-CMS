from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from models.user import User
import logging
import os

# Set up logging
logger = logging.getLogger(__name__)

# Check if we're in development mode
DEV_MODE = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')

# Set up security
security = HTTPBearer(auto_error=True)
optional_security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), request: Request = None):
    """
    Verify Firebase ID token and get current user
    
    This middleware function verifies the Firebase ID token in the Authorization header
    and returns the user information if the token is valid.
    
    In development mode (DEBUG=True), it can return a mock user for testing.
    """
    # In development mode, always return a mock user
    if DEV_MODE:
        logger.warning("Using mock user for development")
        return User(
            id="dev-user-123",
            email="dev@example.com",
            display_name="Development User",
            photo_url=None,
            role="admin"  # Give admin role in development
        )
    
    # In production mode, require proper authentication
    try:
        token = credentials.credentials
        # Verify the ID token
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # Get user details from Firebase
        user_record = auth.get_user(uid)
        
        # Create User object
        return User(
            id=uid,
            email=user_record.email,
            display_name=user_record.display_name,
            photo_url=user_record.photo_url,
            role=user_record.custom_claims.get('role', 'user') if user_record.custom_claims else 'user'
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(optional_security), request: Request = None):
    """
    Similar to get_current_user but doesn't raise an exception if authentication fails
    
    This is useful for endpoints that can work with or without authentication,
    such as public content that shows additional information for authenticated users.
    """
    # In development mode, always return a mock user
    if DEV_MODE:
        logger.warning("Using mock user for development")
        return User(
            id="dev-user-123",
            email="dev@example.com",
            display_name="Development User",
            photo_url=None,
            role="admin"  # Give admin role in development
        )
    
    # In production mode, try to authenticate but don't require it
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials, request)
    except HTTPException:
        return None
