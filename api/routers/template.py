from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import List, Optional
from models.template import (
    TemplateCreate, TemplateUpdate, TemplateResponse, 
    TemplateVersion, TemplateStatus, TemplateType
)
from services.template_service import TemplateService
from middleware.auth import get_current_user
from models.user import User

router = APIRouter(
    prefix="/api/templates",
    tags=["templates"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=dict)
async def get_all_templates(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """
    Get all templates with pagination.
    """
    template_service = TemplateService()
    templates, pagination = await template_service.get_all(page, page_size)
    return {
        "items": templates,
        "pagination": pagination
    }

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str = Path(..., description="The ID of the template to get"),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific template by ID.
    """
    template_service = TemplateService()
    template = await template_service.get_by_id(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    return template

@router.get("/type/{template_type}", response_model=dict)
async def get_templates_by_type(
    template_type: TemplateType,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """
    Get templates by type with pagination.
    """
    template_service = TemplateService()
    templates, pagination = await template_service.get_by_type(template_type, page, page_size)
    return {
        "items": templates,
        "pagination": pagination
    }

@router.get("/status/{status}", response_model=dict)
async def get_templates_by_status(
    status: TemplateStatus,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user)
):
    """
    Get templates by status with pagination.
    """
    template_service = TemplateService()
    templates, pagination = await template_service.get_by_status(status, page, page_size)
    return {
        "items": templates,
        "pagination": pagination
    }

@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template: TemplateCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new template.
    """
    # Check if user has permission to create templates
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create templates"
        )
    
    template_service = TemplateService()
    return await template_service.create(template, current_user.id)

@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template: TemplateUpdate,
    template_id: str = Path(..., description="The ID of the template to update"),
    changes: Optional[str] = Query(None, description="Description of changes made"),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing template.
    """
    # Check if user has permission to update templates
    if current_user.role not in ["admin", "editor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update templates"
        )
    
    template_service = TemplateService()
    updated_template = await template_service.update(template_id, template, current_user.id, changes)
    if not updated_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    return updated_template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str = Path(..., description="The ID of the template to delete"),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a template.
    """
    # Check if user has permission to delete templates
    if current_user.role not in ["admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete templates"
        )
    
    template_service = TemplateService()
    result = await template_service.delete(template_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )

@router.get("/{template_id}/versions", response_model=List[TemplateVersion])
async def get_template_versions(
    template_id: str = Path(..., description="The ID of the template to get versions for"),
    current_user: User = Depends(get_current_user)
):
    """
    Get all versions of a template.
    """
    template_service = TemplateService()
    
    # First check if the template exists
    template = await template_service.get_by_id(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    
    # Get versions
    versions = await template_service.get_versions(template_id)
    return versions
