from db import firestore_db
from db.firestore import PaginationOptions, QueryResult
from models.template import (
    TemplateCreate, TemplateUpdate, TemplateResponse, 
    TemplateVersion, TemplateStatus, TemplateType
)
from typing import List, Optional, Dict, Any, Tuple
import logging
from datetime import datetime
import os
import uuid
from google.cloud.firestore_v1.base_query import FieldFilter

# Set up logging
logger = logging.getLogger(__name__)

class TemplateService:
    """Service for handling template operations"""
    
    def __init__(self):
        """Initialize the template service with Firestore client"""
        self.db = firestore_db
        self.collection_name = 'templates'
        self.versions_collection = 'template_versions'
        self.dev_mode = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
        
        # In development mode, use an in-memory store
        if self.dev_mode:
            self._mock_data: Dict[str, dict] = {}
            self._mock_versions: Dict[str, List[dict]] = {}
            # Add some sample data
            self._add_sample_data()
            logger.info("Template service initialized in development mode with mock data")
    
    def _add_sample_data(self):
        """Add sample data for development mode"""
        sample_data = [
            {
                "id": str(uuid.uuid4()),
                "name": "Basic Page Template",
                "description": "A simple page template with header, content, and footer sections.",
                "type": TemplateType.PAGE.value,
                "sections": [
                    {
                        "id": "header",
                        "name": "Header",
                        "description": "Page header section",
                        "fields": [
                            {
                                "id": "title",
                                "name": "Title",
                                "description": "Page title",
                                "type": "Text",
                                "validation": {
                                    "required": True,
                                    "max_length": 100
                                },
                                "is_searchable": True,
                                "order": 0
                            }
                        ],
                        "is_repeatable": False,
                        "order": 0
                    },
                    {
                        "id": "content",
                        "name": "Content",
                        "description": "Main content section",
                        "fields": [
                            {
                                "id": "body",
                                "name": "Body",
                                "description": "Main content body",
                                "type": "RichText",
                                "validation": {
                                    "required": True
                                },
                                "is_searchable": True,
                                "order": 0
                            }
                        ],
                        "is_repeatable": False,
                        "order": 1
                    }
                ],
                "status": TemplateStatus.PUBLISHED.value,
                "is_default": True,
                "version": 1,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "created_by": "system",
                "updated_by": "system"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Blog Post Template",
                "description": "A template for blog posts with header, content, and author sections.",
                "type": TemplateType.PAGE.value,
                "sections": [
                    {
                        "id": "header",
                        "name": "Header",
                        "description": "Blog post header section",
                        "fields": [
                            {
                                "id": "title",
                                "name": "Title",
                                "description": "Blog post title",
                                "type": "Text",
                                "validation": {
                                    "required": True,
                                    "max_length": 100
                                },
                                "is_searchable": True,
                                "order": 0
                            }
                        ],
                        "is_repeatable": False,
                        "order": 0
                    },
                    {
                        "id": "content",
                        "name": "Content",
                        "description": "Main content section",
                        "fields": [
                            {
                                "id": "body",
                                "name": "Body",
                                "description": "Main content body",
                                "type": "RichText",
                                "validation": {
                                    "required": True
                                },
                                "is_searchable": True,
                                "order": 0
                            }
                        ],
                        "is_repeatable": False,
                        "order": 1
                    }
                ],
                "status": TemplateStatus.PUBLISHED.value,
                "is_default": False,
                "version": 1,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "created_by": "system",
                "updated_by": "system"
            }
        ]
        
        for item in sample_data:
            item_id = item.pop("id")
            self._mock_data[item_id] = item
            self._mock_versions[item_id] = [
                {
                    "version": 1,
                    "created_at": item["created_at"],
                    "created_by": item["created_by"],
                    "changes": "Initial version",
                    "template_data": item.copy()
                }
            ]
    
    async def get_all(self, page: int = 1, page_size: int = 10) -> Tuple[List[TemplateResponse], dict]:
        """Get all templates with pagination"""
        # Ensure _mock_data is initialized
        if not hasattr(self, '_mock_data'):
            self._mock_data = {}
            self._mock_versions = {}
            self._add_sample_data()
            
        try:
            if self.dev_mode:
                # In development mode, return mock data with pagination
                start_idx = (page - 1) * page_size
                end_idx = start_idx + page_size
                
                # Sort by updatedAt (descending)
                sorted_items = sorted(
                    self._mock_data.items(),
                    key=lambda x: x[1].get('updated_at', datetime.min),
                    reverse=True
                )
                
                # Get items for current page
                page_items = sorted_items[start_idx:end_idx]
                
                # Create TemplateResponse objects
                items = [
                    TemplateResponse(id=doc_id, **doc_data)
                    for doc_id, doc_data in page_items
                ]
                
                # Create pagination metadata
                total = len(self._mock_data)
                total_pages = (total + page_size - 1) // page_size
                
                pagination = {
                    "page": page,
                    "page_size": page_size,
                    "total_items": total,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                }
                
                return items, pagination
            
            # In production mode, use Firestore with pagination
            # Calculate pagination options
            pagination = PaginationOptions(
                limit=page_size
            )
            
            # Execute the query
            from firebase_admin import firestore
            result = self.db.query_documents(
                self.collection_name,
                order_by=[('updated_at', firestore.Query.DESCENDING)],
                pagination=pagination
            )
            
            # Convert to TemplateResponse objects
            items = [TemplateResponse(**item) for item in result.items]
            
            # Create pagination metadata
            pagination_meta = {
                "page": page,
                "page_size": page_size,
                "has_next": result.has_more,
                "has_prev": page > 1
            }
            
            return items, pagination_meta
        except Exception as e:
            logger.error(f"Error getting all templates: {str(e)}")
            # Return mock data as fallback
            if not hasattr(self, '_mock_data'):
                self._mock_data = {}
                self._mock_versions = {}
                self._add_sample_data()
                
            items = [
                TemplateResponse(id=doc_id, **doc_data)
                for doc_id, doc_data in self._mock_data.items()
            ]
            pagination = {
                "page": 1,
                "page_size": len(items),
                "total_items": len(items),
                "total_pages": 1,
                "has_next": False,
                "has_prev": False
            }
            return items, pagination
    
    async def get_by_id(self, template_id: str) -> Optional[TemplateResponse]:
        """Get template by ID"""
        # Ensure _mock_data is initialized
        if not hasattr(self, '_mock_data'):
            self._mock_data = {}
            self._mock_versions = {}
            self._add_sample_data()
            
        try:
            if self.dev_mode:
                # In development mode, return mock data
                if template_id in self._mock_data:
                    return TemplateResponse(id=template_id, **self._mock_data[template_id])
                return None
            
            # In production mode, use Firestore
            doc = self.db.get_document(self.collection_name, template_id)
            if not doc:
                return None
            
            # Convert to TemplateResponse
            doc['id'] = template_id
            return TemplateResponse(**doc)
        except Exception as e:
            logger.error(f"Error getting template by ID: {str(e)}")
            # Return mock data as fallback
            if template_id in self._mock_data:
                return TemplateResponse(id=template_id, **self._mock_data[template_id])
            return None
    
    async def create(self, template: TemplateCreate, user_id: str) -> TemplateResponse:
        """Create new template"""
        # Ensure _mock_data is initialized
        if not hasattr(self, '_mock_data'):
            self._mock_data = {}
            self._mock_versions = {}
            self._add_sample_data()
            
        try:
            now = datetime.utcnow()
            template_dict = template.model_dump()
            template_dict['created_at'] = now
            template_dict['updated_at'] = now
            template_dict['created_by'] = user_id
            template_dict['updated_by'] = user_id
            template_dict['version'] = 1
            
            if self.dev_mode:
                # In development mode, add to mock data
                doc_id = str(uuid.uuid4())
                self._mock_data[doc_id] = template_dict
                
                # Add initial version
                if doc_id not in self._mock_versions:
                    self._mock_versions[doc_id] = []
                
                self._mock_versions[doc_id].append({
                    "version": 1,
                    "created_at": now,
                    "created_by": user_id,
                    "changes": "Initial version",
                    "template_data": template_dict.copy()
                })
                
                return TemplateResponse(id=doc_id, **template_dict)
            
            # In production mode, add to Firestore
            doc_id = self.db.add_document(self.collection_name, template_dict)
            
            # Add initial version
            version_data = {
                "template_id": doc_id,
                "version": 1,
                "created_at": now,
                "created_by": user_id,
                "changes": "Initial version",
                "template_data": template_dict
            }
            self.db.add_document(self.versions_collection, version_data)
            
            return TemplateResponse(id=doc_id, **template_dict)
        except Exception as e:
            logger.error(f"Error creating template: {str(e)}")
            # Create in mock data as fallback
            doc_id = str(uuid.uuid4())
            self._mock_data[doc_id] = template_dict
            
            if doc_id not in self._mock_versions:
                self._mock_versions[doc_id] = []
            
            self._mock_versions[doc_id].append({
                "version": 1,
                "created_at": now,
                "created_by": user_id,
                "changes": "Initial version",
                "template_data": template_dict.copy()
            })
            
            return TemplateResponse(id=doc_id, **template_dict)
    
    async def update(self, template_id: str, template: TemplateUpdate, user_id: str, changes: Optional[str] = None) -> Optional[TemplateResponse]:
        """Update existing template"""
        # Ensure _mock_data is initialized
        if not hasattr(self, '_mock_data'):
            self._mock_data = {}
            self._mock_versions = {}
            self._add_sample_data()
            
        try:
            if self.dev_mode:
                # In development mode, update mock data
                if template_id not in self._mock_data:
                    return None
                
                # Get current template
                current_template = self._mock_data[template_id].copy()
                
                # Update template
                template_dict = template.model_dump(exclude_unset=True)
                template_dict['updated_at'] = datetime.utcnow()
                template_dict['updated_by'] = user_id
                template_dict['version'] = current_template.get('version', 1) + 1
                
                self._mock_data[template_id].update(template_dict)
                
                # Add new version
                if template_id not in self._mock_versions:
                    self._mock_versions[template_id] = []
                
                self._mock_versions[template_id].append({
                    "version": template_dict['version'],
                    "created_at": template_dict['updated_at'],
                    "created_by": user_id,
                    "changes": changes or f"Updated to version {template_dict['version']}",
                    "template_data": self._mock_data[template_id].copy()
                })
                
                return TemplateResponse(id=template_id, **self._mock_data[template_id])
            
            # In production mode, use Firestore
            # Get current template
            current_doc = self.db.get_document(self.collection_name, template_id)
            if not current_doc:
                return None
            
            # Update template
            template_dict = template.model_dump(exclude_unset=True)
            template_dict['updated_at'] = datetime.utcnow()
            template_dict['updated_by'] = user_id
            template_dict['version'] = current_doc.get('version', 1) + 1
            
            self.db.update_document(self.collection_name, template_id, template_dict)
            
            # Add new version
            updated_doc = self.db.get_document(self.collection_name, template_id)
            version_data = {
                "template_id": template_id,
                "version": template_dict['version'],
                "created_at": template_dict['updated_at'],
                "created_by": user_id,
                "changes": changes or f"Updated to version {template_dict['version']}",
                "template_data": updated_doc
            }
            self.db.add_document(self.versions_collection, version_data)
            
            # Return updated template
            updated_doc['id'] = template_id
            return TemplateResponse(**updated_doc)
        except Exception as e:
            logger.error(f"Error updating template: {str(e)}")
            # Update mock data as fallback
            if template_id in self._mock_data:
                # Get current template
                current_template = self._mock_data[template_id].copy()
                
                # Update template
                template_dict = template.model_dump(exclude_unset=True)
                template_dict['updated_at'] = datetime.utcnow()
                template_dict['updated_by'] = user_id
                template_dict['version'] = current_template.get('version', 1) + 1
                
                self._mock_data[template_id].update(template_dict)
                
                # Add new version
                if template_id not in self._mock_versions:
                    self._mock_versions[template_id] = []
                
                self._mock_versions[template_id].append({
                    "version": template_dict['version'],
                    "created_at": template_dict['updated_at'],
                    "created_by": user_id,
                    "changes": changes or f"Updated to version {template_dict['version']}",
                    "template_data": self._mock_data[template_id].copy()
                })
                
                return TemplateResponse(id=template_id, **self._mock_data[template_id])
            return None
    
    async def delete(self, template_id: str) -> bool:
        """Delete template"""
        # Ensure _mock_data is initialized
        if not hasattr(self, '_mock_data'):
            self._mock_data = {}
            self._mock_versions = {}
            self._add_sample_data()
            
        try:
            if self.dev_mode:
                # In development mode, delete from mock data
                if template_id not in self._mock_data:
                    return False
                
                del self._mock_data[template_id]
                if template_id in self._mock_versions:
                    del self._mock_versions[template_id]
                
                return True
            
            # In production mode, use Firestore
            result = self.db.delete_document(self.collection_name, template_id)
            
            # Delete all versions
            if result:
                # Query for versions with this template_id
                from google.cloud.firestore_v1.base_query import FieldFilter
                template_filter = FieldFilter("template_id", "==", template_id)
                versions = self.db.query_documents(
                    self.versions_collection,
                    filters=[template_filter]
                )
                
                # Delete each version
                for version in versions.items:
                    self.db.delete_document(self.versions_collection, version['id'])
            
            return result
        except Exception as e:
            logger.error(f"Error deleting template: {str(e)}")
            # Delete from mock data as fallback
            if template_id in self._mock_data:
                del self._mock_data[template_id]
                if template_id in self._mock_versions:
                    del self._mock_versions[template_id]
                return True
            return False
    
    async def get_versions(self, template_id: str) -> List[TemplateVersion]:
        """Get all versions of a template"""
        # Ensure _mock_data is initialized
        if not hasattr(self, '_mock_data'):
            self._mock_data = {}
            self._mock_versions = {}
            self._add_sample_data()
            
        try:
            if self.dev_mode:
                # In development mode, return mock versions
                if template_id not in self._mock_versions:
                    return []
                
                return [
                    TemplateVersion(**version)
                    for version in self._mock_versions[template_id]
                ]
            
            # In production mode, use Firestore
            from google.cloud.firestore_v1.base_query import FieldFilter
            template_filter = FieldFilter("template_id", "==", template_id)
            from firebase_admin import firestore
            result = self.db.query_documents(
                self.versions_collection,
                filters=[template_filter],
                order_by=[('version', firestore.Query.ASCENDING)]
            )
            
            return [TemplateVersion(**version) for version in result.items]
        except Exception as e:
            logger.error(f"Error getting template versions: {str(e)}")
            # Return mock versions as fallback
            if template_id in self._mock_versions:
                return [
                    TemplateVersion(**version)
                    for version in self._mock_versions[template_id]
                ]
            return []
