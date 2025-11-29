#!/bin/bash

set -e

NAMESPACE="${1:-healthcare}"

echo "🧹 Cleaning up Healthcare Microservices from Kubernetes"
echo "======================================================"
echo "Namespace: $NAMESPACE"
echo ""

read -p "Are you sure you want to delete all resources in namespace '$NAMESPACE'? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🗑️  Deleting deployments..."
kubectl delete deployment --all -n "$NAMESPACE" --ignore-not-found=true

echo "🗑️  Deleting services..."
kubectl delete service --all -n "$NAMESPACE" --ignore-not-found=true

echo "🗑️  Deleting configmaps..."
kubectl delete configmap --all -n "$NAMESPACE" --ignore-not-found=true

echo "🗑️  Deleting secrets..."
kubectl delete secret --all -n "$NAMESPACE" --ignore-not-found=true

echo "🗑️  Deleting ingress..."
kubectl delete ingress --all -n "$NAMESPACE" --ignore-not-found=true

echo "🗑️  Deleting HPA..."
kubectl delete hpa --all -n "$NAMESPACE" --ignore-not-found=true

echo "🗑️  Deleting PDB..."
kubectl delete pdb --all -n "$NAMESPACE" --ignore-not-found=true

echo ""
read -p "Delete namespace '$NAMESPACE'? (yes/no): " delete_ns

if [ "$delete_ns" == "yes" ]; then
    echo "🗑️  Deleting namespace..."
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    echo "✅ Namespace deleted"
else
    echo "⏭️  Namespace kept"
fi

echo ""
echo "✅ Cleanup complete!"

