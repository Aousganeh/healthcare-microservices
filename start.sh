#!/bin/bash

set -e

export GITHUB_REPO=aousganeh/healthcare-microservices
export REGISTRY=${REGISTRY:-ghcr.io}
export DOCKER_DEFAULT_PLATFORM=linux/amd64

# Default to using pre-built images from GitHub Container Registry
# Set BUILD_LOCAL=true to build images locally instead
if [ "$BUILD_LOCAL" = "true" ]; then
  echo "🔨 BUILD_LOCAL=true - Building images locally..."
  COMPOSE_FILE="docker-compose.yml"
else
  echo "📦 Using pre-built images from GitHub Container Registry"
  echo "   Images are built automatically by CI/CD on push to main"
  COMPOSE_FILE="docker-compose.prod.yml"
  if [ -n "$IMAGE_TAG" ]; then
    echo "✅ Using image tag: $IMAGE_TAG"
    export IMAGE_TAG
  else
    echo "ℹ️  Using 'latest' tag. Set IMAGE_TAG=<tag> to use a specific version"
    export IMAGE_TAG=latest
  fi
fi

echo "🛑 Stopping and removing existing containers..."
if [ "$CLEAN_VOLUMES" = "true" ]; then
  echo "⚠️  CLEAN_VOLUMES=true detected - volumes will be deleted (all data will be lost)"
  docker-compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true
else
  echo "ℹ️  Volumes will be preserved (data will be kept). Set CLEAN_VOLUMES=true to delete volumes."
  docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
fi

if [ "$COMPOSE_FILE" = "docker-compose.prod.yml" ]; then
  echo "🧹 Cleaning up unused images..."
  docker image prune -f > /dev/null 2>&1 || true

  echo "📥 Pulling images from $REGISTRY..."
  if ! docker-compose -f "$COMPOSE_FILE" pull 2>/dev/null; then
    echo "⚠️  Failed to pull images or images don't exist yet"
    echo "🔄 Falling back to local builds..."
    COMPOSE_FILE="docker-compose.yml"
  else
    echo "✅ Images pulled successfully"
    # Test if service-discovery image works
    if docker run --rm ghcr.io/aousganeh/healthcare-microservices/service-discovery:${IMAGE_TAG:-latest} ls /app/app.jar > /dev/null 2>&1; then
      echo "✅ Pulled images are valid"
    else
      echo "⚠️  Pulled images appear to be outdated (missing JAR files)"
      echo "🔄 Falling back to local builds with fixed Dockerfiles..."
      COMPOSE_FILE="docker-compose.yml"
    fi
  fi
fi

if [ "$COMPOSE_FILE" = "docker-compose.yml" ]; then
  echo "🔨 Building images locally (this may take several minutes)..."
  docker-compose -f "$COMPOSE_FILE" build --parallel
fi

echo "🚀 Starting containers..."
docker-compose -f "$COMPOSE_FILE" up -d

echo "⏳ Waiting for services to initialize..."
sleep 5

echo "🔍 Checking service discovery..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -s -f http://localhost:8761/actuator/health > /dev/null 2>&1; then
    echo "✅ Service Discovery is ready"
    break
  fi
  if [ $((attempt % 5)) -eq 0 ]; then
    echo "⏳ Waiting for Service Discovery... ($attempt/$max_attempts)"
  fi
  attempt=$((attempt + 1))
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Service Discovery failed to start. Checking logs..."
  docker-compose -f "$COMPOSE_FILE" logs service-discovery | tail -20
  exit 1
fi

echo "⏳ Waiting for services to register with Eureka..."
sleep 10

echo ""
echo "📊 Container Status:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo "🔗 Quick Links:"
echo "  • Eureka Dashboard:    http://localhost:8761"
echo "  • API Gateway:         http://localhost:8080"
echo "  • Identity Service:    http://localhost:8001/swagger-ui/index.html"
echo "  • Patient Service:     http://localhost:8002/swagger-ui/index.html"
echo "  • Frontend:            http://localhost:3000"
echo "  • Prometheus:          http://localhost:9090"
echo "  • Grafana:             http://localhost:3001"
echo ""
echo "💡 To view logs: docker-compose -f $COMPOSE_FILE logs -f [service-name]"
