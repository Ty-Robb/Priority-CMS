from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from enum import Enum

class TemplateStatus(str, Enum):
    """Status of a template"""
    DRAFT = "Draft"
    PUBLISHED = "Published"
    ARCHIVED = "Archived"

class TemplateType(str, Enum):
    """Type of template"""
    PAGE = "Page"
    SECTION = "Section"
    COMPONENT = "Component"
    EMAIL = "Email"
    SOCIAL = "Social"

class FieldType(str, Enum):
    """Type of field in a template"""
    TEXT = "Text"
    RICH_TEXT = "RichText"
    NUMBER = "Number"
    BOOLEAN = "Boolean"
    DATE = "Date"
    IMAGE = "Image"
    FILE = "File"
    REFERENCE = "Reference"
    SELECT = "Select"
    MULTI_SELECT = "MultiSelect"
    COLOR = "Color"
    URL = "URL"
    EMAIL = "Email"
    PHONE = "Phone"
    LOCATION = "Location"
    JSON = "JSON"
    MARKDOWN = "Markdown"
    CODE = "Code"

class FieldValidation(BaseModel):
    """Validation rules for a field"""
    required: bool = False
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    pattern: Optional[str] = None
    options: Optional[List[str]] = None
    default_value: Optional[Any] = None

class TemplateField(BaseModel):
    """Field definition for a template"""
    id: str
    name: str
    description: Optional[str] = None
    type: FieldType
    validation: Optional[FieldValidation] = None
    is_localized: bool = False
    is_searchable: bool = False
    is_hidden: bool = False
    group: Optional[str] = None
    order: int = 0

class TemplateSection(BaseModel):
    """Section in a template"""
    id: str
    name: str
    description: Optional[str] = None
    fields: List[TemplateField]
    is_repeatable: bool = False
    min_items: Optional[int] = None
    max_items: Optional[int] = None
    order: int = 0

class TemplateCreate(BaseModel):
    """Model for creating a new template"""
    name: str
    description: Optional[str] = None
    type: TemplateType
    sections: List[TemplateSection]
    status: TemplateStatus = TemplateStatus.DRAFT
    is_default: bool = False
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class TemplateUpdate(BaseModel):
    """Model for updating a template"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[TemplateType] = None
    sections: Optional[List[TemplateSection]] = None
    status: Optional[TemplateStatus] = None
    is_default: Optional[bool] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class TemplateVersion(BaseModel):
    """Version of a template"""
    version: int
    created_at: datetime
    created_by: str
    changes: Optional[str] = None
    template_data: Dict[str, Any]

class TemplateResponse(BaseModel):
    """Response model for template information"""
    id: str
    name: str
    description: Optional[str] = None
    type: TemplateType
    sections: List[TemplateSection]
    status: TemplateStatus
    is_default: bool = False
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    version: int = 1
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: str
    
    class Config:
        from_attributes = True
