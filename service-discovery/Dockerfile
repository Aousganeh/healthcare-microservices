# syntax=docker/dockerfile:1.4
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

# Copy Gradle files first for better layer caching
COPY build.gradle settings.gradle* ./
COPY gradlew ./
COPY gradle gradle
RUN chmod +x ./gradlew

# Copy service-specific build file
COPY service-discovery/build.gradle service-discovery/

# Download dependencies (cached layer if build.gradle doesn't change)
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :service-discovery:dependencies --no-daemon || true

# Copy source code (changes most frequently)
COPY service-discovery/src service-discovery/src

# Build application
ENV GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=512m -Dorg.gradle.caching=true -Dorg.gradle.parallel=true -Dorg.gradle.configureondemand=true"
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :service-discovery:build -x test --no-daemon --build-cache --parallel

FROM gcr.io/distroless/java21-debian12:nonroot
ARG JAR_FILE=service-discovery/build/libs/*.jar
COPY --from=build /workspace/app/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app.jar"]
