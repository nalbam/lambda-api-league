# Terraform Main

module "domain" {
  source = "git::https://github.com/nalbam/terraform-aws-route53.git"
  domain = var.domain
}

module "dev-lambda" {
  source = "git::https://github.com/nalbam/terraform-aws-lambda-api.git"
  region = var.region

  name         = var.name
  stage        = var.stage
  description  = "api > lambda > league"
  runtime      = "nodejs8.10"
  handler      = "index.handler"
  memory_size  = 512
  timeout      = 5
  s3_bucket    = var.s3_bucket
  s3_source    = "target/lambda.zip"
  s3_key       = "lambda/${var.name}/${var.name}-${var.build_no}.zip"
  http_methods = ["ANY"]

  // domain
  zone_id         = module.domain.zone_id
  certificate_arn = module.domain.certificate_arn
  domain_name     = "${var.stage}-${var.name}.${var.domain}"

  env_vars = {
    PROFILE    = var.stage
    MAIN_TABLE = "${var.stage}-${var.name}-main"
    TIME_TABLE = "${var.stage}-${var.name}-time"
  }
}

output "url" {
  value = "https://${module.dev-lambda.domain}/league"
}
