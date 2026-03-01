# Installation

## Build the Jenkins BlueOcean Docker Image
```
docker build -t jenkins .
```

## Run the Container
### MacOS / Linux
```
docker run -d \
  --name jenkins-master \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins_home:/var/jenkins_home \
  -p 8080:8080 \
  -p 50000:50000 \
  -u root \
  jenkins
```

### Windows
```
docker run -d `
  --name jenkins-master `
  --restart unless-stopped `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -v jenkins_home:/var/jenkins_home `
  -p 8080:8080 `
  -p 50000:50000 `
  -u root `
  jenkins
```

## Get the Password
```
docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword
```

## Connect to the Jenkins
```
https://localhost:8080/
```

---

# Docker Compose

## Run with Docker Compose
```
docker compose up -d
```

## Stop the Container
```
docker compose down
```

## Get the Password
```
docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword
```

## Connect to the Jenkins
```
https://localhost:8080/
```