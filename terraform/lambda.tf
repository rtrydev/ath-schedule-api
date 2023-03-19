data "archive_file" "get_branch_data_archive" {
  type        = "zip"
  source_dir = "${path.module}/../build/get-branch-data"
  output_path = "${path.module}/../dist/get-branch-data.zip"
}

resource "aws_lambda_layer_version" "dependency_layer" {
  filename            = "${path.module}/../dist/layers/layer.zip"
  layer_name          = "DependencyLayer"
  compatible_runtimes = ["nodejs14.x"]
  source_code_hash    = base64sha256(filebase64("${path.module}/../dist/layers/layer.zip"))
}

resource "aws_lambda_function" "get_branch_data" {
  filename      = data.archive_file.get_branch_data_archive.output_path
  function_name = "GetBranchData"
  role          = aws_iam_role.lambda_role.arn
  handler       = "app.getBranchData"

  source_code_hash = base64sha256(data.archive_file.get_branch_data_archive.output_path)

  runtime = "nodejs14.x"
  timeout = "15"
  memory_size = 256

  layers = [
    aws_lambda_layer_version.dependency_layer.arn
  ]
}

