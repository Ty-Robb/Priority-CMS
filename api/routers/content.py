from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from typing import List, Optional, Dict
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
    content_status: Optional[str] = Query(None, alias="status", description="Filter by content status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """
    Get all content pieces with pagination
    
    Optionally filter by status (Draft, Published, Archived)
    """
    try:
        if content_status:
            # Validate status
            try:
                status_enum = ContentStatus(content_status)
                items, pagination = await content_service.get_by_status(status_enum.value, page, page_size)
                return items
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {content_status}. Must be one of: {[s.value for s in ContentStatus]}"
                )
        else:
            items, pagination = await content_service.get_all(page, page_size)
            return items
    except Exception as e:
        logger.error(f"Error getting content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving content"
        )

@router.get("/paginated", response_model=Dict)
async def get_paginated_content(
    content_status: Optional[str] = Query(None, alias="status", description="Filter by content status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated content with metadata
    
    Returns both content items and pagination metadata
    """
    try:
        if content_status:
            # Validate status
            try:
                status_enum = ContentStatus(content_status)
                items, pagination = await content_service.get_by_status(status_enum.value, page, page_size)
            except ValueError:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {content_status}. Must be one of: {[s.value for s in ContentStatus]}"
                )
        else:
            items, pagination = await content_service.get_all(page, page_size)
        
        return {
            "items": items,
            "pagination": pagination
        }
    except Exception as e:
        logger.error(f"Error getting paginated content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving content"
        )

@router.get("/public", response_model=List[ContentResponse])
async def get_public_content(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get published content for public consumption with pagination
    
    This endpoint is accessible without authentication
    """
    try:
        items, _ = await content_service.get_by_status(ContentStatus.PUBLISHED.value, page, page_size)
        return items
    except Exception as e:
        logger.error(f"Error getting public content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving public content"
        )

@router.get("/public/paginated", response_model=Dict)
async def get_paginated_public_content(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get paginated published content with metadata
    
    Returns both content items and pagination metadata
    """
    try:
        items, pagination = await content_service.get_by_status(ContentStatus.PUBLISHED.value, page, page_size)
        return {
            "items": items,
            "pagination": pagination
        }
    except Exception as e:
        logger.error(f"Error getting paginated public content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
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
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Content with ID {content_id} not found"
            )
        return content
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting content by ID: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving content"
        )

@router.post("/", response_model=ContentResponse, status_code=http_status.HTTP_201_CREATED)
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
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating content"
        )

@router.post("/bulk", response_model=List[ContentResponse], status_code=http_status.HTTP_201_CREATED)
async def bulk_create_content(
    contents: List[ContentCreate],
    current_user: User = Depends(get_current_user)
):
    """Create multiple content items in a batch"""
    try:
        return await content_service.bulk_create(contents, current_user.id)
    except Exception as e:
        logger.error(f"Error bulk creating content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating content items"
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
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Content with ID {content_id} not found"
            )
        return updated_content
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating content"
        )

@router.put("/bulk", response_model=Dict[str, Optional[ContentResponse]])
async def bulk_update_content(
    updates: Dict[str, ContentUpdate],
    current_user: User = Depends(get_current_user)
):
    """Update multiple content items in a batch"""
    try:
        return await content_service.bulk_update(updates, current_user.id)
    except Exception as e:
        logger.error(f"Error bulk updating content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating content items"
        )

@router.delete("/{content_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete content"""
    try:
        deleted = await content_service.delete(content_id)
        if not deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Content with ID {content_id} not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting content"
        )

@router.delete("/bulk", response_model=Dict[str, bool], status_code=http_status.HTTP_200_OK)
async def bulk_delete_content(
    content_ids: List[str],
    current_user: User = Depends(get_current_user)
):
    """Delete multiple content items in a batch"""
    try:
        return await content_service.bulk_delete(content_ids)
    except Exception as e:
        logger.error(f"Error bulk deleting content: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting content items"
        )
