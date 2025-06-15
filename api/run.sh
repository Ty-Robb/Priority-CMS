#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install dependencies if needed
if [ "$1" == "--install" ]; then
    pip install -r requirements.txt
fi

# Run the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
