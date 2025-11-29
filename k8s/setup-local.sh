#!/bin/bash

set -e

echo "🚀 Healthcare Microservices - Kubernetes Local Setup"
echo "=================================================="

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install it first:"
    echo "   macOS: brew install kubectl"
    echo "   Linux: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Detect Kubernetes cluster type
if kubectl cluster-info &> /dev/null; then
    echo "✅ Kubernetes cluster detected"
    kubectl cluster-info
else
    echo "❌ No Kubernetes cluster found. Choose an option:"
    echo ""
    echo "1. Minikube (Recommended for local development)"
    echo "2. Kind (Kubernetes in Docker)"
    echo "3. Docker Desktop Kubernetes"
    echo "4. Skip (use existing cluster)"
    echo ""
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            echo "📦 Setting up Minikube..."
            if ! command -v minikube &> /dev/null; then
                echo "Installing Minikube..."
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    brew install minikube
                else
                    echo "Please install Minikube: https://minikube.sigs.k8s.io/docs/start/"
                    exit 1
                fi
            fi
            minikube start --driver=docker --memory=4096 --cpus=4
            minikube addons enable ingress
            minikube addons enable metrics-server
            echo "✅ Minikube started"
            ;;
        2)
            echo "📦 Setting up Kind..."
            if ! command -v kind &> /dev/null; then
                echo "Installing Kind..."
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    brew install kind
                else
                    echo "Please install Kind: https://kind.sigs.k8s.io/docs/user/quick-start/"
                    exit 1
                fi
            fi
            kind create cluster --name healthcare --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
            echo "✅ Kind cluster created"
            ;;
        3)
            echo "📦 Using Docker Desktop Kubernetes..."
            echo "Please enable Kubernetes in Docker Desktop settings"
            echo "Docker Desktop > Settings > Kubernetes > Enable Kubernetes"
            read -p "Press Enter when Kubernetes is enabled..."
            ;;
        4)
            echo "⏭️  Skipping cluster setup. Using existing cluster."
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
fi

# Create namespace
echo ""
echo "📁 Creating namespace..."
kubectl apply -f namespace.yaml

# Create secrets (you'll need to update these with your actual values)
echo ""
echo "🔐 Creating secrets..."
kubectl create secret generic patient-db-secret \
    --from-literal=url='jdbc:postgresql://postgres-patient:5432/healthcare_patient' \
    --from-literal=username='postgres' \
    --from-literal=password='postgres' \
    --namespace=healthcare \
    --dry-run=client -o yaml | kubectl apply -f -

# Deploy PostgreSQL
echo ""
echo "🗄️  Deploying PostgreSQL..."
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-patient
  namespace: healthcare
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres-patient
  template:
    metadata:
      labels:
        app: postgres-patient
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_DB
          value: healthcare_patient
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          value: postgres
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: postgres-data
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-patient
  namespace: healthcare
spec:
  selector:
    app: postgres-patient
  ports:
  - port: 5432
    targetPort: 5432
EOF

# Deploy Redis
echo ""
echo "📦 Deploying Redis..."
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: healthcare
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        command: ["redis-server", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: healthcare
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
EOF

# Wait for databases to be ready
echo ""
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres-patient -n healthcare --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n healthcare --timeout=60s

# Deploy observability
echo ""
echo "📊 Deploying observability stack..."
kubectl apply -f configmap-observability.yaml
kubectl apply -f otel-collector.yaml

# Deploy services
echo ""
echo "🚀 Deploying microservices..."
echo "Deploying service-discovery..."
kubectl apply -f service-discovery-deployment.yaml

echo "Waiting for service-discovery..."
kubectl wait --for=condition=available deployment/service-discovery -n healthcare --timeout=120s

echo "Deploying API Gateway..."
kubectl apply -f api-gateway-deployment.yaml

echo "Deploying Patient Service..."
kubectl apply -f patient-service-deployment.yaml

# Deploy ingress (if using minikube)
if command -v minikube &> /dev/null && minikube status &> /dev/null; then
    echo ""
    echo "🌐 Setting up Ingress..."
    kubectl apply -f ingress.yaml
    echo ""
    echo "📍 To access services, run: minikube service api-gateway -n healthcare"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Useful commands:"
echo "  kubectl get pods -n healthcare"
echo "  kubectl get services -n healthcare"
echo "  kubectl logs -f deployment/api-gateway -n healthcare"
echo "  kubectl port-forward service/api-gateway 8080:80 -n healthcare"
echo ""
echo "🔍 Check service status:"
kubectl get all -n healthcare

