# Kubernetes Setup Guide

## Quick Start

### Option 1: Local Development (Minikube/Kind)

```bash
cd k8s
make setup
```

Or manually:
```bash
./setup-local.sh
```

### Option 2: Deploy to Existing Cluster

```bash
cd k8s
make deploy IMAGE_TAG=latest
```

Or manually:
```bash
./deploy.sh
```

## Prerequisites

1. **kubectl** - Kubernetes command-line tool
   ```bash
   # macOS
   brew install kubectl
   
   # Linux
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```

2. **Kubernetes Cluster** - Choose one:
   - **Minikube** (Recommended for local):
     ```bash
     brew install minikube
     minikube start
     ```
   - **Kind** (Kubernetes in Docker):
     ```bash
     brew install kind
     kind create cluster
     ```
   - **Docker Desktop** - Enable Kubernetes in settings
   - **Cloud** - EKS, GKE, AKS, etc.

## Deployment Steps

### 1. Create Namespace
```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets
```bash
kubectl create secret generic patient-db-secret \
  --from-literal=url='jdbc:postgresql://postgres-patient:5432/healthcare_patient' \
  --from-literal=username='postgres' \
  --from-literal=password='postgres' \
  -n healthcare
```

### 3. Deploy Services
```bash
# Deploy in order
kubectl apply -f service-discovery-deployment.yaml
kubectl apply -f api-gateway-deployment.yaml
kubectl apply -f patient-service-deployment.yaml
# ... other services
```

### 4. Check Status
```bash
kubectl get pods -n healthcare
kubectl get services -n healthcare
```

## Useful Commands

### View Logs
```bash
kubectl logs -f deployment/api-gateway -n healthcare
```

### Port Forward
```bash
kubectl port-forward service/api-gateway 8080:80 -n healthcare
```

### Scale Service
```bash
kubectl scale deployment/api-gateway --replicas=3 -n healthcare
```

### Restart Service
```bash
kubectl rollout restart deployment/api-gateway -n healthcare
```

## Using Makefile

```bash
make setup          # Setup local cluster
make deploy         # Deploy all services
make status         # Show status
make logs SERVICE=api-gateway  # View logs
make port-forward   # Port-forward API Gateway
make cleanup        # Remove all resources
```

## Cloud Deployment

### AWS EKS
```bash
# Create cluster
eksctl create cluster --name healthcare --region us-east-1

# Configure kubectl
aws eks update-kubeconfig --name healthcare --region us-east-1

# Deploy
make deploy
```

### Google GKE
```bash
# Create cluster
gcloud container clusters create healthcare --zone us-central1-a

# Configure kubectl
gcloud container clusters get-credentials healthcare --zone us-central1-a

# Deploy
make deploy
```

### Azure AKS
```bash
# Create cluster
az aks create --resource-group healthcare-rg --name healthcare --node-count 3

# Configure kubectl
az aks get-credentials --resource-group healthcare-rg --name healthcare

# Deploy
make deploy
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n healthcare
kubectl logs <pod-name> -n healthcare
```

### Service not accessible
```bash
kubectl get endpoints -n healthcare
kubectl get ingress -n healthcare
```

### Database connection issues
```bash
kubectl exec -it deployment/postgres-patient -n healthcare -- psql -U postgres
```

