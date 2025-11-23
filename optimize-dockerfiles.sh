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
    
    cat > "$dockerfile" << EOF
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

COPY build.gradle settings.gradle* ./
COPY gradlew ./
COPY gradle gradle
RUN chmod +x ./gradlew

RUN --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew --version || true

COPY ${service}/build.gradle ${service}/

RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :${service}:dependencies --no-daemon || true

COPY ${service}/src ${service}/src

ENV GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=512m -Dorg.gradle.caching=true -Dorg.gradle.parallel=true -Dorg.gradle.configureondemand=true"
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :${service}:build -x test --no-daemon --build-cache --parallel

FROM gcr.io/distroless/java21-debian12:nonroot
ARG JAR_FILE=${service}/build/libs/*.jar
COPY --from=build /workspace/app/\${JAR_FILE} app.jar
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app.jar"]
EOF
    
    echo "Optimized: $dockerfile"
done

echo "All Dockerfiles optimized!"

