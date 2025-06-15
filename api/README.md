# Priority CMS API

This is the FastAPI backend for Priority CMS, providing API endpoints for content management, authentication, and template management.

## Features

- **Content Management**: Create, read, update, and delete content
- **Authentication**: Firebase Authentication integration
- **Template Management**: Create and manage page templates
- **API Documentation**: Automatic API documentation with Swagger UI

## Prerequisites

- Python 3.9+
- Firebase project with Authentication and Firestore enabled
- Firebase Admin SDK service account key

## Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up Firebase Admin SDK:
   - Download your Firebase Admin SDK service account key from the Firebase Console
   - Save it as `serviceAccountKey.json` in the `api` directory or set the path in the environment variable

## Configuration

Create a `.env` file in the `api` directory with the following variables:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=path/to/serviceAccountKey.json
```

## Running the API

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Content

- `GET /api/content`: Get all content
- `GET /api/content/{content_id}`: Get content by ID
- `POST /api/content`: Create new content
- `PUT /api/content/{content_id}`: Update content
- `DELETE /api/content/{content_id}`: Delete content
- `GET /api/content/public`: Get published content (public endpoint)

### Templates

- `GET /api/templates`: Get all templates
- `GET /api/templates/{template_id}`: Get template by ID
- `POST /api/templates`: Create new template
- `PUT /api/templates/{template_id}`: Update template
- `DELETE /api/templates/{template_id}`: Delete template

## Authentication

The API uses Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Integration with Priority CMS Frontend

The frontend communicates with this API for content management and authentication. Make sure the API is running when using the frontend.
