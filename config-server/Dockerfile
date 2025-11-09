FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /workspace/app
COPY build.gradle settings.gradle* ./
COPY gradlew ./
COPY gradle gradle
RUN chmod +x ./gradlew
COPY . .
ENV GRADLE_OPTS="-Xmx512m -XX:MaxMetaspaceSize=256m"
RUN ./gradlew :config-server:build -x test --no-daemon --max-workers=1

FROM eclipse-temurin:17-jre-jammy
VOLUME /tmp
ARG JAR_FILE=config-server/build/libs/*.jar
COPY --from=build /workspace/app/${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
