# syntax=docker/dockerfile:1.6
# Build stage - optimized for 2025
FROM eclipse-temurin:21-jdk-alpine3.19 AS builder

LABEL org.opencontainers.image.title="Healthcare API Gateway" \
      org.opencontainers.image.description="API Gateway microservice - 2025 Optimized" \
      org.opencontainers.image.vendor="Healthcare" \
      org.opencontainers.image.version="1.0.0"

WORKDIR /workspace/app

# Install build dependencies in single layer
RUN apk add --no-cache --virtual .build-deps bash && \
    rm -rf /var/cache/apk/*

# Copy Gradle files (least frequently changing)
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
RUN chmod +x gradlew

# Pre-download Gradle wrapper with cache
RUN --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew --version || true

# Copy service build file and download dependencies (cached layer)
COPY api-gateway/build.gradle api-gateway/
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :api-gateway:dependencies --no-daemon || true

# Copy source code (most frequently changing)
COPY api-gateway/src api-gateway/src

# Optimized Gradle build with 2025 best practices
ENV GRADLE_OPTS="-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+UseG1GC \
    -Dorg.gradle.caching=true \
    -Dorg.gradle.parallel=true \
    -Dorg.gradle.configureondemand=true \
    -Dorg.gradle.daemon=false \
    -Dorg.gradle.workers.max=4"

RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :api-gateway:build -x test --no-daemon --build-cache --parallel && \
    find api-gateway/build/libs -name "*.jar" -not -name "*-plain.jar" | head -1 | xargs -I {} cp {} app.jar || \
    (echo "Error: JAR not found" && ls -la api-gateway/build/libs/ && exit 1)

# Runtime stage - distroless for minimal attack surface
FROM gcr.io/distroless/java21-debian12:nonroot

LABEL org.opencontainers.image.title="Healthcare API Gateway Runtime" \
      org.opencontainers.image.description="Optimized runtime for API Gateway"

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /workspace/app/app.jar app.jar

# JVM optimizations for containers (2025 best practices)
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UseStringDeduplication \
    -XX:+OptimizeStringConcat \
    -XX:+ExitOnOutOfMemoryError \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/tmp/heapdump.hprof \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.backgroundpreinitializer.ignore=true \
    -Djava.awt.headless=true"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["/busybox/sh", "-c", "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"]

USER nonroot:nonroot

ENTRYPOINT ["java", "-jar", "app.jar"]
