#!/bin/bash

# Script to import shadcn components and register them as templates

# Check if URL is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <url-or-component-id> [--force]"
  echo "Example: $0 https://www.shadcnblocks.com/r/hero1"
  echo "Example: $0 hero1"
  echo "Example: $0 --bulk src/data/sample-components.json"
  exit 1
fi

# Set API URL and token from .env file if it exists
if [ -f .env ]; then
  source .env
fi

API_BASE_URL=${API_BASE_URL:-"http://localhost:8001"}
API_TOKEN=${API_TOKEN:-""}

# Check if we're importing in bulk
if [ "$1" == "--bulk" ]; then
  if [ -z "$2" ]; then
    echo "Error: No file specified for bulk import"
    echo "Usage: $0 --bulk <file-path>"
    exit 1
  fi
  
  echo "Importing components in bulk from $2..."
  npx ts-node src/tools/cli.ts import-bulk "$2"
  exit $?
fi

# Check if the argument is a URL or component ID
if [[ $1 == http* ]]; then
  URL="$1"
else
  URL="https://www.shadcnblocks.com/r/$1"
fi

# Check if force flag is provided
FORCE=""
if [ "$2" == "--force" ]; then
  FORCE="--force"
fi

# Import the component
echo "Importing component from $URL..."
npx ts-node src/tools/cli.ts import "$URL" $FORCE

# Check if import was successful
if [ $? -eq 0 ]; then
  echo "Component imported successfully!"
else
  echo "Failed to import component."
  exit 1
fi
