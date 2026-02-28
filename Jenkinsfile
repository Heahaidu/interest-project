pipeline {
    agent any
    environment {
        AWS_REGION = 'us-east-1'
        ECR_REGISTRY = '852368830719.dkr.ecr.us-east-1.amazonaws.com'
        PROJECT_NAME = 'interest-project'
        ECS_CLUSTER = 'interest-project-cluster'
    }
    tools {
        maven "M3"
    }

    stages {
        // user-service
        stage('Build & Push: user-service') {
            when {
                anyOf {
                    changeset 'services/user-service/**'
                }     
            }
            steps {
                script {
                    buildAndPush('user-service', 'services/user-service')
                }
            }
        }
        stage('Deploy: user-service') {
            when {
                changeset 'services/user-service/**'
            }
            steps {
                script {
                    deployECS('user-service')
                }
            }
        }
        // event-service
        stage('Build & Push: event-service') {
            when {
                anyOf {
                    changeset 'services/event-service/**'
                }     
            }
            steps {
                script {
                    buildAndPush('event-service', 'services/event-service')
                }
            }
        }
        stage('Deploy: event-service') {
            when {
                changeset 'services/event-service/**'
            }
            steps {
                script {
                    deployECS('event-service')
                }
            }
        }
        // chatbot-service
        stage('Build & Push: chatbot-service') {
            when {
                anyOf {
                    changeset 'services/chatbot-service/**'
                }     
            }
            steps {
                script {
                    buildAndPush('chatbot-service', 'services/chatbot-service')
                }
            }
        }
        stage('Deploy: chatbot-service') {
            when {
                changeset 'services/chatbot-service/**'
            }
            steps {
                script {
                    deployECS('chatbot-service')
                }
            }
        }
        // notification-service
        stage('Build & Push: notification-service') {
            when {
                anyOf {
                    changeset 'services/notification-service/**'
                }     
            }
            steps {
                script {
                    buildAndPush('notification-service', 'services/notification-service')
                }
            }
        }
        stage('Deploy: notification-service') {
            when {
                changeset 'services/notification-service/**'
            }
            steps {
                script {
                    deployECS('notification-service')
                }
            }
        }
    }
}

def buildAndPush(String serviceName, String contextPath) {
    def imageTag = "${ECR_REGISTRY}/${PROJECT_NAME}/${serviceName}:${env.GIT_COMMIT[0..6]}"

    withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
        sh "aws ecr get-login-password | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
        sh "docker build -t ${imageTag} ${contextPath}"
        sh "docker push ${imageTag}"
        env["IMAGE_TAG_${serviceName.toUpperCase().replace('-','_')}"] = imageTag
    }
}

def deployECS(String serviceName) {
    def envKey   = "IMAGE_TAG_${serviceName.toUpperCase().replace('-','_')}"
    def imageTag = env[envKey]
    def taskFamily = "${serviceName}"
    def ecsService = "${serviceName}"

    withAWS(credentials: 'aws-credentials', region: env.AWS_REGION) {
        sh """
            TASK_DEF=\$(aws ecs describe-task-definition \
                --task-definition ${taskFamily} \
                --query 'taskDefinition' \
                --output json)

            NEW_TASK_DEF=\$(echo \$TASK_DEF | jq \
                --arg IMAGE "${imageTag}" \
                '.containerDefinitions[0].image = \$IMAGE
                | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

            NEW_REVISION=\$(aws ecs register-task-definition \
                --cli-input-json "\$NEW_TASK_DEF" \
                --query 'taskDefinition.taskDefinitionArn' \
                --output text)

            aws ecs update-service \
                --cluster ${ECS_CLUSTER} \
                --service ${ecsService} \
                --task-definition \$NEW_REVISION
        """
    }

    timeout(time: 10, unit: 'MINUTES') {
        sh """
            aws ecs wait services-stable \
                --cluster "${ECS_CLUSTER}" \
                --services "${serviceName}"
        """
    }
}