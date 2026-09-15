FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=builder --chown=spring:spring /app/target/course-0.0.1-SNAPSHOT.jar app.jar
USER spring
EXPOSE 3001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
