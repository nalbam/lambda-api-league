# dynamodb

resource "aws_dynamodb_table" "league-main" {
  name           = "${var.stage}-${var.name}-main"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "league"

  attribute {
    name = "league"
    type = "S"
  }

  tags = {
    Name = "${var.stage}-${var.name}-main"
  }
}

resource "aws_dynamodb_table" "league-time" {
  name           = "${var.stage}-${var.name}-time"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "id"
  range_key      = "league"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "league"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name               = "league_index"
    hash_key           = "league"
    range_key          = "email"
    write_capacity     = 5
    read_capacity      = 5
    projection_type    = "INCLUDE"
    non_key_attributes = ["id"]
  }

  tags = {
    Name = "${var.stage}-${var.name}-time"
  }
}
