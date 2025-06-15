import firebase_admin
from firebase_admin import credentials, firestore
import os
import logging
import time
from typing import Optional, List, Dict, Any, Callable, TypeVar, Generic
from google.cloud.firestore_v1.base_query import FieldFilter
from google.api_core.exceptions import Aborted, DeadlineExceeded, ServiceUnavailable, InternalServerError

# Set up logging
logger = logging.getLogger(__name__)

# Type variable for generic retry function
T = TypeVar('T')

# Constants for retry mechanism
MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 1.0  # seconds
MAX_RETRY_DELAY = 16.0  # seconds

class PaginationOptions:
    """Options for paginated queries"""
    
    def __init__(
        self, 
        limit: int = 10, 
        start_after: Optional[str] = None,
        end_before: Optional[str] = None,
        page_token: Optional[str] = None
    ):
        self.limit = limit
        self.start_after = start_after
        self.end_before = end_before
        self.page_token = page_token

class QueryResult(Generic[T]):
    """Result of a paginated query"""
    
    def __init__(
        self, 
        items: List[T], 
        next_page_token: Optional[str] = None,
        prev_page_token: Optional[str] = None,
        total: Optional[int] = None
    ):
        self.items = items
        self.next_page_token = next_page_token
        self.prev_page_token = prev_page_token
        self.total = total
        self.has_more = next_page_token is not None

class FirestoreDB:
    """Singleton class for Firestore database connection"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirestoreDB, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Firebase Admin SDK and Firestore client"""
        try:
            # Check if Firebase Admin SDK is already initialized
            if not firebase_admin._apps:
                # Get service account key path from environment variable or use default
                service_account_path = os.getenv(
                    'FIREBASE_SERVICE_ACCOUNT_KEY_PATH', 
                    'serviceAccountKey.json'
                )
                
                try:
                    # Initialize Firebase Admin SDK
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred, {
                        'projectId': os.getenv('FIREBASE_PROJECT_ID'),
                        'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
                    })
                    logger.info("Firebase Admin SDK initialized successfully")
                except Exception as e:
                    logger.warning(f"Failed to initialize Firebase Admin SDK with service account: {str(e)}")
                    logger.warning("Initializing Firebase Admin SDK in development mode (no authentication)")
                    # Initialize Firebase Admin SDK without credentials (for development only)
                    firebase_admin.initialize_app(options={
                        'projectId': os.getenv('FIREBASE_PROJECT_ID', 'vertexcms'),
                    })
                    logger.info("Firebase Admin SDK initialized in development mode")
            
            # Get Firestore client
            self.db = firestore.client()
            logger.info("Firestore client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Firebase Admin SDK: {str(e)}")
            raise
    
    def _with_retry(self, operation: Callable[[], T], operation_name: str) -> T:
        """Execute an operation with exponential backoff retry"""
        retry_delay = INITIAL_RETRY_DELAY
        
        for attempt in range(MAX_RETRIES):
            try:
                return operation()
            except (Aborted, DeadlineExceeded, ServiceUnavailable, InternalServerError) as e:
                if attempt == MAX_RETRIES - 1:
                    logger.error(f"Operation {operation_name} failed after {MAX_RETRIES} attempts: {str(e)}")
                    raise
                
                logger.warning(f"Operation {operation_name} failed (attempt {attempt + 1}/{MAX_RETRIES}): {str(e)}")
                logger.warning(f"Retrying in {retry_delay} seconds...")
                
                time.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, MAX_RETRY_DELAY)
    
    def collection(self, collection_name: str):
        """Get a collection reference"""
        return self.db.collection(collection_name)
    
    def document(self, collection_name: str, document_id: str):
        """Get a document reference"""
        return self.db.collection(collection_name).document(document_id)
    
    def add_document(self, collection_name: str, data: dict) -> str:
        """Add a document to a collection and return its ID"""
        def operation():
            doc_ref = self.db.collection(collection_name).document()
            doc_ref.set(data)
            return doc_ref.id
        
        return self._with_retry(operation, f"add_document({collection_name})")
    
    def get_document(self, collection_name: str, document_id: str) -> Optional[dict]:
        """Get a document by ID"""
        def operation():
            doc_ref = self.db.collection(collection_name).document(document_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        
        return self._with_retry(operation, f"get_document({collection_name}, {document_id})")
    
    def update_document(self, collection_name: str, document_id: str, data: dict) -> bool:
        """Update a document by ID"""
        def operation():
            doc_ref = self.db.collection(collection_name).document(document_id)
            doc = doc_ref.get()
            if not doc.exists:
                return False
            doc_ref.update(data)
            return True
        
        return self._with_retry(operation, f"update_document({collection_name}, {document_id})")
    
    def delete_document(self, collection_name: str, document_id: str) -> bool:
        """Delete a document by ID"""
        def operation():
            doc_ref = self.db.collection(collection_name).document(document_id)
            doc = doc_ref.get()
            if not doc.exists:
                return False
            doc_ref.delete()
            return True
        
        return self._with_retry(operation, f"delete_document({collection_name}, {document_id})")
    
    def query_documents(
        self, 
        collection_name: str, 
        filters: Optional[List[FieldFilter]] = None,
        order_by: Optional[List[tuple]] = None,
        pagination: Optional[PaginationOptions] = None
    ) -> QueryResult[dict]:
        """
        Query documents with filters, ordering, and pagination
        
        Args:
            collection_name: Name of the collection to query
            filters: List of Firestore field filters
            order_by: List of (field, direction) tuples for ordering
            pagination: Pagination options
            
        Returns:
            QueryResult containing documents and pagination tokens
        """
        def operation():
            # Start with collection reference
            query = self.db.collection(collection_name)
            
            # Apply filters if provided
            if filters:
                for filter_obj in filters:
                    query = query.where(filter=filter_obj)
            
            # Apply ordering if provided
            if order_by:
                for field, direction in order_by:
                    query = query.order_by(field, direction=direction)
            
            # Get total count (before pagination)
            total_query = query
            
            # Apply pagination if provided
            if pagination:
                # Set limit
                query = query.limit(pagination.limit)
                
                # Apply cursor if provided
                if pagination.start_after:
                    start_doc = self.db.collection(collection_name).document(pagination.start_after).get()
                    if start_doc.exists:
                        query = query.start_after(start_doc)
                
                if pagination.end_before:
                    end_doc = self.db.collection(collection_name).document(pagination.end_before).get()
                    if end_doc.exists:
                        query = query.end_before(end_doc)
                
                if pagination.page_token:
                    # Page token is a document ID
                    token_doc = self.db.collection(collection_name).document(pagination.page_token).get()
                    if token_doc.exists:
                        query = query.start_after(token_doc)
            
            # Execute query
            docs = list(query.stream())
            
            # Get total count (expensive operation, consider if needed)
            total = None
            
            # Determine next/prev page tokens
            next_page_token = None
            prev_page_token = None
            
            if pagination and docs:
                # If we got a full page of results, there might be more
                if len(docs) == pagination.limit:
                    next_page_token = docs[-1].id
                
                # If we have a start_after or page_token, we can go back
                if pagination.start_after or pagination.page_token:
                    prev_page_token = docs[0].id if docs else None
            
            # Convert to dictionaries with IDs
            items = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            
            return QueryResult(
                items=items,
                next_page_token=next_page_token,
                prev_page_token=prev_page_token,
                total=total
            )
        
        return self._with_retry(operation, f"query_documents({collection_name})")
    
    def run_transaction(self, transaction_callable):
        """
        Run a callable within a transaction
        
        Args:
            transaction_callable: A callable that takes a transaction object and returns a result
            
        Returns:
            The result of the transaction callable
        """
        def operation():
            return self.db.transaction(transaction_callable)
        
        return self._with_retry(operation, "run_transaction")
    
    def batch(self):
        """
        Create a batch operation
        
        Returns:
            A batch object for batch operations
        """
        return self.db.batch()
    
    def commit_batch(self, batch):
        """
        Commit a batch operation
        
        Args:
            batch: The batch object to commit
            
        Returns:
            The result of the batch commit
        """
        def operation():
            return batch.commit()
        
        return self._with_retry(operation, "commit_batch")

# Create a singleton instance
firestore_db = FirestoreDB()
