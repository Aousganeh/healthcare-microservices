#!/bin/bash
export GITHUB_REPO=aousganeh/healthcare-microservices
echo "📦 Pulling latest images from GitHub Container Registry..."
docker-compose -f docker-compose.prod.yml pull
echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d
echo ""
echo "⏳ Waiting for services to start..."
sleep 15
echo ""
echo "✅ All services started!"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🔗 Quick Links:"
echo "  • Eureka Dashboard:    http://localhost:8761"
echo "  • API Gateway:         http://localhost:8080"
echo "  • Identity Service:    http://localhost:8001/swagger-ui/index.html"
echo "  • Patient Service:     http://localhost:8002/swagger-ui/index.html"
