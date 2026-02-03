# Architecture, Infrastructure as Code (IaC) & CI/CD

This repository contains:
- A **Next.js frontend** deployed as a static website to **S3 + CloudFront**
- Four **Spring Boot microservices** deployed to **ECS Fargate**
  - `user-service`
  - `chatbot-service`
  - `event-service`
  - `notification-service`
- Supporting infrastructure provisioned via **AWS CloudFormation (JSON template)**
- Automated delivery via **GitHub Actions** using **AWS IAM OIDC**

---

## 1) System Architecture

![System Architecture](./docs/images/architecture.jpg)

### Components

| Layer | Technology | AWS Services |
|-------|-----------|--------------|
| **Frontend** | Next.js (Static Export) | S3, CloudFront |
| **Backend** | Spring Boot (Docker) | ECS Fargate, ALB |
| **API Gateway** | HTTP API | API Gateway, VPC Link |
| **Data** | PostgreSQL, Redis, Kafka | RDS, ECS (internal), Cloud Map |
| **Messaging** | Apache Kafka | ECS Fargate (internal) |
| **Caching** | Redis | ECS Fargate (internal) |
| **Observability** | Logs, Metrics | CloudWatch |

**Networking**: VPC with public subnets (ALB) and private subnets (ECS tasks, RDS). NAT Gateways provide outbound internet for private subnets.  
**Service Discovery**: AWS Cloud Map manages internal DNS (`*.local` namespace) for Redis and Kafka.  
**Security**: IAM OIDC for CI/CD authentication; Security Groups enforce least-privilege network access between layers.  
**Infrastructure**: Single CloudFormation template provisions all resources with parameterized configuration.

---

## 2) Infrastructure as Code (CloudFormation)

**Template:** [`infra.json`](./infra.json) (all-in-one stack)

The CloudFormation template provisions networking, compute, data, edge delivery, and CI/CD IAM integration.

### 2.1 Networking (VPC)

- 1 VPC (`10.0.0.0/16`)
- 2 public subnets (ALB, NAT Gateways)
- 2 private subnets (ECS tasks, RDS)
- Internet Gateway + public route table
- 2 NAT Gateways (one per AZ) + private route tables

### 2.2 Container Registry (ECR)

Creates four ECR repositories (one per service):

- `${ProjectName}-${ServiceAName}-images`
- `${ProjectName}-${ServiceBName}-images`
- `${ProjectName}-${ServiceCName}-images`
- `${ProjectName}-${ServiceDName}-images`

Template options:
- `ScanOnPush`: enable/disable ECR scan on push
- `ImageTagMutability`: `MUTABLE` or `IMMUTABLE`

### 2.3 Compute (ECS Fargate)

- ECS Cluster: `${ProjectName}-cluster`
- ECS Task Execution Role: `${ProjectName}-ecs-exec-role`
- ECS Task Role: `${ProjectName}-ecs-task-role`  
  - includes permissions to upload objects to the **Images S3 bucket** (for services that need it)

Each microservice has:
- a **TaskDefinition** with container name `app`
- an **ECS Service** in private subnets with `AssignPublicIp: DISABLED`
- logs shipped to CloudWatch Logs with stream prefix `service-<name>`

### 2.4 Bootstrap Mode (First deployment support)

The template includes a `BootstrapMode` mechanism to avoid “ECS cannot pull image” problems during initial provisioning.

- When `BootstrapMode = true`:
  - Task definitions use a public image: `BootstrapImage`
  - This lets ECS services start successfully before private ECR images exist.

- When `BootstrapMode = false`:
  - Task definitions use ECR images:
    - `${AccountId}.dkr.ecr.${EcrRegion}.amazonaws.com/${ProjectName}-${ServiceName}-images:${ImageTag}`

Parameters involved:
- `BootstrapMode` (`true`/`false`)
- `BootstrapImage` (public image reference)
- `EcrRegion` (region where ECR repos exist)
- `ImageTag` (tag to deploy)

### 2.5 Load Balancing (ALB) + Routing Rules

- Internet-facing **ALB**
- HTTP listener on port 80
- 4 target groups (A/B/C/D), each with:
  - `TargetType: ip` (required for Fargate)
  - health check path: `HealthCheckPath` (default: `/actuator/health/liveness`)

Listener rules route by path patterns:
- `ServiceAPaths` → TargetGroupA
- `ServiceBPaths` → TargetGroupB
- `ServiceCPaths` → TargetGroupC
- `ServiceDPaths` → TargetGroupD

### 2.6 API Gateway (HTTP API) → VPC Link → ALB

- HTTP API with `$default` stage (AutoDeploy enabled)
- VPC Link placed in **private subnets**
- Integration type: `HTTP_PROXY` to the ALB listener
- Route: `ANY /{proxy+}` forwards all paths to ALB (ALB rules then route to services)

### 2.7 Databases (RDS PostgreSQL)

- 3 RDS instances: `Db1`, `Db2`, `Db3`
- Private subnet group (private subnets)
- DB Security Group allows inbound from ECS tasks SG on `DbPort` (default 5432)

Service-to-DB mapping in the template:
- Service A → `Db1`
- Service B → `Db2`
- Service C → `Db2` (shared with Service B)
- Service D → `Db3`

### 2.8 Internal Services: Redis + Kafka + Service Discovery

- Private DNS namespace: `${ProjectName}.local`
- Cloud Map services:
  - `redis` → `redis.${ProjectName}.local`
  - `kafka` → `kafka.${ProjectName}.local`
- Redis ECS service and Kafka ECS service run in private subnets with SG rules allowing traffic from ECS tasks.

### 2.9 Static Website Hosting (S3 + CloudFront)

- Web bucket: `${WebBucketName}-${AccountId}` with public access blocked
- CloudFront distribution:
  - Origin: Web bucket via **Origin Access Control (OAC)**
  - Default root object: `index.html`
  - SPA error responses: 403/404 → 200 `/index.html`

Also included:
- Images bucket: `${ImagesBucketName}-${AccountId}`
  - CORS enabled
  - bucket policy allows public read (`s3:GetObject`) *(note: review this for production use)*

### 2.10 Auto Scaling (ECS Services)

- Application Auto Scaling target tracking on **ECSServiceAverageCPUUtilization**
- Configurable:
  - `AutoScaleMin`, `AutoScaleMax`, `AutoScaleCpuTarget`

### 2.11 CloudFormation Outputs (selected)

- `HttpApiEndpoint`
- `CloudFrontDomain`, `CloudFrontDistributionId`
- `GitHubDeployRoleArn`
- ECS cluster/service names
- ECR repository names

---

## 3) CI/CD (GitHub Actions + AWS OIDC)

CI/CD is implemented using GitHub Actions. Workflows assume an AWS IAM role via OIDC.

### 3.1 Authentication (OIDC)

All workflows include:

```yaml
permissions:
  id-token: write
  contents: read
```

and configure AWS credentials via:

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ${{ vars.AWS_REGION }}
```

The CloudFormation template provisions:
- `GitHubOidcProvider` (token.actions.githubusercontent.com)
- `GitHubDeployRole` with policies for:
  - ECR push/pull
  - ECS deploy (describe/register/update)
  - S3 sync for frontend
  - CloudFront invalidation
  - `iam:PassRole` for ECS execution/task roles

Trust policy is restricted to:
- `repo:<GitHubOrg>/<GitHubRepo>:ref:refs/heads/<GitHubBranch>`

---

## 4) Backend CI/CD (Microservices)

### Services

- `user-service`
- `chatbot-service`
- `event-service`
- `notification-service`

### Trigger pattern (same for all services)

Each service has a workflow that runs on push to `main` and filters by path:

```yaml
on:
  push:
    branches: ["main"]
    paths:
      - "<service-folder>/**"
      - ".github/workflows/deploy-<service>.yml"
```

### Pipeline behavior (standardized)

**Job: Build & Push**
- Build Docker image from the service folder
- Push to ECR
- Tag uses commit SHA: `${GITHUB_SHA}`
- Exports the full `image` URI to the deploy job

**Job: Deploy**
- Reads the current ECS task definition from the running service
- Renders a new task definition revision with the updated image
- Updates ECS service and waits for stability

Common environment variables used in service workflows:
- `ECS_CLUSTER = <PROJECT_NAME>-cluster`
- `ECS_SERVICE = <PROJECT_NAME>-service-<SERVICE_D_NAME>`
- `ECR_REPOSITORY = <PROJECT_NAME>-<SERVICE_D_NAME>-images`
- `CONTAINER_NAME = app`

---

## 5) Frontend CI/CD (Next.js Static Website)

**Workflow:** [`.github/workflows/deploy-web-app.yml`](.github/workflows/deploy-web-app.yml)

### Triggers

- Push to `main` on changes under `front-end/**`
- Manual trigger via `workflow_dispatch`

### Pipeline behavior

- Install dependencies (`npm ci`)
- Build Next.js static output
- Sync `front-end/out` to S3 bucket (`aws s3 sync --delete`)
- Invalidate CloudFront (`/*`) if `CLOUDFRONT_DIST_ID` is set

---

## 6) Workflow Files

- Microservices
  - [`.github/workflows/deploy-user-service.yml`](.github/workflows/deploy-user-service.yml)
  - [`.github/workflows/deploy-chatbot-service.yml`](.github/workflows/deploy-chatbot-service.yml)
  - [`.github/workflows/deploy-event-service.yml`](.github/workflows/deploy-event-service.yml)
  - [`.github/workflows/deploy-notification-service.yml`](.github/workflows/deploy-notification-service.yml)

- Frontend
  - [`.github/workflows/deploy-web-app.yml`](.github/workflows/deploy-web-app.yml)

---

## 7) Deployment Notes

- **Initial infrastructure provisioning** can use `BootstrapMode=true` so ECS services start without requiring ECR images to exist.
- After images are pushed by CI, update the stack with `BootstrapMode=false` and set `ImageTag` (or keep using workflow-driven task definition updates).
- Backend health checks are configured via `HealthCheckPath` (default: `/actuator/health/liveness`).