from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi import status as http_status
from typing import List, Optional, Dict, Any
from models.user import User
from services.media_service import MediaService
from middleware.auth import get_current_user, get_optional_user
import logging
from pydantic import BaseModel

# Set up logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Initialize media service
media_service = MediaService()

# Pydantic models for request/response
class MediaMetadataUpdate(BaseModel):
    """Model for updating media metadata"""
    title: Optional[str] = None
    description: Optional[str] = None
    alt_text: Optional[str] = None
    tags: Optional[List[str]] = None

@router.post("/upload", response_model=Dict[str, Any])
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    alt_text: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file to Firebase Storage
    
    Args:
        file: File to upload
        folder: Storage folder (public, users/{user_id}, content/{content_id}, etc.)
        title: Optional title for the file
        description: Optional description for the file
        alt_text: Optional alt text for images
        tags: Optional comma-separated list of tags
        
    Returns:
        File metadata including URL
    """
    try:
        # Prepare custom metadata
        metadata = {}
        if title:
            metadata['title'] = title
        if description:
            metadata['description'] = description
        if alt_text:
            metadata['alt_text'] = alt_text
        if tags:
            metadata['tags'] = [tag.strip() for tag in tags.split(',')]
        
        # Get content type
        content_type = file.content_type
        if not content_type:
            content_type = media_service.get_mime_type(file.filename)
        
        # Upload file
        result = await media_service.upload_file(
            file=file.file,
            filename=file.filename,
            content_type=content_type,
            folder=folder,
            user=current_user,
            metadata=metadata
        )
        
        return result
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while uploading the file"
        )

@router.get("/{media_id}", response_model=Dict[str, Any])
async def get_file_metadata(
    media_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get file metadata
    
    Args:
        media_id: ID of the media file
        
    Returns:
        File metadata including URL
    """
    try:
        metadata = await media_service.get_file_metadata(media_id)
        if not metadata:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Media with ID {media_id} not found"
            )
        
        return metadata
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting file metadata: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving file metadata"
        )

@router.get("/folder/{folder}", response_model=Dict)
async def get_files_by_folder(
    folder: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """
    Get files by folder with pagination
    
    Args:
        folder: Storage folder to filter by
        page: Page number (1-based)
        page_size: Number of items per page
        
    Returns:
        Dictionary with items and pagination metadata
    """
    try:
        items, pagination = await media_service.get_files_by_folder(folder, page, page_size)
        
        return {
            "items": items,
            "pagination": pagination
        }
    except Exception as e:
        logger.error(f"Error getting files by folder: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving files"
        )

@router.put("/{media_id}", response_model=Dict[str, Any])
async def update_file_metadata(
    media_id: str,
    metadata: MediaMetadataUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update file metadata
    
    Args:
        media_id: ID of the media file
        metadata: New metadata to update
        
    Returns:
        Updated metadata
    """
    try:
        updated_metadata = await media_service.update_file_metadata(
            media_id=media_id,
            metadata=metadata.model_dump(exclude_unset=True),
            user=current_user
        )
        
        if not updated_metadata:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Media with ID {media_id} not found"
            )
        
        return updated_metadata
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating file metadata: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating file metadata"
        )

@router.delete("/{media_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_file(
    media_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a file
    
    Args:
        media_id: ID of the media file
    """
    try:
        deleted = await media_service.delete_file(media_id, current_user)
        if not deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Media with ID {media_id} not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the file"
        )

@router.get("/public/{folder}", response_model=Dict)
async def get_public_files_by_folder(
    folder: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get public files by folder with pagination
    
    This endpoint is accessible without authentication for public folders
    
    Args:
        folder: Storage folder to filter by (must be 'public' or start with 'public/')
        page: Page number (1-based)
        page_size: Number of items per page
        
    Returns:
        Dictionary with items and pagination metadata
    """
    try:
        # Validate that the folder is public
        if not folder.startswith('public'):
            raise HTTPException(
                status_code=http_status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only public folders are accessible without authentication."
            )
        
        items, pagination = await media_service.get_files_by_folder(folder, page, page_size)
        
        return {
            "items": items,
            "pagination": pagination
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting public files by folder: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving files"
        )
