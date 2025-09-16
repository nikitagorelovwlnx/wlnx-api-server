#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Starting Test Environment with Docker${NC}"

# Stop and remove existing containers
echo -e "${YELLOW}Stopping existing test containers...${NC}"
docker-compose -f docker-compose.test.yml down -v

# Build and start test environment
echo -e "${GREEN}Building and starting test environment...${NC}"
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit

# Clean up
echo -e "${YELLOW}Cleaning up test containers...${NC}"
docker-compose -f docker-compose.test.yml down -v

echo -e "${GREEN}✅ Test environment completed${NC}"
