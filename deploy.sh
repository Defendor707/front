#!/bin/bash

# AI Call Center Frontend Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}
echo "🚀 Deploying to $ENV environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from example...${NC}"
    cp .env.production.example .env.production
    echo -e "${YELLOW}⚠️  Please update .env.production with correct values!${NC}"
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Build
echo -e "${GREEN}📦 Building application...${NC}"
npm ci
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Docker deployment
if command -v docker &> /dev/null; then
    echo -e "${GREEN}🐳 Building Docker image...${NC}"
    
    docker build \
        --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
        --build-arg VITE_WS_BASE_URL=${VITE_WS_BASE_URL} \
        -t ai-call-center-frontend:latest \
        -t ai-call-center-frontend:$(git rev-parse --short HEAD) \
        .
    
    echo -e "${GREEN}✅ Docker image built!${NC}"
    
    # Stop old container
    if docker ps -a | grep -q ai-call-center-frontend; then
        echo -e "${YELLOW}🛑 Stopping old container...${NC}"
        docker stop ai-call-center-frontend || true
        docker rm ai-call-center-frontend || true
    fi
    
    # Create network if not exists
    docker network create call-center-network 2>/dev/null || true
    
    # Run new container
    echo -e "${GREEN}🚀 Starting new container...${NC}"
    docker run -d \
        --name ai-call-center-frontend \
        --restart unless-stopped \
        --network call-center-network \
        -p 80:80 \
        ai-call-center-frontend:latest
    
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo -e "${GREEN}🌐 Application is running on http://localhost${NC}"
    
    # Health check
    sleep 5
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed. Check logs: docker logs ai-call-center-frontend${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not found. Skipping Docker deployment.${NC}"
    echo -e "${GREEN}✅ Build files are in ./dist directory${NC}"
    echo -e "${YELLOW}⚠️  Please deploy manually using nginx or other web server.${NC}"
fi

echo -e "${GREEN}🎉 Done!${NC}"
