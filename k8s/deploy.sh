#!/bin/bash

set -e

NAMESPACE="healthcare"
IMAGE_REGISTRY="${IMAGE_REGISTRY:-ghcr.io/aousganeh/healthcare-microservices}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "🚀 Deploying Healthcare Microservices to Kubernetes"
echo "=================================================="
echo "Registry: $IMAGE_REGISTRY"
echo "Tag: $IMAGE_TAG"
echo "Namespace: $NAMESPACE"
echo ""

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "📁 Creating namespace..."
    kubectl apply -f namespace.yaml
fi

# Update image references in deployments
echo "🔄 Updating image references..."
find . -name "*-deployment.yaml" -type f | while read file; do
    if grep -q "image:" "$file"; then
        sed -i.bak "s|image:.*|image: $IMAGE_REGISTRY/$(basename $(dirname $file)):$IMAGE_TAG|g" "$file" 2>/dev/null || \
        sed -i '' "s|image:.*|image: $IMAGE_REGISTRY/$(basename $(dirname $file)):$IMAGE_TAG|g" "$file"
    fi
done

# Deploy in order
echo ""
echo "1️⃣  Deploying Service Discovery..."
kubectl apply -f service-discovery-deployment.yaml

echo "   Waiting for service-discovery to be ready..."
kubectl wait --for=condition=available deployment/service-discovery -n "$NAMESPACE" --timeout=300s || true

echo ""
echo "2️⃣  Deploying Config Server..."
kubectl apply -f config-server-deployment.yaml 2>/dev/null || echo "   Config server not found, skipping..."

echo ""
echo "3️⃣  Deploying Observability..."
kubectl apply -f configmap-observability.yaml
kubectl apply -f otel-collector.yaml

echo ""
echo "4️⃣  Deploying Core Services..."
kubectl apply -f identity-service-deployment.yaml 2>/dev/null || echo "   Identity service not found, skipping..."
kubectl apply -f patient-service-deployment.yaml
kubectl apply -f doctor-service-deployment.yaml 2>/dev/null || echo "   Doctor service not found, skipping..."

echo ""
echo "5️⃣  Deploying Business Services..."
kubectl apply -f appointment-service-deployment.yaml 2>/dev/null || echo "   Appointment service not found, skipping..."
kubectl apply -f billing-service-deployment.yaml 2>/dev/null || echo "   Billing service not found, skipping..."
kubectl apply -f room-service-deployment.yaml 2>/dev/null || echo "   Room service not found, skipping..."
kubectl apply -f equipment-service-deployment.yaml 2>/dev/null || echo "   Equipment service not found, skipping..."
kubectl apply -f notification-service-deployment.yaml 2>/dev/null || echo "   Notification service not found, skipping..."

echo ""
echo "6️⃣  Deploying API Gateway..."
kubectl apply -f api-gateway-deployment.yaml

echo ""
echo "7️⃣  Deploying Ingress..."
kubectl apply -f ingress.yaml 2>/dev/null || echo "   Ingress not found, skipping..."

echo ""
echo "8️⃣  Deploying Pod Disruption Budgets..."
kubectl apply -f pdb.yaml

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
kubectl get pods -n "$NAMESPACE"
echo ""
echo "🌐 Services:"
kubectl get services -n "$NAMESPACE"
echo ""
echo "💡 To check logs: kubectl logs -f deployment/<service-name> -n $NAMESPACE"
echo "💡 To port-forward: kubectl port-forward service/api-gateway 8080:80 -n $NAMESPACE"

