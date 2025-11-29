# syntax=docker/dockerfile:1.6
FROM eclipse-temurin:21-jdk-alpine AS builder

LABEL org.opencontainers.image.title="Healthcare Config Server" \
      org.opencontainers.image.description="Configuration server - 2025 Optimized"

WORKDIR /workspace/app

RUN apk add --no-cache --virtual .build-deps bash && \
    rm -rf /var/cache/apk/*

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
RUN chmod +x gradlew

RUN --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew --version || true

COPY config-server/build.gradle config-server/
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :config-server:dependencies --no-daemon || true

COPY config-server/src config-server/src

ENV GRADLE_OPTS="-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+UseG1GC \
    -Dorg.gradle.caching=true \
    -Dorg.gradle.parallel=true \
    -Dorg.gradle.configureondemand=true \
    -Dorg.gradle.daemon=false \
    -Dorg.gradle.workers.max=4"

RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :config-server:build -x test --no-daemon --build-cache --parallel && \
    find config-server/build/libs -name "*.jar" -not -name "*-plain.jar" | head -1 | xargs -I {} cp {} app.jar || \
    (echo "Error: JAR not found" && ls -la config-server/build/libs/ && exit 1)

FROM gcr.io/distroless/java21-debian12:nonroot

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /workspace/app/app.jar app.jar

ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UseStringDeduplication \
    -XX:+ExitOnOutOfMemoryError \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.backgroundpreinitializer.ignore=true"

EXPOSE 8888

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["/busybox/sh", "-c", "wget --no-verbose --tries=1 --spider http://localhost:8888/actuator/health || exit 1"]

USER nonroot:nonroot

ENTRYPOINT ["java", "-jar", "app.jar"]
