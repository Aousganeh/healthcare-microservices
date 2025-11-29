#!/bin/bash

set -e

export GITHUB_REPO=aousganeh/healthcare-microservices
export DOCKER_DEFAULT_PLATFORM=linux/amd64

# Use local docker-compose.yml for local development
COMPOSE_FILE="docker-compose.yml"

if [ -z "$IMAGE_TAG" ]; then
  echo "⚠️  IMAGE_TAG not set, using local builds. For production, use docker-compose.prod.yml"
  echo "   Example: docker-compose -f docker-compose.prod.yml up -d"
else
  echo "✅ Using image tag: $IMAGE_TAG"
  COMPOSE_FILE="docker-compose.prod.yml"
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

  echo "📥 Pulling latest images..."
  docker-compose -f "$COMPOSE_FILE" pull || echo "⚠️  Some images may not exist yet, will build locally"
else
  echo "🔨 Building images locally..."
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
