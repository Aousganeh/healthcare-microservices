FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace/app

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle
RUN chmod +x gradlew

RUN --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew --version || true

COPY room-service/build.gradle room-service/
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :room-service:dependencies --no-daemon || true

COPY room-service/src room-service/src

ENV GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=512m -Dorg.gradle.caching=true -Dorg.gradle.parallel=true -Dorg.gradle.configureondemand=true"
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :room-service:build -x test --no-daemon --build-cache --parallel && \
    find room-service/build/libs -name "*.jar" -not -name "*-plain.jar" -exec cp {} app.jar \;

FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=builder /workspace/app/app.jar app.jar
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
