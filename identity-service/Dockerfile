# syntax=docker/dockerfile:1.6
FROM eclipse-temurin:21-jdk-alpine3.19 AS builder

LABEL org.opencontainers.image.title="Healthcare Identity Service" \
      org.opencontainers.image.description="Identity and authentication microservice - 2025 Optimized"

WORKDIR /workspace/app

RUN apk add --no-cache --virtual .build-deps bash && \
    rm -rf /var/cache/apk/*

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
RUN chmod +x gradlew

RUN --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew --version || true

COPY identity-service/build.gradle identity-service/
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :identity-service:dependencies --no-daemon || true

COPY identity-service/src identity-service/src

ENV GRADLE_OPTS="-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+UseG1GC \
    -Dorg.gradle.caching=true \
    -Dorg.gradle.parallel=true \
    -Dorg.gradle.configureondemand=true \
    -Dorg.gradle.daemon=false \
    -Dorg.gradle.workers.max=4"

RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :identity-service:build -x test --no-daemon --build-cache --parallel && \
    find identity-service/build/libs -name "*.jar" -not -name "*-plain.jar" | head -1 | xargs -I {} cp {} app.jar || \
    (echo "Error: JAR not found" && ls -la identity-service/build/libs/ && exit 1)

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

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["/busybox/sh", "-c", "wget --no-verbose --tries=1 --spider http://localhost:8001/actuator/health || exit 1"]

USER nonroot:nonroot

ENTRYPOINT ["java", "-jar", "app.jar"]
