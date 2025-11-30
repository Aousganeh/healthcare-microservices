# syntax=docker/dockerfile:1.6
# Minimal stage to find and prepare the JAR
FROM alpine:latest AS jar-selector

ARG JAR_PATH=jars/

WORKDIR /jars

# Copy all JARs
COPY ${JAR_PATH}*.jar ./

# Find the non-plain JAR and rename it
RUN find . -name "*.jar" -not -name "*-plain.jar" | head -1 | xargs -I {} cp {} app.jar || \
    (echo "Error: JAR not found" && ls -la && exit 1)

# Runtime stage - distroless for minimal attack surface
FROM gcr.io/distroless/java21-debian12:nonroot

LABEL org.opencontainers.image.title="Healthcare API Gateway" \
      org.opencontainers.image.description="API Gateway microservice - 2025 Optimized" \
      org.opencontainers.image.vendor="Healthcare" \
      org.opencontainers.image.version="1.0.0"

WORKDIR /app

# Copy pre-built JAR from selector stage
COPY --from=jar-selector --chown=nonroot:nonroot /jars/app.jar app.jar

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
