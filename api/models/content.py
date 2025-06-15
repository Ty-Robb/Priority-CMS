from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ContentStatus(str, Enum):
    DRAFT = "Draft"
    PUBLISHED = "Published"
    ARCHIVED = "Archived"

class BlockType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    BUTTON = "button"
    LIST = "list"
    QUOTE = "quote"
    CONTAINER = "container"

class BlockProps(BaseModel):
    """Base class for block properties"""
    pass

class TextBlockProps(BlockProps):
    text: str
    level: Optional[str] = "p"  # p, h1, h2, h3, h4, h5, h6

class ImageBlockProps(BlockProps):
    src: str
    alt: str
    width: Optional[int] = None
    height: Optional[int] = None
    dataAiHint: Optional[str] = None

class ButtonBlockProps(BlockProps):
    text: str
    variant: Optional[str] = "default"  # default, destructive, outline, secondary, ghost, link
    href: Optional[str] = None

class ListItemType(BaseModel):
    id: str
    text: str

class ListBlockProps(BlockProps):
    items: List[ListItemType]
    ordered: bool = False

class QuoteBlockProps(BlockProps):
    text: str
    citation: Optional[str] = None

class ContainerBlockProps(BlockProps):
    pass

class VisualBlock(BaseModel):
    id: str
    type: BlockType
    props: Dict[str, Any]  # Will contain the appropriate props based on type
    children: Optional[List['VisualBlock']] = None

class PageStructure(BaseModel):
    id: str
    title: str
    blocks: List[VisualBlock]

class ContentBase(BaseModel):
    title: str
    body: str
    status: ContentStatus = ContentStatus.DRAFT
    contentType: str
    keywords: List[str] = []
    generatedHeadlines: List[str] = []
    pageStructure: Optional[PageStructure] = None

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    status: Optional[ContentStatus] = None
    contentType: Optional[str] = None
    keywords: Optional[List[str]] = None
    generatedHeadlines: Optional[List[str]] = None
    pageStructure: Optional[PageStructure] = None

class ContentResponse(ContentBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
