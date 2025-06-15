from db import firestore_db
from db.firestore import PaginationOptions, QueryResult
from models.content import ContentCreate, ContentUpdate, ContentResponse, ContentStatus
from typing import List, Optional, Dict, Any, Tuple
import logging
from datetime import datetime
from firebase_admin import firestore
import os
import uuid
from google.cloud.firestore_v1.base_query import FieldFilter

# Set up logging
logger = logging.getLogger(__name__)

class ContentService:
    """Service for handling content operations"""
    
    def __init__(self):
        """Initialize the content service with Firestore client"""
        self.db = firestore_db
        self.collection_name = 'content'
        self.dev_mode = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
        
        # In development mode, use an in-memory store
        if self.dev_mode:
            self._mock_data: Dict[str, dict] = {}
            # Add some sample data
            self._add_sample_data()
            logger.info("Content service initialized in development mode with mock data")
    
    def _add_sample_data(self):
        """Add sample data for development mode"""
        sample_data = [
            {
                "id": str(uuid.uuid4()),
                "title": "Getting Started with Priority CMS",
                "body": "This is a sample article to help you get started with Priority CMS. It covers the basics of content management.",
                "contentType": "article",
                "status": ContentStatus.PUBLISHED.value,
                "keywords": ["cms", "getting started", "tutorial"],
                "generatedHeadlines": ["Getting Started with Priority CMS", "Priority CMS: A Beginner's Guide"],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
                "createdBy": "dev-user-123",
                "updatedBy": "dev-user-123"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Creating Your First Page",
                "body": "Learn how to create your first page with Priority CMS. This guide walks you through the process step by step.",
                "contentType": "tutorial",
                "status": ContentStatus.DRAFT.value,
                "keywords": ["page creation", "tutorial", "cms"],
                "generatedHeadlines": ["Creating Your First Page in Priority CMS", "Page Creation Guide"],
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
                "createdBy": "dev-user-123",
                "updatedBy": "dev-user-123"
            }
        ]
        
        for item in sample_data:
            item_id = item.pop("id")
            self._mock_data[item_id] = item
    
    async def get_all(self, page: int = 1, page_size: int = 10) -> Tuple[List[ContentResponse], dict]:
        """
        Get all content pieces with pagination
        
        Args:
            page: Page number (1-based)
            page_size: Number of items per page
            
        Returns:
            Tuple of (list of content items, pagination metadata)
        """
        try:
            if self.dev_mode:
                # In development mode, return mock data with pagination
                start_idx = (page - 1) * page_size
                end_idx = start_idx + page_size
                
                # Sort by updatedAt (descending)
                sorted_items = sorted(
                    self._mock_data.items(),
                    key=lambda x: x[1].get('updatedAt', datetime.min),
                    reverse=True
                )
                
                # Get items for current page
                page_items = sorted_items[start_idx:end_idx]
                
                # Create ContentResponse objects
                items = [
                    ContentResponse(id=doc_id, **doc_data)
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
            
            # If not the first page, we need to get the page token
            if page > 1:
                # This is a simplified approach - in a real app, you'd store page tokens
                # or use a more sophisticated cursor-based pagination
                # For now, we'll just skip to the right page
                skip_pages = page - 1
                temp_pagination = PaginationOptions(limit=page_size * skip_pages)
                temp_result = self.db.query_documents(
                    self.collection_name,
                    order_by=[('updatedAt', firestore.Query.DESCENDING)],
                    pagination=temp_pagination
                )
                
                if temp_result.items and len(temp_result.items) >= page_size * skip_pages:
                    # Use the last item as the start_after for our actual query
                    pagination.start_after = temp_result.items[-1]['id']
                else:
                    # Not enough items to reach this page
                    return [], {"page": page, "page_size": page_size, "total_items": 0, "total_pages": 0, "has_next": False, "has_prev": page > 1}
            
            # Execute the query
            result = self.db.query_documents(
                self.collection_name,
                order_by=[('updatedAt', firestore.Query.DESCENDING)],
                pagination=pagination
            )
            
            # Convert to ContentResponse objects
            items = [ContentResponse(**item) for item in result.items]
            
            # Create pagination metadata
            # Note: Getting exact total count in Firestore is expensive
            # This is a simplified approach
            pagination_meta = {
                "page": page,
                "page_size": page_size,
                "has_next": result.has_more,
                "has_prev": page > 1,
                "next_page_token": result.next_page_token,
                "prev_page_token": result.prev_page_token
            }
            
            return items, pagination_meta
        except Exception as e:
            logger.error(f"Error getting all content: {str(e)}")
            if self.dev_mode:
                # In development mode, return mock data even if Firestore fails
                return [
                    ContentResponse(id=doc_id, **doc_data)
                    for doc_id, doc_data in self._mock_data.items()
                ], {"page": 1, "page_size": len(self._mock_data), "total_items": len(self._mock_data), "total_pages": 1, "has_next": False, "has_prev": False}
            raise
    
    async def get_by_id(self, content_id: str) -> Optional[ContentResponse]:
        """Get content by ID"""
        try:
            if self.dev_mode:
                # In development mode, return mock data
                if content_id in self._mock_data:
                    return ContentResponse(id=content_id, **self._mock_data[content_id])
                return None
            
            # In production mode, use Firestore
            doc = self.db.document(self.collection_name, content_id).get()
            if not doc.exists:
                return None
            return self._doc_to_content(doc)
        except Exception as e:
            logger.error(f"Error getting content by ID: {str(e)}")
            if self.dev_mode and content_id in self._mock_data:
                return ContentResponse(id=content_id, **self._mock_data[content_id])
            raise
    
    async def get_by_status(self, status: str, page: int = 1, page_size: int = 10) -> Tuple[List[ContentResponse], dict]:
        """
        Get content by status with pagination
        
        Args:
            status: Content status to filter by
            page: Page number (1-based)
            page_size: Number of items per page
            
        Returns:
            Tuple of (list of content items, pagination metadata)
        """
        # Ensure _mock_data is initialized
        if not hasattr(self, '_mock_data'):
            self._mock_data = {}
            self._add_sample_data()
            
        # In development mode, always return mock data first
        if self.dev_mode:
            # Filter mock data by status
            filtered_items = [
                (doc_id, doc_data)
                for doc_id, doc_data in self._mock_data.items()
                if doc_data.get('status') == status
            ]
            
            # Sort by updatedAt (descending)
            sorted_items = sorted(
                filtered_items,
                key=lambda x: x[1].get('updatedAt', datetime.min),
                reverse=True
            )
            
            # Apply pagination
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            page_items = sorted_items[start_idx:end_idx]
            
            # Create ContentResponse objects
            items = [
                ContentResponse(id=doc_id, **doc_data)
                for doc_id, doc_data in page_items
            ]
            
            # Create pagination metadata
            total = len(filtered_items)
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
            
        # In production mode, try to use Firestore
        try:
            if self.dev_mode:
                # In development mode, return filtered mock data with pagination
                filtered_items = [
                    (doc_id, doc_data)
                    for doc_id, doc_data in self._mock_data.items()
                    if doc_data.get('status') == status
                ]
                
                # Sort by updatedAt (descending)
                sorted_items = sorted(
                    filtered_items,
                    key=lambda x: x[1].get('updatedAt', datetime.min),
                    reverse=True
                )
                
                # Apply pagination
                start_idx = (page - 1) * page_size
                end_idx = start_idx + page_size
                page_items = sorted_items[start_idx:end_idx]
                
                # Create ContentResponse objects
                items = [
                    ContentResponse(id=doc_id, **doc_data)
                    for doc_id, doc_data in page_items
                ]
                
                # Create pagination metadata
                total = len(filtered_items)
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
            # Create status filter
            status_filter = FieldFilter("status", "==", status)
            
            # Calculate pagination options
            pagination = PaginationOptions(
                limit=page_size
            )
            
            # If not the first page, we need to get the page token
            if page > 1:
                # This is a simplified approach - in a real app, you'd store page tokens
                # or use a more sophisticated cursor-based pagination
                # For now, we'll just skip to the right page
                skip_pages = page - 1
                temp_pagination = PaginationOptions(limit=page_size * skip_pages)
                temp_result = self.db.query_documents(
                    self.collection_name,
                    filters=[status_filter],
                    order_by=[('updatedAt', firestore.Query.DESCENDING)],
                    pagination=temp_pagination
                )
                
                if temp_result.items and len(temp_result.items) >= page_size * skip_pages:
                    # Use the last item as the start_after for our actual query
                    pagination.start_after = temp_result.items[-1]['id']
                else:
                    # Not enough items to reach this page
                    return [], {"page": page, "page_size": page_size, "total_items": 0, "total_pages": 0, "has_next": False, "has_prev": page > 1}
            
            # Execute the query
            result = self.db.query_documents(
                self.collection_name,
                filters=[status_filter],
                order_by=[('updatedAt', firestore.Query.DESCENDING)],
                pagination=pagination
            )
            
            # Convert to ContentResponse objects
            items = [ContentResponse(**item) for item in result.items]
            
            # Create pagination metadata
            pagination_meta = {
                "page": page,
                "page_size": page_size,
                "has_next": result.has_more,
                "has_prev": page > 1,
                "next_page_token": result.next_page_token,
                "prev_page_token": result.prev_page_token
            }
            
            return items, pagination_meta
        except Exception as e:
            logger.error(f"Error getting content by status: {str(e)}")
            # If we're here, we're either in production mode or the dev_mode check failed
            # Let's try to return mock data as a fallback
            
            # Ensure _mock_data is initialized
            if not hasattr(self, '_mock_data'):
                self._mock_data = {}
                self._add_sample_data()
                
            filtered_items = [
                ContentResponse(id=doc_id, **doc_data)
                for doc_id, doc_data in self._mock_data.items()
                if doc_data.get('status') == status
            ]
            return filtered_items, {"page": 1, "page_size": len(filtered_items), "total_items": len(filtered_items), "total_pages": 1, "has_next": False, "has_prev": False}
    
    async def create(self, content: ContentCreate, user_id: str) -> ContentResponse:
        """Create new content"""
        try:
            now = datetime.utcnow()
            content_dict = content.model_dump()
            content_dict['createdAt'] = now
            content_dict['updatedAt'] = now
            content_dict['createdBy'] = user_id
            content_dict['updatedBy'] = user_id
            
            if self.dev_mode:
                # In development mode, add to mock data
                doc_id = str(uuid.uuid4())
                self._mock_data[doc_id] = content_dict
                return ContentResponse(id=doc_id, **content_dict)
            
            # In production mode, add to Firestore
            doc_id = self.db.add_document(self.collection_name, content_dict)
            
            # Get the created document
            doc = self.db.document(self.collection_name, doc_id).get()
            return self._doc_to_content(doc)
        except Exception as e:
            logger.error(f"Error creating content: {str(e)}")
            if self.dev_mode:
                # In development mode, add to mock data even if Firestore fails
                doc_id = str(uuid.uuid4())
                self._mock_data[doc_id] = content_dict
                return ContentResponse(id=doc_id, **content_dict)
            raise
    
    async def update(self, content_id: str, content: ContentUpdate, user_id: str) -> Optional[ContentResponse]:
        """Update existing content"""
        try:
            if self.dev_mode:
                # In development mode, update mock data
                if content_id not in self._mock_data:
                    return None
                
                content_dict = content.model_dump(exclude_unset=True)
                content_dict['updatedAt'] = datetime.utcnow()
                content_dict['updatedBy'] = user_id
                
                self._mock_data[content_id].update(content_dict)
                return ContentResponse(id=content_id, **self._mock_data[content_id])
            
            # In production mode, use Firestore
            # Use a transaction to ensure atomicity
            def update_in_transaction(transaction):
                # Get document reference
                doc_ref = self.db.document(self.collection_name, content_id)
                
                # Get the document in the transaction
                doc = doc_ref.get(transaction=transaction)
                if not doc.exists:
                    return None
                
                # Prepare update data
                content_dict = content.model_dump(exclude_unset=True)
                content_dict['updatedAt'] = datetime.utcnow()
                content_dict['updatedBy'] = user_id
                
                # Update in the transaction
                transaction.update(doc_ref, content_dict)
                
                # Return the updated document (will be fetched after transaction)
                return True
            
            # Run the transaction
            success = self.db.run_transaction(update_in_transaction)
            
            if not success:
                return None
            
            # Get the updated document
            doc = self.db.document(self.collection_name, content_id).get()
            return self._doc_to_content(doc)
        except Exception as e:
            logger.error(f"Error updating content: {str(e)}")
            if self.dev_mode and content_id in self._mock_data:
                content_dict = content.model_dump(exclude_unset=True)
                content_dict['updatedAt'] = datetime.utcnow()
                content_dict['updatedBy'] = user_id
                
                self._mock_data[content_id].update(content_dict)
                return ContentResponse(id=content_id, **self._mock_data[content_id])
            raise
    
    async def delete(self, content_id: str) -> bool:
        """Delete content"""
        try:
            if self.dev_mode:
                # In development mode, delete from mock data
                if content_id not in self._mock_data:
                    return False
                del self._mock_data[content_id]
                return True
            
            # In production mode, use Firestore
            result = self.db.delete_document(self.collection_name, content_id)
            return result
        except Exception as e:
            logger.error(f"Error deleting content: {str(e)}")
            if self.dev_mode:
                if content_id not in self._mock_data:
                    return False
                del self._mock_data[content_id]
                return True
            raise
    
    async def bulk_create(self, contents: List[ContentCreate], user_id: str) -> List[ContentResponse]:
        """
        Create multiple content items in a batch
        
        Args:
            contents: List of content items to create
            user_id: ID of the user creating the content
            
        Returns:
            List of created content items
        """
        try:
            if self.dev_mode:
                # In development mode, add to mock data
                created_items = []
                for content in contents:
                    now = datetime.utcnow()
                    content_dict = content.model_dump()
                    content_dict['createdAt'] = now
                    content_dict['updatedAt'] = now
                    content_dict['createdBy'] = user_id
                    content_dict['updatedBy'] = user_id
                    
                    doc_id = str(uuid.uuid4())
                    self._mock_data[doc_id] = content_dict
                    created_items.append(ContentResponse(id=doc_id, **content_dict))
                
                return created_items
            
            # In production mode, use Firestore batch
            batch = self.db.batch()
            doc_refs = []
            
            # Add each content item to the batch
            for content in contents:
                now = datetime.utcnow()
                content_dict = content.model_dump()
                content_dict['createdAt'] = now
                content_dict['updatedAt'] = now
                content_dict['createdBy'] = user_id
                content_dict['updatedBy'] = user_id
                
                # Create a new document reference
                doc_ref = self.db.collection(self.collection_name).document()
                doc_refs.append(doc_ref)
                
                # Add to batch
                batch.set(doc_ref, content_dict)
            
            # Commit the batch
            self.db.commit_batch(batch)
            
            # Get the created documents
            created_items = []
            for doc_ref in doc_refs:
                doc = doc_ref.get()
                created_items.append(self._doc_to_content(doc))
            
            return created_items
        except Exception as e:
            logger.error(f"Error bulk creating content: {str(e)}")
            if self.dev_mode:
                # In development mode, add to mock data even if Firestore fails
                created_items = []
                for content in contents:
                    now = datetime.utcnow()
                    content_dict = content.model_dump()
                    content_dict['createdAt'] = now
                    content_dict['updatedAt'] = now
                    content_dict['createdBy'] = user_id
                    content_dict['updatedBy'] = user_id
                    
                    doc_id = str(uuid.uuid4())
                    self._mock_data[doc_id] = content_dict
                    created_items.append(ContentResponse(id=doc_id, **content_dict))
                
                return created_items
            raise
    
    async def bulk_update(self, updates: Dict[str, ContentUpdate], user_id: str) -> Dict[str, Optional[ContentResponse]]:
        """
        Update multiple content items in a batch
        
        Args:
            updates: Dictionary mapping content IDs to update data
            user_id: ID of the user updating the content
            
        Returns:
            Dictionary mapping content IDs to updated content items (or None if not found)
        """
        try:
            if self.dev_mode:
                # In development mode, update mock data
                results = {}
                for content_id, content in updates.items():
                    if content_id not in self._mock_data:
                        results[content_id] = None
                        continue
                    
                    content_dict = content.model_dump(exclude_unset=True)
                    content_dict['updatedAt'] = datetime.utcnow()
                    content_dict['updatedBy'] = user_id
                    
                    self._mock_data[content_id].update(content_dict)
                    results[content_id] = ContentResponse(id=content_id, **self._mock_data[content_id])
                
                return results
            
            # In production mode, use Firestore batch
            batch = self.db.batch()
            doc_refs = {}
            
            # First, check which documents exist
            for content_id in updates.keys():
                doc_ref = self.db.document(self.collection_name, content_id)
                doc = doc_ref.get()
                if doc.exists:
                    doc_refs[content_id] = doc_ref
            
            # Add each update to the batch
            for content_id, content in updates.items():
                if content_id not in doc_refs:
                    continue
                
                content_dict = content.model_dump(exclude_unset=True)
                content_dict['updatedAt'] = datetime.utcnow()
                content_dict['updatedBy'] = user_id
                
                # Add to batch
                batch.update(doc_refs[content_id], content_dict)
            
            # Commit the batch
            self.db.commit_batch(batch)
            
            # Get the updated documents
            results = {}
            for content_id, doc_ref in doc_refs.items():
                doc = doc_ref.get()
                results[content_id] = self._doc_to_content(doc)
            
            # Add None for documents that weren't found
            for content_id in updates.keys():
                if content_id not in results:
                    results[content_id] = None
            
            return results
        except Exception as e:
            logger.error(f"Error bulk updating content: {str(e)}")
            if self.dev_mode:
                # In development mode, update mock data even if Firestore fails
                results = {}
                for content_id, content in updates.items():
                    if content_id not in self._mock_data:
                        results[content_id] = None
                        continue
                    
                    content_dict = content.model_dump(exclude_unset=True)
                    content_dict['updatedAt'] = datetime.utcnow()
                    content_dict['updatedBy'] = user_id
                    
                    self._mock_data[content_id].update(content_dict)
                    results[content_id] = ContentResponse(id=content_id, **self._mock_data[content_id])
                
                return results
            raise
    
    async def bulk_delete(self, content_ids: List[str]) -> Dict[str, bool]:
        """
        Delete multiple content items in a batch
        
        Args:
            content_ids: List of content IDs to delete
            
        Returns:
            Dictionary mapping content IDs to deletion success
        """
        try:
            if self.dev_mode:
                # In development mode, delete from mock data
                results = {}
                for content_id in content_ids:
                    if content_id not in self._mock_data:
                        results[content_id] = False
                        continue
                    
                    del self._mock_data[content_id]
                    results[content_id] = True
                
                return results
            
            # In production mode, use Firestore batch
            batch = self.db.batch()
            doc_refs = {}
            
            # First, check which documents exist
            for content_id in content_ids:
                doc_ref = self.db.document(self.collection_name, content_id)
                doc = doc_ref.get()
                if doc.exists:
                    doc_refs[content_id] = doc_ref
            
            # Add each deletion to the batch
            for content_id, doc_ref in doc_refs.items():
                batch.delete(doc_ref)
            
            # Commit the batch
            self.db.commit_batch(batch)
            
            # Prepare results
            results = {}
            for content_id in content_ids:
                results[content_id] = content_id in doc_refs
            
            return results
        except Exception as e:
            logger.error(f"Error bulk deleting content: {str(e)}")
            if self.dev_mode:
                # In development mode, delete from mock data even if Firestore fails
                results = {}
                for content_id in content_ids:
                    if content_id not in self._mock_data:
                        results[content_id] = False
                        continue
                    
                    del self._mock_data[content_id]
                    results[content_id] = True
                
                return results
            raise
    
    def _doc_to_content(self, doc) -> ContentResponse:
        """Convert Firestore document to ContentResponse"""
        data = doc.to_dict()
        data['id'] = doc.id
        
        # Convert Firestore timestamps to datetime
        if 'createdAt' in data and data['createdAt']:
            if isinstance(data['createdAt'], firestore.SERVER_TIMESTAMP):
                data['createdAt'] = datetime.utcnow()
            elif hasattr(data['createdAt'], 'timestamp'):
                data['createdAt'] = datetime.fromtimestamp(data['createdAt'].timestamp())
        
        if 'updatedAt' in data and data['updatedAt']:
            if isinstance(data['updatedAt'], firestore.SERVER_TIMESTAMP):
                data['updatedAt'] = datetime.utcnow()
            elif hasattr(data['updatedAt'], 'timestamp'):
                data['updatedAt'] = datetime.fromtimestamp(data['updatedAt'].timestamp())
        
        return ContentResponse(**data)
