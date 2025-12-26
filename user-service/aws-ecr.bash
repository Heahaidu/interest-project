AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

docker build -t user-service .
docker tag user-service $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-user-service
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-user-service