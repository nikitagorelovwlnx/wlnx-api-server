#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏭 Starting Production Environment with Docker${NC}"

# Check if secrets exist
if [ ! -f "./secrets/db_password.txt" ]; then
    echo -e "${RED}❌ Error: secrets/db_password.txt not found${NC}"
    echo -e "${YELLOW}Please create secrets/db_password.txt with your database password${NC}"
    exit 1
fi

if [ ! -f "./secrets/jwt_secret.txt" ]; then
    echo -e "${RED}❌ Error: secrets/jwt_secret.txt not found${NC}"
    echo -e "${YELLOW}Please create secrets/jwt_secret.txt with your JWT secret${NC}"
    exit 1
fi

# Check if production users config exists
if [ ! -f "./config/prod-users.json" ]; then
    echo -e "${YELLOW}⚠️  Warning: config/prod-users.json not found${NC}"
    echo -e "${YELLOW}No production users will be created. Copy from config/prod-users.json.example if needed${NC}"
fi

# Build and start production environment
echo -e "${GREEN}Building and starting production environment...${NC}"
echo -e "${YELLOW}Database will be persistent, users will be created from config file${NC}"
docker-compose -f docker-compose.prod.yml up --build -d

echo -e "${GREEN}✅ Production environment started${NC}"
echo -e "${GREEN}API available at: http://localhost:3000${NC}"
echo -e "${GREEN}Health check: http://localhost:3000/health${NC}"
echo -e "${YELLOW}Use 'docker-compose -f docker-compose.prod.yml logs -f' to view logs${NC}"
echo -e "${YELLOW}Use 'docker-compose -f docker-compose.prod.yml down' to stop${NC}"
