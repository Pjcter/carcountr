
/* Lambda Function For Frontend API*/
resource "aws_lambda_function" "carcountr_api" {
  filename      = "api_payload.zip"
  function_name = "api_lambda"
  role          = aws_iam_role.api_lambda_role.arn
  handler       = "handler.lambda_handler"

  source_code_hash = data.archive_file.api_lambda_package.output_base64sha256
  runtime = "python3.6"

  environment {
    variables = {
      foo = "bar"
    }
  }
}

/* Code for Lambda Function */
data "archive_file" "api_lambda_package" {  
  type = "zip"  
  source_file = "${path.module}/code/lambda-api/handler.py" 
  output_path = "api_payload.zip"
}

/* Role for API Lambda */
resource "aws_iam_role" "api_lambda_role" {
  name = "api_lambda_role"

  assume_role_policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
}
resource "aws_iam_policy" "api_policy" {
  name        = "api-policy"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:Query"
        ],
        "Resource": ["arn:aws:dynamodb:${var.AWS_REGION}:${var.ACCOUNT_ID}:table/*"]
      }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "test-attach" {
  role       = aws_iam_role.api_lambda_role.name
  policy_arn = aws_iam_policy.api_policy.arn
}
# API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name = "FrameAPI"
}

resource "aws_api_gateway_resource" "frames_resource" {
  path_part   = "frames"
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_method" "method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.frames_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.frames_resource.id
  http_method             = aws_api_gateway_method.method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.carcountr_api.invoke_arn
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.carcountr_api.function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.AWS_REGION}:${var.ACCOUNT_ID}:${aws_api_gateway_rest_api.api.id}/*/${aws_api_gateway_method.method.http_method}${aws_api_gateway_resource.frames_resource.path}"
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.api.body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = "prod"
}

output "api_endpoint" {
    value = "${aws_api_gateway_deployment.deployment.invoke_url}"
}

resource "aws_s3_bucket_object" "object" {

  bucket = aws_s3_bucket.react_bucket.id
  key    = "api_url"
  acl    = "public-read"  # or can be "public-read"
  content = "${aws_api_gateway_deployment.deployment.invoke_url}${aws_api_gateway_stage.prod.stage_name}"
}