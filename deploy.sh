#!/bin/bash
set -e

# ============================================================================
# Admin Panel - Deployment Script
# ============================================================================
# This script builds, pushes, and deploys the admin-fe to production
#
# Prerequisites:
# - Docker installed and logged in to Docker Hub
# - SSH access to production VM (172.16.1.244)
# - .env.production file copied to build directory during build
# ============================================================================

# Configuration
APP_NAME="admin-fe"
DOCKER_IMAGE="smesjman/admin-fe"
CONTAINER_NAME="admin-fe"
VM_HOST="172.16.1.244"
VM_USER="smesj"
CONTAINER_PORT="80"
HOST_PORT="3004"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get version tag (defaults to 'latest' or can be passed as argument)
VERSION="${1:-latest}"

log_info "Starting deployment for ${APP_NAME}:${VERSION}"

# ============================================================================
# Step 1: Copy production environment file
# ============================================================================
log_info "Preparing production environment..."
if [ ! -f ".env.production" ]; then
    log_error ".env.production not found!"
    log_info "Please create .env.production with your Clerk production keys"
    exit 1
fi

# ============================================================================
# Step 2: Build Docker Image
# ============================================================================
log_info "Building Docker image..."
docker build \
    --platform linux/amd64 \
    -t ${DOCKER_IMAGE}:${VERSION} \
    -t ${DOCKER_IMAGE}:latest \
    .

log_success "Docker image built successfully"

# ============================================================================
# Step 3: Push to Docker Hub
# ============================================================================
log_info "Pushing image to Docker Hub..."
docker push ${DOCKER_IMAGE}:${VERSION}

if [ "${VERSION}" != "latest" ]; then
    docker push ${DOCKER_IMAGE}:latest
fi

log_success "Image pushed to Docker Hub"

# ============================================================================
# Step 4: Deploy to Production VM
# ============================================================================
log_info "Deploying to production VM (${VM_HOST})..."

ssh ${VM_USER}@${VM_HOST} bash -s << EOF
set -e

echo "[VM] Pulling latest image..."
docker pull ${DOCKER_IMAGE}:${VERSION}

echo "[VM] Stopping existing container (if running)..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

echo "[VM] Starting new container..."
docker run -d \\
    --name ${CONTAINER_NAME} \\
    --restart unless-stopped \\
    -p ${HOST_PORT}:${CONTAINER_PORT} \\
    ${DOCKER_IMAGE}:${VERSION}

echo "[VM] Waiting for container to be healthy..."
sleep 3

echo "[VM] Checking container status..."
docker ps | grep ${CONTAINER_NAME}

echo "[VM] Checking container logs..."
docker logs ${CONTAINER_NAME} --tail 10

EOF

log_success "Deployment completed successfully"

# ============================================================================
# Step 5: Verify Deployment
# ============================================================================
log_info "Verifying deployment..."

sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://admin.smesj.world 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    log_success "Admin panel is responding (HTTP $HTTP_CODE)"
    log_success "🚀 Deployment complete! Admin panel is live at https://admin.smesj.world"
else
    log_warning "Admin panel returned HTTP $HTTP_CODE - please check logs"
    log_info "Check logs with: ssh ${VM_USER}@${VM_HOST} 'docker logs ${CONTAINER_NAME}'"
fi

echo ""
log_info "Deployment Summary:"
echo "  - Image: ${DOCKER_IMAGE}:${VERSION}"
echo "  - Container: ${CONTAINER_NAME}"
echo "  - URL: https://admin.smesj.world"
echo ""
