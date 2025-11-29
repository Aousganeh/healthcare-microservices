#!/bin/bash

set -e

echo "🔐 Setting up GitHub Container Registry Secret"
echo "=============================================="
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Create secret for pulling images from GHCR
echo ""
echo "Creating image pull secret..."
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=$GITHUB_USERNAME \
  --docker-password=$(gh auth token 2>/dev/null || echo "") \
  --namespace=healthcare \
  --dry-run=client -o yaml | kubectl apply -f -

if [ $? -eq 0 ]; then
  echo "✅ Secret created successfully"
  echo ""
  echo "Note: If you used 'gh auth token', make sure you're logged in:"
  echo "  gh auth login"
  echo ""
  echo "Alternatively, create a Personal Access Token (PAT) with 'read:packages' permission"
  echo "and use it as the password."
else
  echo ""
  echo "⚠️  Manual setup required:"
  echo ""
  echo "1. Create a GitHub Personal Access Token (PAT) with 'read:packages' permission:"
  echo "   https://github.com/settings/tokens"
  echo ""
  echo "2. Create the secret:"
  echo "   kubectl create secret docker-registry ghcr-secret \\"
  echo "     --docker-server=ghcr.io \\"
  echo "     --docker-username=YOUR_GITHUB_USERNAME \\"
  echo "     --docker-password=YOUR_PAT \\"
  echo "     --namespace=healthcare"
  echo ""
  echo "3. Update deployments to use the secret (already done in deployment files)"
fi

