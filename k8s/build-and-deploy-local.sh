#!/bin/bash

set -e

echo "🔨 Building and Deploying Healthcare Microservices Locally"
echo "=========================================================="

# Build images locally
echo ""
echo "1️⃣  Building Docker images locally..."

SERVICES=(
  "service-discovery"
  "config-server"
  "api-gateway"
  "identity-service"
  "patient-service"
  "doctor-service"
  "appointment-service"
  "billing-service"
  "room-service"
  "equipment-service"
  "notification-service"
)

for service in "${SERVICES[@]}"; do
  echo "   Building $service..."
  docker build -t healthcare-microservices/$service:local \
    -f $service/Dockerfile \
    . || echo "   ⚠️  $service Dockerfile not found, skipping..."
done

echo "   Building frontend..."
docker build -t healthcare-microservices/frontend:local \
  -f frontend/Dockerfile \
  ./frontend || echo "   ⚠️  Frontend Dockerfile not found, skipping..."

# Update deployments to use local images
echo ""
echo "2️⃣  Updating deployments to use local images..."

for service in "${SERVICES[@]}"; do
  if [ -f "$service-deployment.yaml" ]; then
    # Update image reference to local
    sed -i.bak "s|image:.*|image: healthcare-microservices/$service:local|g" "$service-deployment.yaml" 2>/dev/null || \
    sed -i '' "s|image:.*|image: healthcare-microservices/$service:local|g" "$service-deployment.yaml" 2>/dev/null || true
  fi
done

# Create namespace if it doesn't exist
echo ""
echo "3️⃣  Creating namespace..."
kubectl apply -f namespace.yaml

# Create secrets
echo ""
echo "4️⃣  Creating secrets..."
kubectl create secret generic patient-db-secret \
  --from-literal=url='jdbc:postgresql://postgres-patient:5432/healthcare_patient' \
  --from-literal=username='postgres' \
  --from-literal=password='postgres' \
  -n healthcare \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy databases
echo ""
echo "5️⃣  Deploying databases..."
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
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres-patient -n healthcare --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=redis -n healthcare --timeout=60s || true

# Deploy observability
echo ""
echo "6️⃣  Deploying observability..."
kubectl apply -f configmap-observability.yaml
kubectl apply -f otel-collector.yaml || echo "   ⚠️  OpenTelemetry collector not found, skipping..."

# Deploy services in order
echo ""
echo "7️⃣  Deploying microservices..."

echo "   Deploying service-discovery..."
kubectl apply -f service-discovery-deployment.yaml
kubectl wait --for=condition=available deployment/service-discovery -n healthcare --timeout=180s || true

echo "   Deploying API Gateway..."
kubectl apply -f api-gateway-deployment.yaml || echo "   ⚠️  API Gateway deployment not found"

echo "   Deploying Patient Service..."
kubectl apply -f patient-service-deployment.yaml || echo "   ⚠️  Patient Service deployment not found"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Check status:"
kubectl get pods -n healthcare
echo ""
echo "🌐 Services:"
kubectl get services -n healthcare
echo ""
echo "💡 To access API Gateway:"
echo "   kubectl port-forward service/api-gateway 8080:80 -n healthcare"
echo ""
echo "💡 To view logs:"
echo "   kubectl logs -f deployment/service-discovery -n healthcare"

