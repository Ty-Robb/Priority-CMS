from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from models.content import ContentCreate, ContentUpdate, ContentResponse, ContentStatus
from models.user import User
from services.content_service import ContentService
from middleware.auth import get_current_user, get_optional_user
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Initialize content service
content_service = ContentService()

@router.get("/", response_model=List[ContentResponse])
async def get_all_content(
    status: Optional[str] = Query(None, description="Filter by content status"),
    current_user: User = Depends(get_current_user)
):
    """
    Get all content pieces
    
    Optionally filter by status (Draft, Published, Archived)
    """
    try:
        if status:
            # Validate status
            try:
                content_status = ContentStatus(status)
                return await content_service.get_by_status(content_status.value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status}. Must be one of: {[s.value for s in ContentStatus]}"
                )
        else:
            return await content_service.get_all()
    except Exception as e:
        logger.error(f"Error getting content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving content"
        )

@router.get("/public", response_model=List[ContentResponse])
async def get_public_content(
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get published content for public consumption
    
    This endpoint is accessible without authentication
    """
    try:
        return await content_service.get_by_status(ContentStatus.PUBLISHED.value)
    except Exception as e:
        logger.error(f"Error getting public content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving public content"
        )

@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get content by ID"""
    try:
        content = await content_service.get_by_id(content_id)
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Content with ID {content_id} not found"
            )
        return content
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting content by ID: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving content"
        )

@router.post("/", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(
    content: ContentCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new content"""
    try:
        return await content_service.create(content, current_user.id)
    except Exception as e:
        logger.error(f"Error creating content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating content"
        )

@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: str,
    content: ContentUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update existing content"""
    try:
        updated_content = await content_service.update(content_id, content, current_user.id)
        if not updated_content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Content with ID {content_id} not found"
            )
        return updated_content
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating content"
        )

@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete content"""
    try:
        deleted = await content_service.delete(content_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Content with ID {content_id} not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting content"
        )
