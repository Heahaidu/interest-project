variable "region" {
  type    = string
  default = "us-east-1"
}

variable "availability_zone" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b"]
}

variable "project_name" {
  type    = string
  default = "interest-project"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_1_cidr" {
  type    = string
  default = "10.0.0.0/24"
}

variable "public_subnet_2_cidr" {
  type    = string
  default = "10.0.1.0/24"
}

variable "private_subnet_1_cidr" {
  type    = string
  default = "10.0.10.0/24"
}

variable "private_subnet_2_cidr" {
  type    = string
  default = "10.0.11.0/24"
}

variable "is_bootstrap_mode" {
  type    = bool
  default = true
}

variable "bootstrap_image" {
  type    = string
  default = "heahaidu/springboot-health-bootstrap:latest"
}

variable "mail_host" {
  type    = string
  default = "smtp.gmail.com"
}

variable "mail_username" {
  type    = string
  default = "heahaidu10@gmail.com"
}

variable "mail_password" {
  type      = string
  sensitive = true
}

variable "db_username" {
  type    = string
  default = "administrator"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.small"
}

variable "db_port" {
  type    = number
  default = 5432
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

variable "multiAZ" {
  type    = bool
  default = false
}

variable "container_port" {
  type    = number
  default = 8080
}

variable "databases" {
  type = map(object({
    identifier        = string
    instance_class    = string
    allocated_storage = number
  }))
  default = {
    db1 = {
      identifier        = "db1"
      instance_class    = "db.t3.micro"
      allocated_storage = 20
    }
    db2 = {
      identifier        = "db2"
      instance_class    = "db.t3.small"
      allocated_storage = 50
    }
    db3 = {
      identifier        = "db3"
      instance_class    = "db.t3.micro"
      allocated_storage = 20
    }
  }
}

variable "health_check_path" {
  type    = string
  default = "/actuator/health/liveness"
}

variable "services" {
  type = map(object({
    paths    = list(string)
    priority = number
  }))
  default = {
    user = {
      paths    = ["/api/v1/user*"]
      priority = 1
    }
    notification = {
      paths    = ["/api/v1/notifications*"]
      priority = 2
    }
    chatbot = {
      paths    = ["/ws-chat/websocket/*", "/api/v1/chatbot/*", "/api/v1/chatbot"]
      priority = 3
    }
    event = {
      paths    = ["/api/v1/events/*", "/api/v1/events"]
      priority = 4
    }
  }
}

variable "cloudmap_namespace" {
  type    = set(string)
  default = ["redis", "kafka"]
}

variable "service_a" {
  type = object({
    name          = string
    cpu           = number
    memory        = number
    desired_count = number
    max_count     = number
  })
  default = {
    name          = "user-service"
    cpu           = 256
    memory        = 512
    desired_count = 1
    max_count     = 1
  }
}

variable "service_b" {
  type = object({
    name          = string
    cpu           = number
    memory        = number
    desired_count = number
    max_count     = number
  })
  default = {
    name          = "event-service"
    cpu           = 256
    memory        = 512
    desired_count = 1
    max_count     = 1
  }
}


variable "service_c" {
  type = object({
    name          = string
    cpu           = number
    memory        = number
    desired_count = number
    max_count     = number
  })
  default = {
    name          = "chatbot-service"
    cpu           = 256
    memory        = 512
    desired_count = 1
    max_count     = 1
  }
}


variable "service_d" {
  type = object({
    name          = string
    cpu           = number
    memory        = number
    desired_count = number
    max_count     = number
  })
  default = {
    name          = "notification-service"
    cpu           = 256
    memory        = 512
    desired_count = 1
    max_count     = 1
  }
}

variable "auto_scale_cpu_target" {
  type    = number
  default = 70
}
