from db import firestore_db
from models.content import ContentCreate, ContentUpdate, ContentResponse
from typing import List, Optional
import logging
from datetime import datetime
from firebase_admin import firestore

# Set up logging
logger = logging.getLogger(__name__)

class ContentService:
    """Service for handling content operations"""
    
    def __init__(self):
        """Initialize the content service with Firestore client"""
        self.db = firestore_db
        self.collection_name = 'content'
    
    async def get_all(self) -> List[ContentResponse]:
        """Get all content pieces"""
        try:
            docs = self.db.collection(self.collection_name).order_by('updatedAt', direction=firestore.Query.DESCENDING).stream()
            return [self._doc_to_content(doc) for doc in docs]
        except Exception as e:
            logger.error(f"Error getting all content: {str(e)}")
            raise
    
    async def get_by_id(self, content_id: str) -> Optional[ContentResponse]:
        """Get content by ID"""
        try:
            doc = self.db.document(self.collection_name, content_id).get()
            if not doc.exists:
                return None
            return self._doc_to_content(doc)
        except Exception as e:
            logger.error(f"Error getting content by ID: {str(e)}")
            raise
    
    async def get_by_status(self, status: str) -> List[ContentResponse]:
        """Get content by status"""
        try:
            docs = self.db.collection(self.collection_name).where('status', '==', status).order_by('updatedAt', direction=firestore.Query.DESCENDING).stream()
            return [self._doc_to_content(doc) for doc in docs]
        except Exception as e:
            logger.error(f"Error getting content by status: {str(e)}")
            raise
    
    async def create(self, content: ContentCreate, user_id: str) -> ContentResponse:
        """Create new content"""
        try:
            now = datetime.utcnow()
            content_dict = content.model_dump()
            content_dict['createdAt'] = now
            content_dict['updatedAt'] = now
            content_dict['createdBy'] = user_id
            content_dict['updatedBy'] = user_id
            
            # Add to Firestore
            doc_id = self.db.add_document(self.collection_name, content_dict)
            
            # Get the created document
            doc = self.db.document(self.collection_name, doc_id).get()
            return self._doc_to_content(doc)
        except Exception as e:
            logger.error(f"Error creating content: {str(e)}")
            raise
    
    async def update(self, content_id: str, content: ContentUpdate, user_id: str) -> Optional[ContentResponse]:
        """Update existing content"""
        try:
            # Check if content exists
            doc_ref = self.db.document(self.collection_name, content_id)
            doc = doc_ref.get()
            if not doc.exists:
                return None
            
            # Update content
            content_dict = content.model_dump(exclude_unset=True)
            content_dict['updatedAt'] = datetime.utcnow()
            content_dict['updatedBy'] = user_id
            
            self.db.update_document(self.collection_name, content_id, content_dict)
            
            # Get the updated document
            updated_doc = doc_ref.get()
            return self._doc_to_content(updated_doc)
        except Exception as e:
            logger.error(f"Error updating content: {str(e)}")
            raise
    
    async def delete(self, content_id: str) -> bool:
        """Delete content"""
        try:
            # Delete the document
            result = self.db.delete_document(self.collection_name, content_id)
            return result
        except Exception as e:
            logger.error(f"Error deleting content: {str(e)}")
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
