FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

COPY build.gradle settings.gradle* ./
COPY gradlew ./
COPY gradle gradle
RUN chmod +x ./gradlew

RUN --mount=type=cache,target=/root/.gradle/wrapper     ./gradlew --version || true

COPY room-service/build.gradle room-service/

RUN --mount=type=cache,target=/root/.gradle/caches     --mount=type=cache,target=/root/.gradle/wrapper     ./gradlew :room-service:dependencies --no-daemon || true

COPY room-service/src room-service/src

ENV GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=512m -Dorg.gradle.caching=true -Dorg.gradle.parallel=true -Dorg.gradle.configureondemand=true"
RUN --mount=type=cache,target=/root/.gradle/caches     --mount=type=cache,target=/root/.gradle/wrapper     ./gradlew :room-service:build -x test --no-daemon --build-cache --parallel

FROM gcr.io/distroless/java21-debian12:nonroot
ARG JAR_FILE=room-service/build/libs/*.jar
COPY --from=build /workspace/app/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app.jar"]
