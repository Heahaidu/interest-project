resource "aws_vpc" "vpc" {
  tags = {
    Name = local.vpc_name
  }
  cidr_block = var.vpc_cidr
  enable_dns_hostnames = true
}

resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.public_subnet_1_cidr
  availability_zone       = var.availability_zone[0]
  map_public_ip_on_launch = true
  tags = {
    Name = local.public_subnet_1_name
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.public_subnet_2_cidr
  availability_zone       = var.availability_zone[1]
  map_public_ip_on_launch = true
  tags = {
    Name = local.public_subnet_2_name
  }
}

resource "aws_subnet" "private_subnet_1" {
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = var.private_subnet_1_cidr
  availability_zone = var.availability_zone[0]
  tags = {
    Name = local.private_subnet_1_name
  }
}

resource "aws_subnet" "private_subnet_2" {
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = var.private_subnet_2_cidr
  availability_zone = var.availability_zone[1]
  tags = {
    Name = local.private_subnet_2_name
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = local.iwg_name
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

}

resource "aws_route_table_association" "public_subnet_1_association" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_2_association" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_eip" "elastic_ip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.elastic_ip.id
  subnet_id     = aws_subnet.public_subnet_1.id
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.vpc.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }
}

resource "aws_route_table_association" "private_subnet_1_association" {
  route_table_id = aws_route_table.private_route_table.id
  subnet_id      = aws_subnet.private_subnet_1.id
}

resource "aws_route_table_association" "private_subnet_2_association" {
  route_table_id = aws_route_table.private_route_table.id
  subnet_id      = aws_subnet.private_subnet_2.id
}

resource "aws_s3_bucket" "s3_images" {
  bucket = local.s3_images_name
}

resource "aws_s3_bucket_cors_configuration" "s3_images_cors_rule" {
  bucket = aws_s3_bucket.s3_images.id
  cors_rule {
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["*"]
    allowed_headers = ["*"]
    max_age_seconds = 3000
  }

}

resource "aws_s3_bucket_public_access_block" "s3_images_acls" {
  bucket                  = aws_s3_bucket.s3_images.id
  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "s3_images_policy" {
  bucket = aws_s3_bucket.s3_images.id
  policy = data.aws_iam_policy_document.s3_images_policy_docs.json
}

data "aws_iam_policy_document" "s3_images_policy_docs" {
  statement {
    sid       = "PublicReadGetObject"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${local.s3_images_name}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket" "s3_web" {
  bucket = local.s3_web_name
}

resource "aws_s3_bucket_public_access_block" "s3_web_access" {
  bucket                  = aws_s3_bucket.s3_web.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "db_subnet_group"
  subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
}

resource "aws_security_group" "db_security_group" {
  name   = "db_security_group"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_egress_rule" "db_security_group_egress_rule" {
  security_group_id = aws_security_group.db_security_group.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_db_instance" "databases" {
  for_each = var.databases

  identifier              = each.value.identifier
  engine                  = "postgres"
  instance_class          = each.value.instance_class
  allocated_storage       = each.value.allocated_storage
  db_subnet_group_name    = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids  = [aws_security_group.db_security_group.id]
  username                = var.db_username
  password                = var.db_password
  backup_retention_period = 7
  multi_az                = false
  storage_encrypted       = true
  publicly_accessible     = false
  deletion_protection     = false
  # skip_final_snapshot     = true
}

resource "aws_security_group" "alb_security_group" {
  vpc_id = aws_vpc.vpc.id
  name   = "alb_security_group"
}

# resource "aws_vpc_security_group_ingress_rule" "alb_sg_inbound" {
#   ip_protocol       = "tcp"
#   cidr_ipv4         = "0.0.0.0/0"
#   from_port         = 80
#   to_port           = 80
#   security_group_id = aws_security_group.alb_security_group.id
# }

resource "aws_vpc_security_group_egress_rule" "alb_security_group_outbound_rule" {
  security_group_id = aws_security_group.alb_security_group.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_security_group" "ecs_security_group" {
  vpc_id = aws_vpc.vpc.id
  name   = "ecs_security_group"
}

resource "aws_vpc_security_group_ingress_rule" "ecs_sg_inbound" {
  security_group_id            = aws_security_group.ecs_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = var.container_port
  to_port                      = var.container_port
  referenced_security_group_id = aws_security_group.alb_security_group.id
}

resource "aws_vpc_security_group_egress_rule" "ecs_sg_outbound" {
  security_group_id = aws_security_group.ecs_security_group.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "dbs_sg_inbound" {
  security_group_id            = aws_security_group.db_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = var.db_port
  to_port                      = var.db_port
  referenced_security_group_id = aws_security_group.ecs_security_group.id
}

resource "aws_alb" "alb" {
  name            = local.alb_name
  internal        = true
  subnets         = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
  security_groups = [aws_security_group.alb_security_group.id]
}

resource "aws_alb_listener" "alb_listener_http" {
  load_balancer_arn = aws_alb.alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "fixed-response"
    fixed_response {
      status_code  = "404"
      content_type = "text/plain"
      message_body = "Not found"
    }
  }
}

resource "aws_alb_target_group" "alb_target_group" {
  for_each    = var.services
  name        = each.key
  vpc_id      = aws_vpc.vpc.id
  target_type = "ip"
  port        = var.container_port
  protocol    = "HTTP"
  health_check {
    path                = var.health_check_path
    timeout             = 5
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }
}

resource "aws_alb_listener_rule" "alb_listener_rule" {
  for_each     = var.services
  listener_arn = aws_alb_listener.alb_listener_http.arn
  priority     = each.value.priority
  condition {
    path_pattern {
      values = each.value.paths
    }
  }
  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.alb_target_group[each.key].arn
  }
}

resource "aws_ecs_cluster" "ecs_cluster" {
  name = local.ecs_name
}

resource "aws_iam_role" "ecs_execution_role" {
  name               = local.ecs_exec_role_name
  assume_role_policy = file("./policy/ecs_assume_role.json")
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_cloudwatch_log_group" "ecs_log" {
  name              = local.cloudwatch_log_group_name
  retention_in_days = 14
}

resource "aws_service_discovery_private_dns_namespace" "discovery_namespace" {
  name = "${var.project_name}.local"
  vpc  = aws_vpc.vpc.id
}

resource "aws_service_discovery_service" "service_discover_namespace" {
  for_each = var.cloudmap_namespace
  name     = each.key

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.discovery_namespace.id
    dns_records {
      type = "A"
      ttl  = 10
    }
    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    # failure_threshold = 1
  }
}

resource "aws_security_group" "redis_security_group" {
  name   = "redis_security_group"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "ingress_redis_security_group" {
  security_group_id            = aws_security_group.redis_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = 6379
  to_port                      = 6379
  referenced_security_group_id = aws_security_group.ecs_security_group.id
}

resource "aws_vpc_security_group_egress_rule" "outbound_redis_security_group" {
  security_group_id = aws_security_group.redis_security_group.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_security_group" "kafka_security_group" {
  name   = "kafka_security_group"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "ingress_kafka_9092" {
  security_group_id            = aws_security_group.kafka_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = 9092
  to_port                      = 9092
  referenced_security_group_id = aws_security_group.ecs_security_group.id
}

resource "aws_vpc_security_group_ingress_rule" "ingress_kafka_9093" {
  security_group_id            = aws_security_group.kafka_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = 9093
  to_port                      = 9093
  referenced_security_group_id = aws_security_group.ecs_security_group.id
}

resource "aws_vpc_security_group_egress_rule" "outbound_kafka_security_group" {
  security_group_id = aws_security_group.kafka_security_group.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_ecs_task_definition" "redis_task_definition" {
  family                   = "${var.project_name}-redis"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  container_definitions = jsonencode([
    {
      name  = "redis"
      image = "redis:7"
      portMappings = [
        {
          containerPort = 6379
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_log.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "redis"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "redis_service" {
  name            = "${var.project_name}-redis"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  launch_type     = "FARGATE"
  desired_count   = 1
  task_definition = aws_ecs_task_definition.redis_task_definition.arn

  depends_on = [
    aws_ecs_cluster.ecs_cluster,
    aws_cloudwatch_log_group.ecs_log
  ]

  network_configuration {
    assign_public_ip = false
    subnets          = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
    security_groups  = [aws_security_group.redis_security_group.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.service_discover_namespace["redis"].arn
  }
}

resource "aws_ecs_task_definition" "kafka_task_definition" {
  family                   = "${var.project_name}-kafka"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "kafka"
      image = "apache/kafka:4.0.0"
      portMappings = [
        {
          containerPort = 9092
          protocol      = "tcp"
        },
        {
          containerPort = 9093
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "KAFKA_PROCESS_ROLES", value = "broker,controller" },
        { name = "KAFKA_CONTROLLER_LISTENER_NAMES", value = "CONTROLLER" },
        { name = "KAFKA_LISTENERS", value = "PLAINTEXT://:9092,CONTROLLER://:9093" },
        { name = "KAFKA_LISTENER_SECURITY_PROTOCOL_MAP", value = "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT" },
        { name = "KAFKA_ADVERTISED_LISTENERS", value = "PLAINTEXT://kafka.${var.project_name}.local:9092" },
        { name = "KAFKA_CONTROLLER_QUORUM_VOTERS", value = "1@kafka.${var.project_name}.local:9093" },
        { name = "KAFKA_NODE_ID", value = "1" },
        { name = "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR", value = "1" },
        { name = "KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR", value = "1" },
        { name = "KAFKA_TRANSACTION_STATE_LOG_MIN_ISR", value = "1" },
        { name = "KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS", value = "0" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_log.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "kafka"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "kafka_service" {
  name            = "${var.project_name}-kafka"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  launch_type     = "FARGATE"
  desired_count   = 1
  task_definition = aws_ecs_task_definition.kafka_task_definition.arn

  depends_on = [
    aws_ecs_cluster.ecs_cluster,
    aws_cloudwatch_log_group.ecs_log
  ]

  network_configuration {
    assign_public_ip = false
    subnets = [
      aws_subnet.private_subnet_1.id,
      aws_subnet.private_subnet_2.id
    ]
    security_groups = [
      aws_security_group.kafka_security_group.id
    ]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.service_discover_namespace["kafka"].arn
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-ecs-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "ecs_task_role_policy" {
  role = aws_iam_role.ecs_task_role.id
  name = "upload_object_to_s3"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "WriteImages"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:AbortMultipartUpload",
          "s3:ListMultipartUploadParts"
        ]
        Resource = [
          "arn:aws:s3:::${local.s3_images_name}/*"
        ]
      },
      {
        Sid    = "ListImagesBucket"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:ListBucketMultipartUploads"
        ]
        Resource = [
          "arn:aws:s3:::${local.s3_images_name}"
        ]
      }
    ]
  })
}

resource "aws_ecs_task_definition" "a_task_definition" {
  family                   = var.service_a.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.service_a.cpu
  memory                   = var.service_a.memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = var.is_bootstrap_mode ? var.bootstrap_image : local.a_container_registry

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "DB_HOST"
          value = aws_db_instance.databases["db1"].address
        },
        {
          name  = "DB_PORT"
          value = tostring(var.db_port)
        },
        {
          name  = "DATA_SOURCE_URL"
          value = "jdbc:postgresql://${aws_db_instance.databases["db1"].address}:${var.db_port}/postgres"
        },
        {
          name  = "DATA_SOURCE_USERNAME"
          value = var.db_username
        },
        {
          name  = "DATA_SOURCE_PASSWORD"
          value = var.db_password
        },
        {
          name  = "AWS_BUCKET_NAME"
          value = "${local.s3_images_name}"
        },
        {
          name  = "MAIL_HOST"
          value = var.mail_host
        },
        {
          name  = "MAIL_USERNAME"
          value = var.mail_username
        },
        {
          name  = "MAIL_PASSWORD"
          value = var.mail_password
        },
        {
          name  = "REDIS_HOST"
          value = "redis.${var.project_name}.local"
        },
        {
          name  = "REDIS_PORT"
          value = "6379"
        },
        {
          name  = "KAFKA_BOOTSTRAP_SERVERS"
          value = "kafka.${var.project_name}.local:9092"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_log.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = var.service_a.name
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "b_task_definition" {
  family                   = var.service_b.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.service_b.cpu
  memory                   = var.service_b.memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = var.is_bootstrap_mode ? var.bootstrap_image : local.b_container_registry

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "DB_HOST"
          value = aws_db_instance.databases["db2"].address
        },
        {
          name  = "DB_PORT"
          value = tostring(var.db_port)
        },
        {
          name  = "DATA_SOURCE_URL"
          value = "jdbc:postgresql://${aws_db_instance.databases["db2"].address}:${var.db_port}/postgres"
        },
        {
          name  = "DATA_SOURCE_USERNAME"
          value = var.db_username
        },
        {
          name  = "DATA_SOURCE_PASSWORD"
          value = var.db_password
        },
        {
          name  = "AWS_BUCKET_NAME"
          value = local.s3_images_name
        },
        {
          name  = "MAIL_HOST"
          value = var.mail_host
        },
        {
          name  = "MAIL_USERNAME"
          value = var.mail_username
        },
        {
          name  = "MAIL_PASSWORD"
          value = var.mail_password
        },
        {
          name  = "REDIS_HOST"
          value = "redis.${var.project_name}.local"
        },
        {
          name  = "REDIS_PORT"
          value = "6379"
        },
        {
          name  = "KAFKA_BOOTSTRAP_SERVERS"
          value = "kafka.${var.project_name}.local:9092"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_log.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = var.service_b.name
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "c_task_definition" {
  family                   = var.service_c.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.service_c.cpu
  memory                   = var.service_c.memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = var.is_bootstrap_mode ? var.bootstrap_image : local.c_container_registry

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "DB_HOST"
          value = aws_db_instance.databases["db2"].address
        },
        {
          name  = "DB_PORT"
          value = tostring(var.db_port)
        },
        {
          name  = "DATA_SOURCE_URL"
          value = "jdbc:postgresql://${aws_db_instance.databases["db2"].address}:${var.db_port}/postgres"
        },
        {
          name  = "DATA_SOURCE_USERNAME"
          value = var.db_username
        },
        {
          name  = "DATA_SOURCE_PASSWORD"
          value = var.db_password
        },
        {
          name  = "AWS_BUCKET_NAME"
          value = local.s3_images_name
        },
        {
          name  = "MAIL_HOST"
          value = var.mail_host
        },
        {
          name  = "MAIL_USERNAME"
          value = var.mail_username
        },
        {
          name  = "MAIL_PASSWORD"
          value = var.mail_password
        },
        {
          name  = "REDIS_HOST"
          value = "redis.${var.project_name}.local"
        },
        {
          name  = "REDIS_PORT"
          value = "6379"
        },
        {
          name  = "KAFKA_BOOTSTRAP_SERVERS"
          value = "kafka.${var.project_name}.local:9092"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_log.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = var.service_c.name
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "d_task_definition" {
  family                   = var.service_d.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.service_d.cpu
  memory                   = var.service_d.memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = var.is_bootstrap_mode ? var.bootstrap_image : local.d_container_registry

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "DB_HOST"
          value = aws_db_instance.databases["db3"].address
        },
        {
          name  = "DB_PORT"
          value = tostring(var.db_port)
        },
        {
          name  = "DATA_SOURCE_URL"
          value = "jdbc:postgresql://${aws_db_instance.databases["db3"].address}:${var.db_port}/postgres"
        },
        {
          name  = "DATA_SOURCE_USERNAME"
          value = var.db_username
        },
        {
          name  = "DATA_SOURCE_PASSWORD"
          value = var.db_password
        },
        {
          name  = "AWS_BUCKET_NAME"
          value = local.s3_images_name
        },
        {
          name  = "MAIL_HOST"
          value = var.mail_host
        },
        {
          name  = "MAIL_USERNAME"
          value = var.mail_username
        },
        {
          name  = "MAIL_PASSWORD"
          value = var.mail_password
        },
        {
          name  = "REDIS_HOST"
          value = "redis.${var.project_name}.local"
        },
        {
          name  = "REDIS_PORT"
          value = "6379"
        },
        {
          name  = "KAFKA_BOOTSTRAP_SERVERS"
          value = "kafka.${var.project_name}.local:9092"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_log.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = var.service_d.name
        }
      }
    }
  ])
}

resource "aws_ecs_service" "service_a" {
  name            = var.service_a.name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  launch_type     = "FARGATE"
  desired_count   = var.service_a.desired_count
  task_definition = aws_ecs_task_definition.a_task_definition.arn

  depends_on = [aws_alb_listener.alb_listener_http, aws_alb_listener_rule.alb_listener_rule["user"]]

  network_configuration {
    assign_public_ip = false
    subnets          = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
    security_groups  = [aws_security_group.ecs_security_group.id]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.alb_target_group["user"].arn
    container_name   = "app"
    container_port   = var.container_port
  }
}

resource "aws_ecs_service" "service_b" {
  name            = var.service_b.name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  launch_type     = "FARGATE"
  desired_count   = var.service_b.desired_count
  task_definition = aws_ecs_task_definition.b_task_definition.arn

  depends_on = [
    aws_alb_listener.alb_listener_http,
    aws_alb_listener_rule.alb_listener_rule["notification"]
  ]

  network_configuration {
    assign_public_ip = false
    subnets          = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
    security_groups  = [aws_security_group.ecs_security_group.id]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.alb_target_group["notification"].arn
    container_name   = "app"
    container_port   = var.container_port
  }
}

resource "aws_ecs_service" "service_c" {
  name            = var.service_c.name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  launch_type     = "FARGATE"
  desired_count   = var.service_c.desired_count
  task_definition = aws_ecs_task_definition.c_task_definition.arn

  depends_on = [
    aws_alb_listener.alb_listener_http,
    aws_alb_listener_rule.alb_listener_rule["chatbot"]
  ]

  network_configuration {
    assign_public_ip = false
    subnets          = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
    security_groups  = [aws_security_group.ecs_security_group.id]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.alb_target_group["chatbot"].arn
    container_name   = "app"
    container_port   = var.container_port
  }
}

resource "aws_ecs_service" "service_d" {
  name            = var.service_d.name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  launch_type     = "FARGATE"
  desired_count   = var.service_d.desired_count
  task_definition = aws_ecs_task_definition.d_task_definition.arn

  depends_on = [
    aws_alb_listener.alb_listener_http,
    aws_alb_listener_rule.alb_listener_rule["event"]
  ]

  network_configuration {
    assign_public_ip = false
    subnets          = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
    security_groups  = [aws_security_group.ecs_security_group.id]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.alb_target_group["event"].arn
    container_name   = "app"
    container_port   = var.container_port
  }
}

resource "aws_iam_role" "auto_scaling_role" {
  name = "auto_scaling_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "application-autoscaling.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "auto_scaling_role_policy" {
  role       = aws_iam_role.auto_scaling_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceAutoscaleRole"
}

resource "aws_appautoscaling_target" "scalable_target_a" {
  max_capacity = var.service_a.max_count
  min_capacity = var.service_a.desired_count

  resource_id = "service/${aws_ecs_cluster.ecs_cluster.name}/${aws_ecs_service.service_a.name}"

  role_arn = aws_iam_role.auto_scaling_role.arn

  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "scaling_policy_a" {
  name               = "${var.project_name}-cpu-a"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.scalable_target_a.resource_id
  scalable_dimension = aws_appautoscaling_target.scalable_target_a.scalable_dimension
  service_namespace  = aws_appautoscaling_target.scalable_target_a.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.auto_scale_cpu_target
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_target" "scalable_target_b" {
  max_capacity       = var.service_b.max_count
  min_capacity       = var.service_b.desired_count
  resource_id        = "service/${aws_ecs_cluster.ecs_cluster.name}/${aws_ecs_service.service_b.name}"
  role_arn           = aws_iam_role.auto_scaling_role.arn
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "scaling_policy_b" {
  name               = "${var.project_name}-cpu-b"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.scalable_target_b.resource_id
  scalable_dimension = aws_appautoscaling_target.scalable_target_b.scalable_dimension
  service_namespace  = aws_appautoscaling_target.scalable_target_b.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.auto_scale_cpu_target
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_target" "scalable_target_c" {
  max_capacity       = var.service_c.max_count
  min_capacity       = var.service_c.desired_count
  resource_id        = "service/${aws_ecs_cluster.ecs_cluster.name}/${aws_ecs_service.service_c.name}"
  role_arn           = aws_iam_role.auto_scaling_role.arn
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "scaling_policy_c" {
  name               = "${var.project_name}-cpu-c"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.scalable_target_c.resource_id
  scalable_dimension = aws_appautoscaling_target.scalable_target_c.scalable_dimension
  service_namespace  = aws_appautoscaling_target.scalable_target_c.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.auto_scale_cpu_target
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_target" "scalable_target_d" {
  max_capacity       = var.service_d.max_count
  min_capacity       = var.service_d.desired_count
  resource_id        = "service/${aws_ecs_cluster.ecs_cluster.name}/${aws_ecs_service.service_d.name}"
  role_arn           = aws_iam_role.auto_scaling_role.arn
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "scaling_policy_d" {
  name               = "${var.project_name}-cpu-d"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.scalable_target_d.resource_id
  scalable_dimension = aws_appautoscaling_target.scalable_target_d.scalable_dimension
  service_namespace  = aws_appautoscaling_target.scalable_target_d.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.auto_scale_cpu_target
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}


resource "aws_security_group" "api_security_group" {
  name   = "api_security_group"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_egress_rule" "api_security_group_outbound_rule" {
  security_group_id = aws_security_group.api_security_group.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "alb_security_group_inbound_rule" {
  security_group_id            = aws_security_group.alb_security_group.id
  ip_protocol                  = "tcp"
  from_port                    = 80
  to_port                      = 80
  referenced_security_group_id = aws_security_group.api_security_group.id
}

resource "aws_apigatewayv2_api" "api_gateway" {
  name          = "${var.project_name}-api-gateway"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_vpc_link" "api_gateway_vpclink" {
  name               = "${var.project_name}-api-gateway-vpclink"
  subnet_ids         = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
  security_group_ids = [aws_security_group.api_security_group.id]
}

resource "aws_apigatewayv2_integration" "api_gateway_intergration_to_alb" {
  api_id           = aws_apigatewayv2_api.api_gateway.id
  integration_type = "HTTP_PROXY"
  integration_uri  = aws_alb_listener.alb_listener_http.arn

  integration_method     = "ANY"
  connection_type        = "VPC_LINK"
  connection_id          = aws_apigatewayv2_vpc_link.api_gateway_vpclink.id
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_route" "api_gateway_route_any" {
  api_id    = aws_apigatewayv2_api.api_gateway.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.api_gateway_intergration_to_alb.id}"
}

resource "aws_apigatewayv2_stage" "api_gateway_stage" {
  name        = "$default"
  api_id      = aws_apigatewayv2_api.api_gateway.id
  auto_deploy = true
}

resource "aws_cloudfront_origin_access_control" "web_aoc" {
  name                              = "${var.project_name}-web-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "web_distribution" {
  enabled             = true
  default_root_object = "index.html"
  http_version        = "http2"
  origin {
    domain_name              = aws_s3_bucket.s3_web.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.web_aoc.id
    origin_id                = "webS3Origin"
  }
  default_cache_behavior {
    target_origin_id       = "webS3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]

    compress = true

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

}

data "aws_iam_policy_document" "web_bucket_policy" {
  statement {
    sid    = "AllowCloudFrontServicePrincipalReadOnly"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.s3_web.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.web_distribution.arn]
    }
  }

}

resource "aws_s3_bucket_policy" "web_bucket_policy" {
  bucket = aws_s3_bucket.s3_web.id
  policy = data.aws_iam_policy_document.web_bucket_policy.json
}
