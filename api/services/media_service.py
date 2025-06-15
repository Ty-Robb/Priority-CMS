from firebase_admin import storage
from db.firestore import firestore_db
from typing import List, Optional, Dict, Any, BinaryIO, Tuple
from datetime import datetime
import os
import uuid
import logging
import mimetypes
from models.user import User

# Set up logging
logger = logging.getLogger(__name__)

class MediaService:
    """Service for handling media operations with Firebase Storage"""
    
    def __init__(self):
        """Initialize the media service with Firebase Storage"""
        self.bucket_name = os.getenv('FIREBASE_STORAGE_BUCKET')
        self.dev_mode = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
        
        # In development mode, use a local directory for storage
        if self.dev_mode:
            self._mock_data: Dict[str, dict] = {}
            self._local_storage_dir = os.path.join(os.getcwd(), 'media')
            os.makedirs(self._local_storage_dir, exist_ok=True)
            logger.info(f"Media service initialized in development mode with local storage at {self._local_storage_dir}")
        else:
            # In production mode, use Firebase Storage
            self.bucket = storage.bucket(self.bucket_name)
            logger.info(f"Media service initialized with Firebase Storage bucket: {self.bucket_name}")
        
        # Initialize Firestore collection for media metadata
        self.db = firestore_db
        self.collection_name = 'media'
    
    async def upload_file(
        self, 
        file: BinaryIO, 
        filename: str, 
        content_type: str, 
        folder: str, 
        user: User,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Upload a file to Firebase Storage
        
        Args:
            file: File-like object to upload
            filename: Original filename
            content_type: MIME type of the file
            folder: Storage folder (public, users/{user_id}, content/{content_id}, etc.)
            user: User uploading the file
            metadata: Additional metadata to store
            
        Returns:
            Dictionary with file metadata
        """
        try:
            # Generate a unique filename to avoid collisions
            file_extension = os.path.splitext(filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            storage_path = f"{folder}/{unique_filename}"
            
            # Prepare metadata
            now = datetime.utcnow()
            file_metadata = {
                'originalFilename': filename,
                'contentType': content_type,
                'size': 0,  # Will be updated after upload
                'path': storage_path,
                'folder': folder,
                'createdAt': now,
                'updatedAt': now,
                'createdBy': user.id,
                'updatedBy': user.id
            }
            
            # Add custom metadata if provided
            if metadata:
                file_metadata.update(metadata)
            
            if self.dev_mode:
                # In development mode, save to local filesystem
                local_path = os.path.join(self._local_storage_dir, unique_filename)
                
                # Read the file content
                file_content = file.read()
                
                # Update size in metadata
                file_metadata['size'] = len(file_content)
                
                # Write to local file
                with open(local_path, 'wb') as f:
                    f.write(file_content)
                
                # Store metadata in mock data
                media_id = str(uuid.uuid4())
                self._mock_data[media_id] = file_metadata
                
                # Add local URL for development
                file_metadata['url'] = f"file://{local_path}"
                file_metadata['id'] = media_id
                
                return file_metadata
            else:
                # In production mode, upload to Firebase Storage
                blob = self.bucket.blob(storage_path)
                
                # Set content type
                blob.content_type = content_type
                
                # Upload the file
                blob.upload_from_file(file)
                
                # Update size in metadata
                file_metadata['size'] = blob.size
                
                # Store metadata in Firestore
                media_id = self.db.add_document(self.collection_name, file_metadata)
                
                # Generate a signed URL for the file
                url = blob.generate_signed_url(
                    version='v4',
                    expiration=datetime.utcnow() + datetime.timedelta(hours=1),
                    method='GET'
                )
                
                # Add URL and ID to metadata
                file_metadata['url'] = url
                file_metadata['id'] = media_id
                
                return file_metadata
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            if self.dev_mode:
                # In development mode, return mock data even if Firebase fails
                media_id = str(uuid.uuid4())
                # Generate a unique filename for the error case
                error_filename = f"{uuid.uuid4()}{os.path.splitext(filename)[1]}"
                current_time = datetime.utcnow()
                file_metadata = {
                    'id': media_id,
                    'originalFilename': filename,
                    'contentType': content_type,
                    'size': 0,
                    'path': f"{folder}/{error_filename}",
                    'folder': folder,
                    'url': f"file://{self._local_storage_dir}/{error_filename}",
                    'createdAt': current_time,
                    'updatedAt': current_time,
                    'createdBy': user.id,
                    'updatedBy': user.id
                }
                if metadata:
                    file_metadata.update(metadata)
                self._mock_data[media_id] = file_metadata
                return file_metadata
            raise
    
    async def get_file_metadata(self, media_id: str) -> Optional[Dict[str, Any]]:
        """
        Get file metadata from Firestore
        
        Args:
            media_id: ID of the media file
            
        Returns:
            Dictionary with file metadata or None if not found
        """
        try:
            if self.dev_mode:
                # In development mode, return mock data
                if media_id in self._mock_data:
                    metadata = self._mock_data[media_id].copy()
                    metadata['id'] = media_id
                    return metadata
                return None
            
            # In production mode, get from Firestore
            doc = self.db.get_document(self.collection_name, media_id)
            if not doc:
                return None
            
            metadata = doc.copy()
            metadata['id'] = media_id
            
            # Generate a fresh signed URL
            blob = self.bucket.blob(metadata['path'])
            if blob.exists():
                url = blob.generate_signed_url(
                    version='v4',
                    expiration=datetime.utcnow() + datetime.timedelta(hours=1),
                    method='GET'
                )
                metadata['url'] = url
            
            return metadata
        except Exception as e:
            logger.error(f"Error getting file metadata: {str(e)}")
            if self.dev_mode and media_id in self._mock_data:
                metadata = self._mock_data[media_id].copy()
                metadata['id'] = media_id
                return metadata
            raise
    
    async def get_files_by_folder(
        self, 
        folder: str, 
        page: int = 1, 
        page_size: int = 10
    ) -> Tuple[List[Dict[str, Any]], dict]:
        """
        Get files by folder with pagination
        
        Args:
            folder: Storage folder to filter by
            page: Page number (1-based)
            page_size: Number of items per page
            
        Returns:
            Tuple of (list of file metadata, pagination metadata)
        """
        try:
            if self.dev_mode:
                # In development mode, filter mock data by folder
                filtered_items = [
                    (media_id, metadata)
                    for media_id, metadata in self._mock_data.items()
                    if metadata.get('folder') == folder
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
                
                # Create metadata objects
                items = []
                for media_id, metadata in page_items:
                    item = metadata.copy()
                    item['id'] = media_id
                    items.append(item)
                
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
            
            # In production mode, query Firestore
            from google.cloud.firestore_v1.base_query import FieldFilter
            
            # Create folder filter
            folder_filter = FieldFilter("folder", "==", folder)
            
            # Query with pagination
            from db.firestore import PaginationOptions
            pagination_options = PaginationOptions(
                limit=page_size
            )
            
            # If not the first page, we need to get the page token
            if page > 1:
                # This is a simplified approach - in a real app, you'd store page tokens
                # or use a more sophisticated cursor-based pagination
                # For now, we'll just skip to the right page
                skip_pages = page - 1
                temp_pagination = PaginationOptions(limit=page_size * skip_pages)
                from firebase_admin import firestore
                temp_result = self.db.query_documents(
                    self.collection_name,
                    filters=[folder_filter],
                    order_by=[('updatedAt', firestore.Query.DESCENDING)],
                    pagination=temp_pagination
                )
                
                if temp_result.items and len(temp_result.items) >= page_size * skip_pages:
                    # Use the last item as the start_after for our actual query
                    pagination_options.start_after = temp_result.items[-1]['id']
                else:
                    # Not enough items to reach this page
                    return [], {"page": page, "page_size": page_size, "total_items": 0, "total_pages": 0, "has_next": False, "has_prev": page > 1}
            
            # Execute the query
            from firebase_admin import firestore
            result = self.db.query_documents(
                self.collection_name,
                filters=[folder_filter],
                order_by=[('updatedAt', firestore.Query.DESCENDING)],
                pagination=pagination_options
            )
            
            # Generate fresh signed URLs for each item
            items = []
            for item in result.items:
                # Generate a fresh signed URL
                blob = self.bucket.blob(item['path'])
                if blob.exists():
                    url = blob.generate_signed_url(
                        version='v4',
                        expiration=datetime.utcnow() + datetime.timedelta(hours=1),
                        method='GET'
                    )
                    item['url'] = url
                
                items.append(item)
            
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
            logger.error(f"Error getting files by folder: {str(e)}")
            if self.dev_mode:
                # In development mode, return filtered mock data even if Firestore fails
                filtered_items = [
                    (media_id, metadata.copy())
                    for media_id, metadata in self._mock_data.items()
                    if metadata.get('folder') == folder
                ]
                
                items = []
                for media_id, metadata in filtered_items:
                    metadata['id'] = media_id
                    items.append(metadata)
                
                return items, {"page": 1, "page_size": len(items), "total_items": len(items), "total_pages": 1, "has_next": False, "has_prev": False}
            raise
    
    async def delete_file(self, media_id: str, user: User) -> bool:
        """
        Delete a file from Firebase Storage
        
        Args:
            media_id: ID of the media file
            user: User deleting the file
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            # First, get the file metadata
            metadata = await self.get_file_metadata(media_id)
            if not metadata:
                return False
            
            # Check if the user is authorized to delete the file
            if metadata.get('createdBy') != user.id and user.role not in ['admin', 'editor']:
                return False
            
            if self.dev_mode:
                # In development mode, remove from mock data
                if media_id in self._mock_data:
                    # Delete local file if it exists
                    local_path = os.path.join(self._local_storage_dir, os.path.basename(metadata['path']))
                    if os.path.exists(local_path):
                        os.remove(local_path)
                    
                    # Remove from mock data
                    del self._mock_data[media_id]
                    return True
                return False
            
            # In production mode, delete from Firebase Storage and Firestore
            # Delete from Storage
            blob = self.bucket.blob(metadata['path'])
            if blob.exists():
                blob.delete()
            
            # Delete from Firestore
            result = self.db.delete_document(self.collection_name, media_id)
            return result
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            if self.dev_mode and media_id in self._mock_data:
                del self._mock_data[media_id]
                return True
            raise
    
    async def update_file_metadata(
        self, 
        media_id: str, 
        metadata: Dict[str, Any], 
        user: User
    ) -> Optional[Dict[str, Any]]:
        """
        Update file metadata in Firestore
        
        Args:
            media_id: ID of the media file
            metadata: New metadata to update
            user: User updating the metadata
            
        Returns:
            Updated metadata or None if not found
        """
        try:
            # First, get the current metadata
            current_metadata = await self.get_file_metadata(media_id)
            if not current_metadata:
                return None
            
            # Check if the user is authorized to update the metadata
            if current_metadata.get('createdBy') != user.id and user.role not in ['admin', 'editor']:
                return None
            
            # Prepare update data
            update_data = metadata.copy()
            update_data['updatedAt'] = datetime.utcnow()
            update_data['updatedBy'] = user.id
            
            # Remove fields that shouldn't be updated
            for field in ['id', 'path', 'folder', 'createdAt', 'createdBy', 'size', 'contentType']:
                if field in update_data:
                    del update_data[field]
            
            if self.dev_mode:
                # In development mode, update mock data
                if media_id in self._mock_data:
                    self._mock_data[media_id].update(update_data)
                    updated_metadata = self._mock_data[media_id].copy()
                    updated_metadata['id'] = media_id
                    return updated_metadata
                return None
            
            # In production mode, update in Firestore
            result = self.db.update_document(self.collection_name, media_id, update_data)
            if not result:
                return None
            
            # Get the updated metadata
            return await self.get_file_metadata(media_id)
        except Exception as e:
            logger.error(f"Error updating file metadata: {str(e)}")
            if self.dev_mode and media_id in self._mock_data:
                # Create a minimal update with just a timestamp in case of error
                error_update = {'updatedAt': datetime.utcnow()}
                if metadata:
                    error_update.update(metadata)
                self._mock_data[media_id].update(error_update)
                updated_metadata = self._mock_data[media_id].copy()
                updated_metadata['id'] = media_id
                return updated_metadata
            raise
    
    def get_mime_type(self, filename: str) -> str:
        """
        Get MIME type from filename
        
        Args:
            filename: Filename to get MIME type for
            
        Returns:
            MIME type string
        """
        mime_type, _ = mimetypes.guess_type(filename)
        if not mime_type:
            # Default to binary data if type can't be determined
            mime_type = 'application/octet-stream'
        return mime_type
