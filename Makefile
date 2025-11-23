.PHONY: help build test clean docker-build docker-build-all docker-push docker-push-all docker-build-frontend up down logs rebuild

SERVICES := api-gateway service-discovery config-server identity-service patient-service \
            doctor-service appointment-service billing-service room-service \
            equipment-service notification-service

DOCKER_REGISTRY ?= your-registry
DOCKER_TAG ?= latest

help:
	@echo "Healthcare Microservices - Makefile Commands"
	@echo ""
	@echo "Gradle Build Commands:"
	@echo "  make build              Build all services (skip tests)"
	@echo "  make test               Run tests for all services"
	@echo "  make clean              Clean build artifacts"
	@echo "  make rebuild            Clean and rebuild all services"
	@echo ""
	@echo "Docker Build Commands:"
	@echo "  make docker-build SERVICE=<name>     Build Docker image for specific service"
	@echo "  make docker-build-all                 Build all service Docker images in parallel"
	@echo "  make docker-build-frontend            Build frontend Docker image"
	@echo ""
	@echo "Docker Push Commands:"
	@echo "  make docker-push SERVICE=<name>      Push Docker image for specific service"
	@echo "  make docker-push-all                 Push all Docker images"
	@echo ""
	@echo "Docker Compose Commands:"
	@echo "  make up                Start all services"
	@echo "  make down              Stop all services"
	@echo "  make logs              Show logs for all services"
	@echo ""
	@echo "Examples:"
	@echo "  make docker-build SERVICE=api-gateway"
	@echo "  make docker-build SERVICE=patient-service DOCKER_REGISTRY=myregistry.io"
	@echo "  make docker-build-all DOCKER_TAG=v1.0.0"

build:
	@echo "Building all services with Gradle..."
	./gradlew build -x test --build-cache --parallel

test:
	@echo "Running tests for all services..."
	./gradlew test --build-cache --parallel

clean:
	@echo "Cleaning build artifacts..."
	./gradlew clean

rebuild: clean build
	@echo "Rebuild completed!"

docker-build:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE variable is required"; \
		echo "Usage: make docker-build SERVICE=api-gateway"; \
		echo "Available services: $(SERVICES)"; \
		exit 1; \
	fi
	@echo "Building Docker image: $(DOCKER_REGISTRY)/$(SERVICE):$(DOCKER_TAG)"
	DOCKER_BUILDKIT=1 docker build \
		--build-arg BUILDKIT_INLINE_CACHE=1 \
		--cache-from $(DOCKER_REGISTRY)/$(SERVICE):$(DOCKER_TAG) \
		-t $(DOCKER_REGISTRY)/$(SERVICE):$(DOCKER_TAG) \
		-f $(SERVICE)/Dockerfile \
		.

docker-build-all:
	@echo "Building Docker images for all services in parallel..."
	@for service in $(SERVICES); do \
		echo "Building $$service..."; \
		$(MAKE) docker-build SERVICE=$$service DOCKER_REGISTRY=$(DOCKER_REGISTRY) DOCKER_TAG=$(DOCKER_TAG) & \
	done; \
	wait
	@echo "All Docker builds completed!"

docker-build-frontend:
	@echo "Building frontend Docker image..."
	DOCKER_BUILDKIT=1 docker build \
		--build-arg BUILDKIT_INLINE_CACHE=1 \
		--cache-from $(DOCKER_REGISTRY)/frontend:$(DOCKER_TAG) \
		-t $(DOCKER_REGISTRY)/frontend:$(DOCKER_TAG) \
		-f frontend/Dockerfile \
		./frontend

docker-push:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE variable is required"; \
		echo "Usage: make docker-push SERVICE=api-gateway"; \
		echo "Available services: $(SERVICES)"; \
		exit 1; \
	fi
	@echo "Pushing Docker image: $(DOCKER_REGISTRY)/$(SERVICE):$(DOCKER_TAG)"
	docker push $(DOCKER_REGISTRY)/$(SERVICE):$(DOCKER_TAG)

docker-push-all:
	@echo "Pushing all Docker images..."
	@for service in $(SERVICES); do \
		echo "Pushing $$service..."; \
		$(MAKE) docker-push SERVICE=$$service DOCKER_REGISTRY=$(DOCKER_REGISTRY) DOCKER_TAG=$(DOCKER_TAG) & \
	done; \
	wait
	@echo "All Docker images pushed!"

up:
	@echo "Starting all services with docker-compose..."
	docker-compose up -d

down:
	@echo "Stopping all services..."
	docker-compose down

logs:
	@echo "Showing logs for all services (Ctrl+C to exit)..."
	docker-compose logs -f
