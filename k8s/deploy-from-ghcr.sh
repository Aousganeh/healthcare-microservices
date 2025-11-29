#!/bin/bash

set -e

echo "🚀 Deploying from GitHub Container Registry"
echo "=========================================="
echo ""

# Check if secret exists
if ! kubectl get secret ghcr-secret -n healthcare &> /dev/null; then
    echo "⚠️  GitHub Container Registry secret not found!"
    echo ""
    echo "Setting up secret..."
    chmod +x setup-ghcr-secret.sh
    ./setup-ghcr-secret.sh
    echo ""
fi

# Create namespace
echo "📁 Creating namespace..."
kubectl apply -f namespace.yaml

# Create secrets
echo ""
echo "🔐 Creating application secrets..."
kubectl create secret generic patient-db-secret \
  --from-literal=url='jdbc:postgresql://postgres-patient:5432/healthcare_patient' \
  --from-literal=username='postgres' \
  --from-literal=password='postgres' \
  -n healthcare \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy databases
echo ""
echo "🗄️  Deploying databases..."
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
---
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

# Wait for databases
echo ""
echo "⏳ Waiting for databases..."
kubectl wait --for=condition=ready pod -l app=postgres-patient -n healthcare --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=redis -n healthcare --timeout=60s || true

# Deploy observability
echo ""
echo "📊 Deploying observability..."
kubectl apply -f configmap-observability.yaml
kubectl apply -f otel-collector.yaml 2>/dev/null || echo "   OpenTelemetry collector not found, skipping..."

# Deploy services
echo ""
echo "🚀 Deploying microservices from GHCR..."

echo "   Deploying service-discovery..."
kubectl apply -f service-discovery-deployment.yaml

echo "   Waiting for service-discovery..."
kubectl wait --for=condition=available deployment/service-discovery -n healthcare --timeout=300s || echo "   Still starting..."

echo "   Deploying API Gateway..."
kubectl apply -f api-gateway-deployment.yaml

echo "   Deploying Patient Service..."
kubectl apply -f patient-service-deployment.yaml

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Check status:"
kubectl get pods -n healthcare
echo ""
echo "💡 To view logs:"
echo "   kubectl logs -f deployment/service-discovery -n healthcare"
echo ""
echo "💡 To port-forward API Gateway:"
echo "   kubectl port-forward service/api-gateway 8080:80 -n healthcare"
echo ""
echo "⚠️  Note: Images will be pulled from GitHub Container Registry."
echo "   Make sure your CI/CD pipeline has built and pushed the images."

