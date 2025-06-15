from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from models.user import User
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Set up security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Firebase ID token and get current user
    
    This middleware function verifies the Firebase ID token in the Authorization header
    and returns the user information if the token is valid.
    """
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
            photo_url=user_record.photo_url
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Similar to get_current_user but doesn't raise an exception if authentication fails
    
    This is useful for endpoints that can work with or without authentication,
    such as public content that shows additional information for authenticated users.
    """
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
