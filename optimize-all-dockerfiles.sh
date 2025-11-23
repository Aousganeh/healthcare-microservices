#!/bin/bash

set -e

SERVICES=(
    "api-gateway"
    "service-discovery"
    "config-server"
    "identity-service"
    "patient-service"
    "doctor-service"
    "appointment-service"
    "billing-service"
    "room-service"
    "equipment-service"
    "notification-service"
)

for service in "${SERVICES[@]}"; do
    dockerfile="${service}/Dockerfile"
    
    if [ ! -f "$dockerfile" ]; then
        echo "Skipping $dockerfile (not found)"
        continue
    fi
    
    cat > "$dockerfile" << 'EOFDOCKER'
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace/app

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
RUN chmod +x gradlew

RUN --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew --version || true

COPY SERVICE_NAME/build.gradle SERVICE_NAME/
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :SERVICE_NAME:dependencies --no-daemon || true

COPY SERVICE_NAME/src SERVICE_NAME/src

ENV GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=512m -Dorg.gradle.caching=true -Dorg.gradle.parallel=true -Dorg.gradle.configureondemand=true"
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :SERVICE_NAME:build -x test --no-daemon --build-cache --parallel && \
    find SERVICE_NAME/build/libs -name "*.jar" -not -name "*-plain.jar" -exec cp {} app.jar \;

FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=builder /workspace/app/app.jar app.jar
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
EOFDOCKER
    
    sed -i.bak "s/SERVICE_NAME/${service}/g" "$dockerfile"
    rm -f "${dockerfile}.bak"
    
    echo "Optimized: $dockerfile"
done

echo "All Dockerfiles optimized with industry best practices!"

