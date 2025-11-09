FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /workspace/app
COPY build.gradle settings.gradle* ./
COPY gradlew ./
COPY gradle gradle
RUN chmod +x ./gradlew
COPY . .
ENV GRADLE_OPTS="-Xmx512m -XX:MaxMetaspaceSize=256m"
RUN ./gradlew :doctor-service:build -x test --no-daemon --max-workers=1

FROM eclipse-temurin:17-jre-jammy
VOLUME /tmp
COPY --from=build /workspace/app/doctor-service/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
