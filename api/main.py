from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials
import os

# Import routers
from routers import content, media
# from routers import templates, auth (to be implemented)

# Initialize FastAPI app
app = FastAPI(
    title="Priority CMS API",
    description="API for Priority CMS",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9002"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase Admin SDK
# Note: In production, use environment variables or secure storage for credentials
# cred = credentials.Certificate("path/to/serviceAccountKey.json")
# firebase_admin.initialize_app(cred)

# Include routers
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(media.router, prefix="/api/media", tags=["Media"])
# app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])

@app.get("/")
async def root():
    return {"message": "Welcome to Priority CMS API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
