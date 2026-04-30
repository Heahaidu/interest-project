# Stage 1: Download dependencies
FROM eclipse-temurin:21-jdk-alpine AS dependencies
RUN apk add --no-cache maven
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

# Stage 2: Build jar
FROM dependencies AS builder
COPY src ./src
RUN mvn package -DskipTests

# Stage 3: Create custom JRE by jlink
FROM eclipse-temurin:21-jdk-alpine AS jre-builder

# Copy jar for jdeps to analyze required modules
COPY --from=builder /app/target/*.jar app.jar

RUN apk add --no-cache binutils && \
    # Extract jar so jdeps can read it
    mkdir extracted && \
    cd extracted && \
    jar xf ../app.jar && \
    cd .. && \
    # Analyze required modules
    jdeps \
      --ignore-missing-deps \
      --print-module-deps \
      --multi-release 21 \
      --recursive \
      --class-path "extracted/BOOT-INF/lib/*" \
      app.jar > modules.txt && \
    # Build custom JRE with only the required modules
    jlink \
      --add-modules "$(cat modules.txt)" \
      --strip-debug \
      --no-man-pages \
      --no-header-files \
      --compress=2 \
      --output /custom-jre

# Stage 4: Runtime image
FROM alpine:3.21 AS runtime

# Copy custom JRE instead of using full eclipse-temurin
COPY --from=jre-builder /custom-jre /opt/jre

ENV PATH="/opt/jre/bin:${PATH}" \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]