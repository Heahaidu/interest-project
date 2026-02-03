# Deployment Architecture & CI/CD (AWS)

![Architecture](/images/Solution-Architecture.jpg)

## Overview

This document describes how the system is packaged, deployed, and delivered from development to AWS.  
The main focus is **CI/CD automation**, with supporting notes on architecture, networking, and security.

The platform deploys the following components:

- **Frontend**: Next.js static export hosted on **S3** and served via **CloudFront**
- **Backend**: Spring Boot microservices running on **ECS Fargate**
- **Ingress**: **API Gateway (HTTP API)** integrated to **ALB** through **VPC Link**
- **Database**: **RDS PostgreSQL** in **private subnets**
- **Internal services**: **Redis** and **Kafka** running on ECS, discovered via **Cloud Map (internal DNS)**
- **Observability**: **CloudWatch Logs** (plus service health checks/metrics)

---

## System Architecture

> Replace the image path with your actual file location.

![Architecture Diagram](./docs/images/architecture.png)

### Key design decisions

- **Container-first**: Each backend service is built and shipped as a Docker image.
- **Service isolation**: Each microservice runs as an independent ECS Service with its own scaling and health checks.
- **Private-by-default**: Datastores (RDS) and internal components are deployed into private subnets.
- **Centralized ingress**: External traffic enters through API Gateway → VPC Link → ALB → ECS services.
- **Internal discovery**: Redis/Kafka are reachable internally using Cloud Map DNS names.
- **Standardized infrastructure**: Infrastructure is managed through **CloudFormation** to ensure repeatability.

---

## CI/CD Goals

The CI/CD pipeline is designed to:

- Build and publish **versioned Docker images** for each service
- Deploy reliably to ECS using **immutable artifacts**
- Minimize manual steps through **GitHub Actions**
- Use **GitHub OIDC → AWS IAM** (no long-lived AWS access keys in GitHub)
- Enable safe rollouts with health checks and quick rollback paths
- Provide traceability: *commit → build → image tag → deployment*

---

## CI/CD Architecture (High Level)

### Delivery flow

1. Developer pushes code to GitHub (PR or main branch).
2. GitHub Actions runs:
   - unit tests / lint (recommended)
   - builds artifacts (frontend + backend containers)
3. GitHub Actions authenticates to AWS via **OIDC** and assumes an IAM role.
4. Pipeline publishes:
   - Backend images to **ECR**
   - Frontend static build to **S3** (+ CloudFront invalidation if needed)
5. Pipeline updates ECS:
   - registers a new Task Definition revision
   - updates ECS Service (rolling deployment)
6. Post-deploy checks:
   - ECS service stability
   - health checks via ALB target groups
   - logs and alarms via CloudWatch

---

## GitHub Actions Workflows

> Adapt workflow names and triggers to match your repository strategy (mono-repo/multi-repo).

### Backend Microservices → ECS Fargate

**Triggers**
- `push` to `main` (deploy to production)
- `push` to `develop` (deploy to staging) *(optional)*
- `pull_request` (build & test only)

**Typical stages**
- Checkout source
- Set up JDK and dependency cache (Gradle/Maven)
- Run tests
- Build Docker image
- Authenticate to AWS via OIDC
- Login to ECR
- Push image with tags:
  - `sha-<GIT_SHA>` (immutable, recommended)
  - optionally `env-latest` (mutable; avoid as the only deploy tag)
- Render ECS task definition with the new image tag
- Deploy ECS service update
- Wait for service stability and report result

**Recommended image tagging strategy**
- Primary: `sha-<short_sha>` (immutable)
- Optional: `release-<version>` for releases
- Avoid deploying purely from `latest` to keep deployments reproducible.

---

### Frontend (Next.js Static) → S3 + CloudFront

**Triggers**
- `push` to `main` (deploy)
- `pull_request` (build only)

**Typical stages**
- Install dependencies
- Build static output (e.g., `next build && next export`, or your chosen setup)
- Upload artifacts to S3 (e.g., `aws s3 sync`)
- Invalidate CloudFront paths (e.g., `/*`) when necessary

**Caching note**
- Use long cache headers for hashed assets.
- Use shorter TTL (or invalidation) for `index.html` and route manifests.

---

## AWS Authentication (GitHub OIDC)

CI/CD uses **GitHub Actions OpenID Connect** to assume an AWS role.

### Components

- **IAM OIDC Provider**: `token.actions.githubusercontent.com`
- **IAM Role**:
  - Trust policy restricted to your GitHub org/repo and branch/environment
  - Permission policies for ECR, ECS, S3, CloudFront, and CloudFormation (as required)

### Benefits

- No AWS access keys stored in GitHub Secrets
- Least-privilege access per repository/environment
- Rotations handled automatically by OIDC

---

## Deployment Strategy on ECS

### Rolling deployments

- ECS Service performs rolling updates when a new task definition revision is deployed.
- ALB target group health checks ensure tasks are healthy before traffic is fully shifted.

### Health checks

- Each service should expose a health endpoint (e.g., `/actuator/health` for Spring Boot).
- ALB health check path should align with that endpoint.
- Use conservative thresholds to reduce flapping.

### Rollback approach

- Re-deploy the previous ECS task definition revision (fast rollback).
- Tie alarms to deployment signals (e.g., increased 5xx, unhealthy targets).

---

## Observability in CI/CD

During and after deployments, use:

- **CloudWatch Logs**: per-service log groups
- **ECS events**: deployment state transitions
- **ALB target health**: immediate health validation
- *(Optional)* CloudWatch alarms/notifications (SNS/Slack) for:
  - `UnHealthyHostCount > 0`
  - 5xx spikes
  - CPU/Memory saturation

---

## Infrastructure as Code (CloudFormation)

CloudFormation defines and versions:

- VPC, subnets, route tables, security groups
- ECS cluster, task definitions, services, auto scaling
- ALB listeners and path-based routing rules
- API Gateway HTTP API + VPC Link integration to ALB
- RDS PostgreSQL instance(s)
- Cloud Map namespace/services for internal DNS
- CloudWatch log groups and retention policies
- S3 buckets + CloudFront distribution for frontend

**Recommended practice**
- Split stacks by domain (networking / data / compute / edge) to reduce blast radius and speed up updates.

---

## Required Secrets & Configuration

**Recommended sources**
- GitHub Secrets for non-AWS items (if any)
- AWS Systems Manager Parameter Store / Secrets Manager for runtime secrets (DB credentials, JWT secrets, etc.)

**Do not store**
- Database credentials in the repository
- Long-lived AWS access keys

---

## Outputs

After successful provisioning + CI/CD:

- Docker images per microservice in **ECR**
- ECS Cluster / Task Definitions / Services with rolling deployments
- ALB routing rules per service path
- API Gateway endpoint backed by ALB through VPC Link
- RDS PostgreSQL endpoints in private subnets
- CloudFront domain for frontend + S3 buckets for static assets/media
- Centralized logs and deployment visibility in CloudWatch

---

## Appendix: CI/CD Checklist

- [ ] GitHub OIDC provider created in AWS
- [ ] IAM role trust policy restricted to repo + branch/environment
- [ ] Least-privilege permissions for ECR/ECS/S3/CloudFront
- [ ] ECR repositories exist for each service
- [ ] ECS services reference ALB target groups and correct health check paths
- [ ] Pipeline deploys immutable image tags
- [ ] CloudWatch log groups and retention configured
- [ ] Rollback procedure documented (previous task revision)
