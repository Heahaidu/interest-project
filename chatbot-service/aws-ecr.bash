AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

docker build -t chatbox-service .
docker tag chatbox-service $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-chatbot-service
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-chatbot-service