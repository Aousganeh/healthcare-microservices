export GITHUB_REPO=aousganeh/healthcare-microservices
export DOCKER_DEFAULT_PLATFORM=linux/amd64

docker-compose -f docker-compose.prod.yml pull --platform linux/amd64

docker-compose -f docker-compose.prod.yml up -d

sleep 15

docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🔗 Quick Links:"
echo "  • Eureka Dashboard:    http://localhost:8761"
echo "  • API Gateway:         http://localhost:8080"
echo "  • Identity Service:    http://localhost:8001/swagger-ui/index.html"
echo "  • Patient Service:     http://localhost:8002/swagger-ui/index.html"
