#!/bin/bash

# Script to pull Docker images from GitHub Container Registry (in parallel)
# Usage: 
#   ./pull-images.sh                    # Pull latest and start containers (default)
#   ./pull-images.sh start              # Same as above
#   ./pull-images.sh latest             # Pull latest tag only (no start)
#   ./pull-images.sh main latest        # Pull specific branch/tag (no start)
#   ./pull-images.sh main latest start  # Pull and start containers
#   ./pull-images.sh main 1decf4e       # Pull by commit SHA (will try sha-1decf4e format)
# Note: Images are pulled in parallel for faster downloads

set -uo pipefail

# Configuration
REGISTRY="ghcr.io"
OWNER="${GITHUB_REPOSITORY_OWNER:-aousganeh}"
REPO_NAME="healthcare-microservices"

# Parse arguments: if no args, default to pull and start
if [ $# -eq 0 ]; then
    BRANCH="main"
    TAG="latest"
    START_CONTAINERS="start"
elif [ $# -eq 1 ] && [ "$1" = "start" ]; then
    BRANCH="main"
    TAG="latest"
    START_CONTAINERS="start"
elif [ $# -eq 1 ]; then
    BRANCH="main"
    TAG="$1"
    START_CONTAINERS="false"
elif [ $# -eq 2 ]; then
    BRANCH="$1"
    TAG="$2"
    START_CONTAINERS="false"
else
    BRANCH="$1"
    TAG="$2"
    START_CONTAINERS="${3:-false}"
fi

# Services to pull
SERVICES=(
    "api-gateway"
    "service-discovery"
    "config-server"
    "identity-service"
    "patient-service"
    "doctor-service"
    "appointment-service"
    "billing-service"
    "room-service"
    "equipment-service"
    "notification-service"
    "frontend"
)

echo "🔐 Logging into GitHub Container Registry..."
if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_USERNAME:-}" ]; then
    echo "$GITHUB_TOKEN" | docker login $REGISTRY -u "$GITHUB_USERNAME" --password-stdin 2>/dev/null && {
        echo "   ✅ Logged in with GITHUB_TOKEN"
    } || {
        echo "   ⚠️  Could not login with GITHUB_TOKEN, trying interactive login..."
        docker login $REGISTRY
    }
else
    echo "   ℹ️  GITHUB_TOKEN not set, using interactive login"
    echo "   💡 To use token: export GITHUB_TOKEN=your_token && export GITHUB_USERNAME=your_username"
    echo "   💡 Create token at: https://github.com/settings/tokens (scope: read:packages)"
    docker login $REGISTRY
fi

echo ""
echo "📦 Pulling images from $REGISTRY/$OWNER/$REPO_NAME"
echo "   Branch: $BRANCH"
echo "   Tag: $TAG"
echo ""
echo "ℹ️  Note: Images are only built on push to main/develop branches"
echo "   If images don't exist, check: https://github.com/$OWNER/$REPO_NAME/actions"
echo "   Images are built for linux/amd64 platform (will use emulation on ARM)"
echo ""

# Function to show where to find available tags
show_tag_info() {
    local service=$1
    echo "   💡 Check available tags at:"
    echo "      https://github.com/$OWNER?tab=packages&repo_name=$REPO_NAME"
    echo "   💡 Or view package: ghcr.io/$OWNER/$REPO_NAME/$service"
}

# Function to pull and tag image
pull_image() {
    local service=$1
    local image_name="$REGISTRY/$OWNER/$REPO_NAME/$service"
    local local_tag="${service}:${TAG}"
    
    # Try direct tag first (with platform for cross-platform compatibility)
    if docker pull --platform linux/amd64 "${image_name}:${TAG}" 2>/dev/null; then
        docker tag "${image_name}:${TAG}" "$local_tag" 2>/dev/null
        echo "[$service] ✅ Pulled and tagged as $local_tag"
        return 0
    fi
    
    # If latest tag requested, try latest directly
    if [ "$TAG" = "latest" ]; then
        if docker pull --platform linux/amd64 "${image_name}:latest" 2>/dev/null; then
            docker tag "${image_name}:latest" "$local_tag" 2>/dev/null
            echo "[$service] ✅ Pulled and tagged as $local_tag"
            return 0
        fi
    fi
    
    # If TAG looks like a SHA (7+ hex chars), try sha- prefix format (GitHub's format)
    if [[ "$TAG" =~ ^[a-f0-9]{7,}$ ]]; then
        # Try sha-<sha> format (GitHub's actual format: sha-1decf4e)
        if docker pull --platform linux/amd64 "${image_name}:sha-${TAG}" 2>/dev/null; then
            docker tag "${image_name}:sha-${TAG}" "$local_tag" 2>/dev/null
            echo "[$service] ✅ Pulled and tagged as $local_tag"
            return 0
        fi
        # Try branch-sha format (e.g., main-1decf4e)
        if docker pull --platform linux/amd64 "${image_name}:${BRANCH}-${TAG}" 2>/dev/null; then
            docker tag "${image_name}:${BRANCH}-${TAG}" "$local_tag" 2>/dev/null
            echo "[$service] ✅ Pulled and tagged as $local_tag"
            return 0
        fi
    fi
    
    echo "[$service] ⚠️  Could not find image with tag: $TAG"
    return 1
}

# Pull all service images in parallel
SUCCESS=0
FAILED=0
PIDS=()

echo "🚀 Starting parallel pull of ${#SERVICES[@]} services..."
echo ""

# Start all pulls in background
for service in "${SERVICES[@]}"; do
    (
        if pull_image "$service"; then
            echo "$service:SUCCESS" > "/tmp/pull_${service}.result"
        else
            echo "$service:FAILED" > "/tmp/pull_${service}.result"
        fi
    ) &
    PIDS+=($!)
done

# Wait for all background jobs to complete
echo "⏳ Waiting for all pulls to complete..."
for pid in "${PIDS[@]}"; do
    wait "$pid"
done

# Count results
for service in "${SERVICES[@]}"; do
    if [ -f "/tmp/pull_${service}.result" ]; then
        if grep -q "SUCCESS" "/tmp/pull_${service}.result"; then
            ((SUCCESS++))
        else
            ((FAILED++))
        fi
        rm -f "/tmp/pull_${service}.result"
    else
        ((FAILED++))
    fi
done

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   ✅ Successfully pulled: $SUCCESS images"
echo "   ❌ Failed: $FAILED images"
echo ""
echo "📝 Images are tagged locally as: <service-name>:<tag>"
echo "   Example: patient-service:latest"
echo ""

# Start containers if requested
if [ "$START_CONTAINERS" = "start" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Starting containers with docker-compose..."
    echo ""
    
    # Create docker-compose override file to use pulled images
    echo "   📝 Creating docker-compose override for tag: $TAG"
    {
        echo "version: '3.8'"
        echo ""
        echo "# Override to use pre-pulled images instead of building"
        echo "services:"
        
        # Add image overrides for all services
        for service in "${SERVICES[@]}"; do
            if [ "$service" != "frontend" ]; then
                if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${service}:${TAG}$"; then
                    echo "  ${service}:"
                    echo "    image: ${service}:${TAG}"
                    # When image is specified, docker-compose will use it instead of building
                fi
            fi
        done
    } > docker-compose.override.yml
    
    echo "   ✅ Override file created"
    echo ""
    echo "   🐳 Starting all services (including databases) with docker-compose..."
    echo "   (Using pulled images, not building)"
    echo ""
    
    # Use docker-compose to start everything (--no-build prevents building, uses images)
    # The override file specifies images, so docker-compose will use them instead of building
    docker-compose up -d --no-build
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Container Status:"
    echo ""
    
    # Wait a moment for containers to start
    sleep 2
    
    # Show all containers with their status
    docker-compose ps
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Running containers:"
    docker-compose ps --filter "status=running" --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || docker ps --filter "name=healthcare-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "❌ Failed/Exited containers:"
    EXITED=$(docker-compose ps --filter "status=exited" --format "{{.Name}}" 2>/dev/null)
    if [ -n "$EXITED" ]; then
        docker-compose ps --filter "status=exited" --format "table {{.Name}}\t{{.Status}}"
        echo ""
        echo "💡 To see why a container exited, run:"
        echo "   docker-compose logs [service-name]"
    else
        echo "   (none)"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 Access services:"
    echo "   - API Gateway: http://localhost:8080"
    echo "   - Eureka UI: http://localhost:8761"
    echo "   - PostgreSQL: localhost:5432"
    echo "   - Redis: localhost:6379"
    echo ""
    echo "💡 Useful commands:"
    echo "   docker-compose logs -f [service-name]  # View logs"
    echo "   docker-compose ps                      # Check status"
    echo "   docker-compose stop                   # Stop all services"
    echo "   docker-compose down                   # Stop and remove containers"
    echo ""
else
    echo "💡 To start containers, run:"
    echo "   ./pull-images.sh"
    echo "   or"
    echo "   ./pull-images.sh $BRANCH $TAG start"
fi

