FROM jenkins/jenkins:lts-alpine
USER root

# alpine only
RUN apk add --no-cache curl unzip docker-cli aws-cli

# Full version
# RUN apt-get update && apt-get install -y curl \
#     unzip \
#     lsb-release \
#     && rm -rf /var/lib/apt/lists/*

# RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
#     && unzip awscliv2.zip \
#     && ./aws/install \
#     && rm -rf awscliv2.zip aws/

RUN addgroup jenkins docker || true

USER jenkins

RUN jenkins-plugin-cli --plugins "json-path-api blueocean docker-workflow aws-credentials pipeline-aws"