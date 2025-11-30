# syntax=docker/dockerfile:1.6
# Minimal stage to find and prepare the JAR
FROM busybox:latest AS jar-selector

ARG JAR_PATH=jars

WORKDIR /jars

# Copy all JARs
COPY ${JAR_PATH}/*.jar ./

# Find the non-plain JAR and rename it
RUN find . -name "*.jar" -not -name "*-plain.jar" | head -1 | xargs -I {} cp {} app.jar || \
    (echo "Error: JAR not found" && ls -la && exit 1)

# Runtime stage
FROM gcr.io/distroless/java21-debian12:nonroot

LABEL org.opencontainers.image.title="Healthcare Doctor Service" \
      org.opencontainers.image.description="Doctor management microservice - 2025 Optimized"

WORKDIR /app

# Copy pre-built JAR from selector stage
COPY --from=jar-selector --chown=nonroot:nonroot /jars/app.jar app.jar

ENV JAVA_TOOL_OPTIONS=" \
    -Xshare:auto \
    -XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UseStringDeduplication \
    -XX:+ExitOnOutOfMemoryError \
    -Dspring.backgroundpreinitializer.ignore=true"

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["curl", "-f", "http://localhost:8003/actuator/health"]

USER nonroot:nonroot

ENTRYPOINT ["java", "-jar", "app.jar"]
