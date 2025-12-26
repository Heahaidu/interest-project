AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

docker build -t event-service .
docker tag event-service $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-event-service
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-event-service