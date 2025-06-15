import firebase_admin
from firebase_admin import credentials, firestore
import os
import logging
from typing import Optional

# Set up logging
logger = logging.getLogger(__name__)

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
                
                # Initialize Firebase Admin SDK
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred, {
                    'projectId': os.getenv('FIREBASE_PROJECT_ID'),
                    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
                })
                
                logger.info("Firebase Admin SDK initialized successfully")
            
            # Get Firestore client
            self.db = firestore.client()
            logger.info("Firestore client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Firebase Admin SDK: {str(e)}")
            raise
    
    def collection(self, collection_name: str):
        """Get a collection reference"""
        return self.db.collection(collection_name)
    
    def document(self, collection_name: str, document_id: str):
        """Get a document reference"""
        return self.db.collection(collection_name).document(document_id)
    
    def add_document(self, collection_name: str, data: dict) -> str:
        """Add a document to a collection and return its ID"""
        doc_ref = self.db.collection(collection_name).document()
        doc_ref.set(data)
        return doc_ref.id
    
    def get_document(self, collection_name: str, document_id: str) -> Optional[dict]:
        """Get a document by ID"""
        doc_ref = self.db.collection(collection_name).document(document_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def update_document(self, collection_name: str, document_id: str, data: dict) -> bool:
        """Update a document by ID"""
        doc_ref = self.db.collection(collection_name).document(document_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
        doc_ref.update(data)
        return True
    
    def delete_document(self, collection_name: str, document_id: str) -> bool:
        """Delete a document by ID"""
        doc_ref = self.db.collection(collection_name).document(document_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
        doc_ref.delete()
        return True

# Create a singleton instance
firestore_db = FirestoreDB()
