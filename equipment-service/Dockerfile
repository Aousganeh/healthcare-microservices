# syntax=docker/dockerfile:1.4
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace/app

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
RUN chmod +x gradlew

RUN --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew --version || true

COPY equipment-service/build.gradle equipment-service/
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :equipment-service:dependencies --no-daemon || true

COPY equipment-service/src equipment-service/src

ENV GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=512m -Dorg.gradle.caching=true -Dorg.gradle.parallel=true -Dorg.gradle.configureondemand=true"
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :equipment-service:build -x test --no-daemon --build-cache --parallel
RUN find equipment-service/build/libs -name "*.jar" -not -name "*-plain.jar" | head -1 | xargs -I {} cp {} app.jar || \
    (echo "Error: JAR file not found in equipment-service/build/libs" && ls -la equipment-service/build/libs/ && exit 1)

FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=builder /workspace/app/app.jar app.jar
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
