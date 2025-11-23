FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

COPY build.gradle settings.gradle* ./
COPY gradlew ./
COPY gradle gradle
RUN chmod +x ./gradlew

COPY equipment-service/build.gradle equipment-service/
RUN ./gradlew :equipment-service:dependencies --no-daemon || true

COPY equipment-service/src equipment-service/src
ENV GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=512m -Dorg.gradle.caching=true -Dorg.gradle.parallel=true"
RUN --mount=type=cache,target=/root/.gradle/caches \
    --mount=type=cache,target=/root/.gradle/wrapper \
    ./gradlew :equipment-service:build -x test --no-daemon --build-cache --parallel

FROM gcr.io/distroless/java21-debian12:nonroot
ARG JAR_FILE=equipment-service/build/libs/*.jar
COPY --from=build /workspace/app/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "/app.jar"]
