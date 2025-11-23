.PHONY: help build test clean docker-build docker-push docker-build-all

# Variables
SERVICES := api-gateway service-discovery config-server identity-service patient-service \
            doctor-service appointment-service billing-service room-service \
            equipment-service notification-service
DOCKER_REGISTRY ?= your-registry
DOCKER_TAG ?= latest

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all services with Gradle
	@echo "Building all services..."
	./gradlew build -x test --build-cache --parallel

test: ## Run tests for all services
	@echo "Running tests..."
	./gradlew test --build-cache --parallel

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	./gradlew clean

docker-build: ## Build Docker image for a specific service (use SERVICE=service-name)
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE variable is required. Usage: make docker-build SERVICE=api-gateway"; \
		exit 1; \
	fi
	@echo "Building Docker image for $(SERVICE)..."
	DOCKER_BUILDKIT=1 docker build \
		--build-arg BUILDKIT_INLINE_CACHE=1 \
		--cache-from $(DOCKER_REGISTRY)/$(SERVICE):$(DOCKER_TAG) \
		-t $(DOCKER_REGISTRY)/$(SERVICE):$(DOCKER_TAG) \
		-f $(SERVICE)/Dockerfile \
		.

docker-build-all: ## Build Docker images for all services in parallel
	@echo "Building all Docker images in parallel..."
	@for service in $(SERVICES); do \
		echo "Building $$service..."; \
		$(MAKE) docker-build SERVICE=$$service DOCKER_REGISTRY=$(DOCKER_REGISTRY) DOCKER_TAG=$(DOCKER_TAG) & \
	done; \
	wait
	@echo "All builds completed!"

docker-push: ## Push Docker image for a specific service (use SERVICE=service-name)
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE variable is required. Usage: make docker-push SERVICE=api-gateway"; \
		exit 1; \
	fi
	@echo "Pushing Docker image for $(SERVICE)..."
	docker push $(DOCKER_REGISTRY)/$(SERVICE):$(DOCKER_TAG)

docker-push-all: ## Push all Docker images
	@echo "Pushing all Docker images..."
	@for service in $(SERVICES); do \
		echo "Pushing $$service..."; \
		$(MAKE) docker-push SERVICE=$$service DOCKER_REGISTRY=$(DOCKER_REGISTRY) DOCKER_TAG=$(DOCKER_TAG) & \
	done; \
	wait
	@echo "All images pushed!"

docker-build-frontend: ## Build frontend Docker image
	@echo "Building frontend Docker image..."
	DOCKER_BUILDKIT=1 docker build \
		--build-arg BUILDKIT_INLINE_CACHE=1 \
		--cache-from $(DOCKER_REGISTRY)/frontend:$(DOCKER_TAG) \
		-t $(DOCKER_REGISTRY)/frontend:$(DOCKER_TAG) \
		-f frontend/Dockerfile \
		./frontend

up: ## Start all services with docker-compose
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## Show logs for all services
	docker-compose logs -f

rebuild: clean build ## Clean and rebuild all services

