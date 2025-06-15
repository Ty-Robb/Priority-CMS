# Firebase Integration Guide

This document provides instructions for setting up and configuring the Firebase integration for Priority CMS.

## Prerequisites

1. A Firebase project
2. Firebase Admin SDK service account key
3. Firestore database
4. Firebase Storage bucket

## Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard to create a new project
4. Enable Firestore and Storage for your project

### 2. Generate a Service Account Key

1. In the Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely

### 3. Configure Environment Variables

Create a `.env` file in the `api` directory based on the `.env.example` template:

```
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=path/to/serviceAccountKey.json

# Development Mode
DEBUG=False  # Set to True for development

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=False  # Set to True for development
```

Replace the placeholder values with your actual Firebase project details.

### 4. Deploy Firestore Security Rules

1. Copy the `firestore.rules` file to your Firebase project
2. Deploy the rules using the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Storage Security Rules

1. Copy the `storage.rules` file to your Firebase project
2. Deploy the rules using the Firebase CLI:

```bash
firebase deploy --only storage:rules
```

## Features

The Firebase integration provides the following features:

### Firestore Integration

- Robust database layer with retry mechanism
- Transaction support for atomic operations
- Batch operations for improved performance
- Pagination for large result sets

### Firebase Storage Integration

- File upload with metadata storage
- Secure URL generation
- Folder-based organization
- Pagination support for media listings

### Security

- Role-based access control (admin, editor, user)
- Data validation rules
- Path-based access control for storage
- File type and size validation

## Development Mode

For development without a Firebase project, set `DEBUG=True` in your `.env` file. This will:

1. Use in-memory storage for content
2. Store files locally in the `api/media` directory
3. Provide mock authentication with admin privileges

## API Endpoints

### Content Endpoints

- `GET /api/content` - Get all content with pagination
- `GET /api/content/paginated` - Get paginated content with metadata
- `GET /api/content/public` - Get published content for public consumption
- `GET /api/content/{content_id}` - Get content by ID
- `POST /api/content` - Create new content
- `POST /api/content/bulk` - Create multiple content items in a batch
- `PUT /api/content/{content_id}` - Update existing content
- `PUT /api/content/bulk` - Update multiple content items in a batch
- `DELETE /api/content/{content_id}` - Delete content
- `DELETE /api/content/bulk` - Delete multiple content items in a batch

### Media Endpoints

- `POST /api/media/upload` - Upload a file
- `GET /api/media/{media_id}` - Get file metadata
- `GET /api/media/folder/{folder}` - Get files by folder with pagination
- `PUT /api/media/{media_id}` - Update file metadata
- `DELETE /api/media/{media_id}` - Delete a file
- `GET /api/media/public/{folder}` - Get public files by folder with pagination

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK Initialization Failed**
   - Check that your service account key path is correct
   - Verify that the service account has the necessary permissions

2. **Firestore API Not Enabled**
   - Enable the Firestore API in the Google Cloud Console
   - Wait a few minutes for the changes to propagate

3. **Storage Bucket Not Found**
   - Verify that the storage bucket name is correct
   - Check that the bucket exists in your Firebase project

4. **Authentication Failed**
   - Verify that your Firebase project is properly configured
   - Check that the service account has the necessary permissions
