# CI/CD Pipeline Optimizations

This directory contains optimized CI/CD workflows for the healthcare microservices project.

## Key Optimizations

### 1. **Conditional Builds**
- Only builds services that have changed (using path filters)
- Saves significant time on PRs that only touch one service

### 2. **Parallel Execution**
- All services build and test in parallel using matrix strategy
- Docker images build in parallel
- Frontend builds separately from backend

### 3. **Advanced Caching**
- **Gradle**: Caches dependencies and build outputs using GitHub Actions cache
- **Docker**: Uses GitHub Actions cache (GHA) for layer caching
- **Node.js**: Caches npm dependencies
- **BuildKit**: Inline cache for Docker builds

### 4. **Docker BuildKit**
- Enabled BuildKit for faster, more efficient builds
- Layer caching across builds
- Parallel stage execution

### 5. **Optimized Build Order**
1. Detect changes (fast)
2. Build & test services in parallel
3. Build Docker images in parallel (only after successful builds)
4. Integration tests (optional, only on main branch)

## Usage

### Setting up Secrets

Add these secrets to your GitHub repository:

- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password or access token
- `DOCKER_REGISTRY`: Docker registry URL (e.g., `docker.io/yourusername` or `ghcr.io/yourusername`)

### Workflow Triggers

- **Push to main/develop**: Full build, test, and push
- **Pull Requests**: Build and test only (no push)
- **Manual**: Can be triggered manually from Actions tab

## Performance Improvements

- **Before**: ~15-20 minutes for full build
- **After**: ~5-8 minutes for full build (with caching)
- **Incremental builds**: ~2-3 minutes (only changed services)

## Local Development

Use the Makefile for optimized local builds:

```bash
# Build all services
make build

# Build specific service Docker image
make docker-build SERVICE=api-gateway

# Build all Docker images in parallel
make docker-build-all

# Run tests
make test
```

