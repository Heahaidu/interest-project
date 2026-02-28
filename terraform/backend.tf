terraform {
  backend "s3" {
    bucket = "${var.project_name}-terraform-state"
    key = "dev/terraform.tfstate"
    region = var.region
    dynamodb_table = "terraform-lock"
    encrypt = true
    use_lockfile = true
  }
}