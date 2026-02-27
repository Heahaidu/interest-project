AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

docker build -t notification-service .
docker tag notification-service $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-notification-service
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-notification-service