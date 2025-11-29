# syntax=docker/dockerfile:1.6
# Build stage
FROM node:20-alpine3.19 AS build

LABEL org.opencontainers.image.title="Healthcare Frontend" \
      org.opencontainers.image.description="React frontend application - 2025 Optimized"

WORKDIR /app

# Install dependencies with cache mount
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --frozen-lockfile

# Copy source and build
COPY . .
RUN npm run build

# Production stage - optimized nginx
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="Healthcare Frontend Runtime" \
      org.opencontainers.image.description="Optimized nginx runtime"

# Remove default config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy built files and optimized nginx config
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set permissions and create nginx user directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run/nginx.pid

# Security: run as non-root
USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
