#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DDC Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}[1/4] Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install dependencies${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Start Docker Compose
echo -e "${YELLOW}[2/4] Starting Docker Compose...${NC}"
docker compose up -d

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start Docker Compose${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker Compose started${NC}"
echo ""

# Step 3: Wait for database to be ready
echo -e "${YELLOW}[3/4] Waiting for database to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  docker exec ddc-postgres pg_isready -U ddc_user -d ddc_catalog > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database is ready!${NC}"
    break
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo -e "   Waiting... (${RETRY_COUNT}/${MAX_RETRIES})"
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo -e "${RED}Database failed to become ready after ${MAX_RETRIES} attempts${NC}"
  exit 1
fi

echo ""

# Step 4: Run Prisma migrations
echo -e "${YELLOW}[4/4] Running Prisma migrations...${NC}"
cd packages/db
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to run Prisma migrations${NC}"
  exit 1
fi

cd ../..
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Success message
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next step:${NC} Run ${GREEN}npm run dev${NC} to start the development servers"
echo ""
