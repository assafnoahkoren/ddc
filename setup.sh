#!/bin/bash

# DDC Setup Script
# This script sets up the development environment for the Dynamic Data Catalog

set -e  # Exit on error

echo "=========================================="
echo "  Dynamic Data Catalog - Setup Script"
echo "=========================================="
echo ""

# Step 1: Create .env files
echo "Step 1: Creating .env files..."

# Root .env
if [ -f .env ]; then
    echo "  Root .env file already exists. Backing up to .env.backup"
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

echo "  ✓ Root .env file created"

# Database package .env
if [ -f packages/db/.env ]; then
    echo "  Database .env file already exists. Backing up to packages/db/.env.backup"
    cp packages/db/.env packages/db/.env.backup
fi

cat > packages/db/.env << 'EOF'
DATABASE_URL="postgresql://ddc_user:ddc_password@localhost:15432/ddc_catalog?schema=catalog"
EOF

echo "  ✓ Database .env file created"

# Webapp package .env
if [ -f packages/webapp/.env ]; then
    echo "  Webapp .env file already exists. Backing up to packages/webapp/.env.backup"
    cp packages/webapp/.env packages/webapp/.env.backup
fi

cat > packages/webapp/.env << 'EOF'
# API Server URL
VITE_API_URL=http://localhost:3003
EOF

echo "  ✓ Webapp .env file created"
echo ""

# Step 2: Install dependencies
echo "Step 2: Installing dependencies..."
npm install
echo "  ✓ Dependencies installed"
echo ""

# Step 3: Start database
echo "Step 3: Starting PostgreSQL database..."
docker-compose up -d postgres
echo "  Waiting for database to be ready..."
sleep 5
echo "  ✓ Database started"
echo ""

# Step 4: Run database migrations
echo "Step 4: Running database migrations..."
cd packages/db
npm run db:push
cd ../..
echo "  ✓ Database migrations completed"
echo ""

# Step 5: Build packages
echo "Step 5: Building packages..."
npm run build
echo "  ✓ Packages built successfully"
echo ""

echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Review and update .env file if needed"
echo "  2. Run 'npm run dev' to start the development servers"
echo "  3. Access the webapp at http://localhost:5173"
echo "  4. Access the API at http://localhost:3003"
echo ""
