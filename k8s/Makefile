.PHONY: help setup deploy status logs cleanup port-forward

NAMESPACE ?= healthcare
IMAGE_REGISTRY ?= ghcr.io/aousganeh/healthcare-microservices
IMAGE_TAG ?= latest

help:
	@echo "Healthcare Microservices - Kubernetes Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup              Setup local Kubernetes cluster and deploy"
	@echo "  make deploy             Deploy all services to Kubernetes"
	@echo ""
	@echo "Management Commands:"
	@echo "  make status             Show status of all pods and services"
	@echo "  make logs SERVICE=name  View logs for a specific service"
	@echo "  make port-forward       Port-forward API Gateway to localhost:8080"
	@echo "  make cleanup             Remove all resources from namespace"
	@echo ""
	@echo "Examples:"
	@echo "  make deploy IMAGE_TAG=v1.0.0"
	@echo "  make logs SERVICE=api-gateway"
	@echo "  make port-forward"

setup:
	@chmod +x setup-local.sh
	@./setup-local.sh

deploy:
	@chmod +x deploy.sh
	@IMAGE_REGISTRY=$(IMAGE_REGISTRY) IMAGE_TAG=$(IMAGE_TAG) ./deploy.sh

status:
	@echo "📊 Pod Status:"
	@kubectl get pods -n $(NAMESPACE)
	@echo ""
	@echo "🌐 Services:"
	@kubectl get services -n $(NAMESPACE)
	@echo ""
	@echo "📈 Deployments:"
	@kubectl get deployments -n $(NAMESPACE)

logs:
ifndef SERVICE
	@echo "❌ SERVICE variable is required"
	@echo "Usage: make logs SERVICE=api-gateway"
	@exit 1
endif
	@kubectl logs -f deployment/$(SERVICE) -n $(NAMESPACE)

port-forward:
	@echo "🔌 Port-forwarding API Gateway to localhost:8080..."
	@kubectl port-forward service/api-gateway 8080:80 -n $(NAMESPACE)

cleanup:
	@chmod +x cleanup.sh
	@./cleanup.sh $(NAMESPACE)

describe:
ifndef SERVICE
	@echo "❌ SERVICE variable is required"
	@echo "Usage: make describe SERVICE=api-gateway"
	@exit 1
endif
	@kubectl describe deployment/$(SERVICE) -n $(NAMESPACE)

restart:
ifndef SERVICE
	@echo "❌ SERVICE variable is required"
	@echo "Usage: make restart SERVICE=api-gateway"
	@exit 1
endif
	@kubectl rollout restart deployment/$(SERVICE) -n $(NAMESPACE)
	@kubectl rollout status deployment/$(SERVICE) -n $(NAMESPACE)

scale:
ifndef SERVICE
	@echo "❌ SERVICE variable is required"
	@echo "Usage: make scale SERVICE=api-gateway REPLICAS=3"
	@exit 1
endif
ifndef REPLICAS
	@echo "❌ REPLICAS variable is required"
	@echo "Usage: make scale SERVICE=api-gateway REPLICAS=3"
	@exit 1
endif
	@kubectl scale deployment/$(SERVICE) --replicas=$(REPLICAS) -n $(NAMESPACE)

