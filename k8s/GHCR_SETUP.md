# Deploying from GitHub Container Registry (GHCR)

## Quick Start

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Add Kubernetes deployments"
git push origin main
```

This will trigger the CI/CD pipeline which builds and pushes Docker images to GHCR.

### 2. Set Up Image Pull Secret

```bash
cd k8s
./setup-ghcr-secret.sh
```

Or manually:

```bash
# Option 1: Using GitHub CLI (if installed)
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=$(gh auth token) \
  --namespace=healthcare

# Option 2: Using Personal Access Token (PAT)
# Create PAT at: https://github.com/settings/tokens
# Required permission: read:packages
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_PAT \
  --namespace=healthcare
```

### 3. Deploy from GHCR

```bash
cd k8s
./deploy-from-ghcr.sh
```

Or using Make:

```bash
cd k8s
make deploy
```

## Verify Images Are Available

Check if images exist in your GitHub repository:

1. Go to: `https://github.com/aousganeh/healthcare-microservices/pkgs/container`
2. Or use GitHub CLI:
   ```bash
   gh api user/packages?package_type=container
   ```

## Update Image Tags

To use a specific tag instead of `latest`:

```bash
# Update all deployments
cd k8s
sed -i '' 's/:latest/:v1.0.0/g' *-deployment.yaml

# Or set environment variable in deploy script
IMAGE_TAG=v1.0.0 ./deploy-from-ghcr.sh
```

## Troubleshooting

### Images Not Found

If you get `ErrImagePull`:

1. **Check CI/CD pipeline ran successfully:**
   - Go to: `https://github.com/aousganeh/healthcare-microservices/actions`
   - Verify the "Build Docker Images" job completed

2. **Verify image exists:**
   ```bash
   docker pull ghcr.io/aousganeh/healthcare-microservices/service-discovery:latest
   ```

3. **Check secret:**
   ```bash
   kubectl get secret ghcr-secret -n healthcare
   kubectl describe secret ghcr-secret -n healthcare
   ```

### Authentication Issues

If images are private, make sure:

1. Secret is created correctly
2. PAT has `read:packages` permission
3. Repository visibility allows package access

### Make Images Public

To make packages public (so no auth needed):

1. Go to: `https://github.com/aousganeh/healthcare-microservices/pkgs/container`
2. Click on a package
3. Go to "Package settings"
4. Change visibility to "Public"

Then you can remove `imagePullSecrets` from deployments.

