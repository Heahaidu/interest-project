AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
service_name=$(basename "$(pwd)")

docker build -t $service_name .
docker tag $service_name $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-$service_name
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/interest-$service_name