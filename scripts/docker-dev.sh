#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Development Environment with Docker${NC}"

# Stop and remove existing containers
echo -e "${YELLOW}Stopping existing development containers...${NC}"
docker-compose -f docker-compose.dev.yml down -v

# Build and start development environment
echo -e "${GREEN}Building and starting development environment...${NC}"
echo -e "${YELLOW}Database will be cleaned and recreated with mock data${NC}"
docker-compose -f docker-compose.dev.yml up --build

echo -e "${GREEN}✅ Development environment started${NC}"
echo -e "${GREEN}API available at: http://localhost:3000${NC}"
echo -e "${GREEN}Health check: http://localhost:3000/health${NC}"
