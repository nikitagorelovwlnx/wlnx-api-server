#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting WLNX API Server Setup${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Please update the database credentials in .env file before continuing${NC}"
    echo -e "${YELLOW}Press any key to continue after updating .env...${NC}"
    read -n 1 -s
fi

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

# Run database migrations
echo -e "${GREEN}🗄️  Running database migrations...${NC}"
npm run migrate

# Start the development server
echo -e "${GREEN}🎯 Starting development server...${NC}"
npm run dev
