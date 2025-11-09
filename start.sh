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
docker-compose -f docker-compose.prod.yml down

echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

sleep 15

docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔗 Quick Links:"
echo "  • Eureka Dashboard:    http://localhost:8761"
echo "  • API Gateway:         http://localhost:8080"
echo "  • Identity Service:    http://localhost:8001/swagger-ui/index.html"
echo "  • Patient Service:     http://localhost:8002/swagger-ui/index.html"
