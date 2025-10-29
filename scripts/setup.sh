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

# Step 0: Create .env files
echo -e "${YELLOW}[0/4] Creating .env files...${NC}"

# Root .env
if [ -f .env ]; then
    echo -e "   Root .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

cat > .env << 'EOF'
# Environment
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=15432
DB_USER=ddc_user
DB_PASSWORD=ddc_password
DB_NAME=ddc_catalog

# Server Configuration
PORT=3003

# JWT Configuration (change in production)
JWT_SECRET=your-secret-key-change-in-production

# Logging
LOG_LEVEL=info
EOF

echo -e "${GREEN}✓ Root .env file created${NC}"

# Database package .env
if [ -f packages/db/.env ]; then
    echo -e "   Database .env file already exists. Backing up to packages/db/.env.backup"
    cp packages/db/.env packages/db/.env.backup
fi

cat > packages/db/.env << 'EOF'
DATABASE_URL="postgresql://ddc_user:ddc_password@localhost:15432/ddc_catalog?schema=catalog"
EOF

echo -e "${GREEN}✓ Database .env file created${NC}"

# Webapp package .env
if [ -f packages/webapp/.env ]; then
    echo -e "   Webapp .env file already exists. Backing up to packages/webapp/.env.backup"
    cp packages/webapp/.env packages/webapp/.env.backup
fi

cat > packages/webapp/.env << 'EOF'
# API Server URL
VITE_API_URL=http://localhost:3003
EOF

echo -e "${GREEN}✓ Webapp .env file created${NC}"
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
