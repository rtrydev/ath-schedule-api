data "aws_iam_policy_document" "lambda_assume_role_document" {
  version = "2012-10-17"

  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    effect = "Allow"
  }
}

data "aws_iam_policy_document" "lambda_document" {
  version = "2012-10-17"

  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "cloudwatch:PutMetricData",
      "kms:*",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObject",
      "dynamodb:GetItem",
      "dynamodb:PutItem"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "lambda_policy" {
  policy = data.aws_iam_policy_document.lambda_document.json
}

resource "aws_iam_role" "lambda_role" {
  name               = "ath-schedule-api-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_document.json
}

resource "aws_iam_policy_attachment" "lambda_attachment" {
  name = "ath-schedule-api-lambda-attachment"

  roles = [
    aws_iam_role.lambda_role.name,
  ]

  policy_arn = aws_iam_policy.lambda_policy.arn
}
