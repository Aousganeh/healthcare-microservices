#!/bin/bash

export GITHUB_REPO=aousganeh/healthcare-microservices
export DOCKER_DEFAULT_PLATFORM=linux/amd64

if [ -z "$IMAGE_TAG" ]; then
  echo "⚠️  IMAGE_TAG not set, using 'latest'. For production, set IMAGE_TAG to a specific commit SHA."
  echo "   Example: IMAGE_TAG=abc1234 ./start.sh"
  export IMAGE_TAG=latest
else
  echo "✅ Using image tag: $IMAGE_TAG"
fi

echo "🛑 Stopping and removing existing containers..."
if [ "$CLEAN_VOLUMES" = "true" ]; then
  echo "⚠️  CLEAN_VOLUMES=true detected - volumes will be deleted (all data will be lost)"
  docker-compose -f docker-compose.prod.yml down -v
else
  echo "ℹ️  Volumes will be preserved (data will be kept). Set CLEAN_VOLUMES=true to delete volumes."
  docker-compose -f docker-compose.prod.yml down
fi

echo "🧹 Cleaning up unused images..."
docker image prune -f

echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 20

echo "🔍 Checking service discovery..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -s http://localhost:8761 > /dev/null 2>&1; then
    echo "✅ Service Discovery is ready"
    break
  fi
  attempt=$((attempt + 1))
  sleep 2
done

echo "⏳ Waiting for services to register with Eureka..."
sleep 15

docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔗 Quick Links:"
echo "  • Eureka Dashboard:    http://localhost:8761"
echo "  • API Gateway:         http://localhost:8080"
echo "  • Identity Service:    http://localhost:8001/swagger-ui/index.html"
echo "  • Patient Service:     http://localhost:8002/swagger-ui/index.html"
echo "  • Frontend:            http://localhost:3000"
echo "  • Prometheus:          http://localhost:9090"
echo "  • Grafana:             http://localhost:3001"
