# GitHub Secrets Setup Guide

This guide explains what secrets you need to configure for the CI/CD pipeline to work properly.

## Required Secrets

Your CI/CD workflow requires **3 secrets** to be set up in GitHub:

### 1. `DOCKER_USERNAME`
- **Description**: Your Docker registry username
- **Where to get it**:
  - **Docker Hub**: Your Docker Hub username
  - **GitHub Container Registry (GHCR)**: Your GitHub username
  - **Other registries**: Your registry-specific username

### 2. `DOCKER_PASSWORD`
- **Description**: Your Docker registry password or access token
- **Where to get it**:
  - **Docker Hub**: 
    - Your Docker Hub password, OR
    - A Docker Hub access token (recommended for security)
    - Create token at: https://hub.docker.com/settings/security
  - **GitHub Container Registry (GHCR)**:
    - A GitHub Personal Access Token (PAT) with `write:packages` permission
    - Create token at: https://github.com/settings/tokens
  - **Other registries**: Registry-specific access token

### 3. `DOCKER_REGISTRY` (Optional but recommended)
- **Description**: The registry domain (without username/path)
- **Examples**:
  - **Docker Hub**: Leave empty or set to `docker.io` (default)
  - **GitHub Container Registry**: `ghcr.io`
  - **AWS ECR**: `123456789012.dkr.ecr.us-east-1.amazonaws.com`
  - **Google Container Registry**: `gcr.io`
  - **Azure Container Registry**: `yourregistry.azurecr.io`
- **Note**: The full image path in the workflow uses `DOCKER_REGISTRY/username/service-name`

## How to Set Up Secrets in GitHub

### Step-by-Step Instructions:

1. **Go to your GitHub repository**
   - Navigate to: `https://github.com/yourusername/healthcare-microservices`

2. **Open Settings**
   - Click on the **Settings** tab in your repository

3. **Navigate to Secrets**
   - In the left sidebar, click **Secrets and variables** → **Actions**

4. **Add Each Secret**
   - Click **New repository secret**
   - Enter the secret name (e.g., `DOCKER_USERNAME`)
   - Enter the secret value
   - Click **Add secret**
   - Repeat for all 3 secrets

## Option 1: Using Docker Hub

If you want to use Docker Hub:

```bash
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-password-or-token
DOCKER_REGISTRY: docker.io
```

**Note**: For Docker Hub, you can leave `DOCKER_REGISTRY` empty - it defaults to `docker.io`

## Option 2: Using GitHub Container Registry (Recommended)

GitHub Container Registry (GHCR) is free for public repositories and integrated with GitHub:

```bash
DOCKER_USERNAME: your-github-username
DOCKER_PASSWORD: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DOCKER_REGISTRY: ghcr.io
```

**Note**: The workflow will construct the full image path as `ghcr.io/your-github-username/service-name`

**To create a GitHub Personal Access Token:**
1. Go to: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Give it a name (e.g., "Docker Push Token")
4. Select scope: `write:packages`
5. Click **Generate token**
6. Copy the token (starts with `ghp_`)
7. Use this token as `DOCKER_PASSWORD`

**Benefits of GHCR:**
- Free for public repositories
- Integrated with GitHub
- No separate account needed
- Images are linked to your repository

## Option 3: Using Other Container Registries

### AWS ECR (Elastic Container Registry)
```bash
DOCKER_USERNAME: AWS
DOCKER_PASSWORD: <AWS_ACCESS_KEY_ID>:<AWS_SECRET_ACCESS_KEY>
DOCKER_REGISTRY: 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

### Google Container Registry (GCR)
```bash
DOCKER_USERNAME: _json_key
DOCKER_PASSWORD: <base64-encoded-service-account-json>
DOCKER_REGISTRY: gcr.io/your-project-id
```

### Azure Container Registry (ACR)
```bash
DOCKER_USERNAME: your-registry-name
DOCKER_PASSWORD: <registry-password>
DOCKER_REGISTRY: yourregistry.azurecr.io
```

## Testing Your Secrets

After setting up secrets, you can test them by:

1. **Making a small change** to trigger the workflow
2. **Checking the Actions tab** to see if the workflow runs
3. **Verifying** that Docker images are pushed successfully

## Security Best Practices

1. **Use Access Tokens Instead of Passwords**
   - Tokens can be revoked if compromised
   - Tokens can have limited scopes

2. **Never Commit Secrets**
   - Secrets should NEVER be in your code
   - Always use GitHub Secrets for sensitive data

3. **Rotate Secrets Regularly**
   - Change passwords/tokens periodically
   - Update secrets in GitHub when rotated

4. **Use Least Privilege**
   - Only grant necessary permissions
   - For GHCR, only `write:packages` is needed

## Troubleshooting

### Workflow fails with "authentication required"
- Check that all 3 secrets are set correctly
- Verify the registry URL format is correct
- Ensure the token/password has write permissions

### Images not appearing in registry
- Check the `DOCKER_REGISTRY` format
- Verify the workflow completed successfully
- Check registry logs for errors

### "Permission denied" errors
- Verify token has correct scopes/permissions
- Check if token has expired
- Ensure username matches registry account

## Quick Setup Checklist

- [ ] Created Docker Hub account OR GitHub Personal Access Token
- [ ] Added `DOCKER_USERNAME` secret
- [ ] Added `DOCKER_PASSWORD` secret (token recommended)
- [ ] Added `DOCKER_REGISTRY` secret
- [ ] Tested workflow with a small change
- [ ] Verified images appear in registry

## Example: Complete Setup for GHCR

```bash
# In GitHub Secrets:
DOCKER_USERNAME: aousganeh
DOCKER_PASSWORD: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DOCKER_REGISTRY: ghcr.io/aousganeh
```

After setup, your images will be available at:
- `ghcr.io/aousganeh/api-gateway:latest`
- `ghcr.io/aousganeh/patient-service:latest`
- etc.

