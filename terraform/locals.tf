locals {
  vpc_name              = "${var.project_name}-VPC"
  public_subnet_1_name  = "${var.project_name}-public-a"
  public_subnet_2_name  = "${var.project_name}-public-b"
  private_subnet_1_name = "${var.project_name}-private-a"
  private_subnet_2_name = "${var.project_name}-private-b"
  public_rt_name = "${var.project_name}-public-rt"
  iwg_name = "${var.project_name}-igw"
  s3_images_name = "${var.project_name}-s3-images"
  s3_web_name = "${var.project_name}-s3-web"
  alb_name = "${var.project_name}-alb"
  ecs_name = "${var.project_name}-cluster"
  ecs_exec_role_name = "${var.project_name}-ecs-exec-role"
  cloudwatch_log_group_name = "/ecs/${var.project_name}"
  a_container_registry = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.project_name}-${var.service_a.name}-images:latest"
  b_container_registry = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.project_name}-${var.service_b.name}-images:latest"
  c_container_registry = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.project_name}-${var.service_c.name}-images:latest"
  d_container_registry = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.project_name}-${var.service_d.name}-images:latest"
}

data "aws_caller_identity" "current" {
  
}