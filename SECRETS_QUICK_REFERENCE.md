# Quick Reference: Required GitHub Secrets

## Required Secrets (3 total)

| Secret Name | Description | Example Values |
|------------|-------------|----------------|
| `DOCKER_USERNAME` | Docker registry username | `yourusername` or `your-github-username` |
| `DOCKER_PASSWORD` | Docker registry password/token | `your-password` or `ghp_xxxxxxxxxxxx` |
| `DOCKER_REGISTRY` | Docker registry base URL | `docker.io/yourusername` or `ghcr.io/yourusername` |

## Quick Setup

### For GitHub Container Registry (Recommended)
```
DOCKER_USERNAME: your-github-username
DOCKER_PASSWORD: ghp_your_personal_access_token
DOCKER_REGISTRY: ghcr.io
```

### For Docker Hub
```
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-password
DOCKER_REGISTRY: docker.io
(Or leave DOCKER_REGISTRY empty - defaults to docker.io)
```

## How to Add Secrets

1. Go to: `https://github.com/YOUR_USERNAME/healthcare-microservices/settings/secrets/actions`
2. Click **New repository secret**
3. Add each secret one by one
4. Save

## Where to Get Tokens

- **GitHub Token**: https://github.com/settings/tokens (select `write:packages`)
- **Docker Hub Token**: https://hub.docker.com/settings/security

## Full Documentation

See `docs/SECRETS_SETUP.md` for detailed instructions and troubleshooting.

