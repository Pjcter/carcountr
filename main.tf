terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  required_version = ">= 0.14.9"
}

/* Backend EC2 for hosting running ffmpeg */
resource "aws_instance" "ffmpeg_server" {
  depends_on = [
    aws_s3_bucket.react_bucket
  ]
  ami           = "ami-0c293f3f676ec4f90"
  instance_type = "t2.micro"
  user_data = <<EOF
#!/bin/bash
set -ex
sudo yum update -y
sudo amazon-linux-extras install docker
echo "Docker installed successfully!"
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo yum -y install python-pip
python3 -m pip install requests
export API=${aws_api_gateway_deployment.deployment.invoke_url}${aws_api_gateway_stage.prod.stage_name}
export DELAY=${var.FFMPEG_DELAY}
export BUCKET=${var.BACKEND_BUCKET_NAME}
wget ${aws_s3_bucket.react_bucket.website_endpoint}/ffmpeg.py
python3 ffmpeg.py
--//--
EOF
  iam_instance_profile = "${aws_iam_instance_profile.ffmpeg_profile.name}"
  key_name = "${aws_key_pair.carcountr_key_pair.id}"
  subnet_id = "${aws_subnet.public_subnet.id}"
  vpc_security_group_ids = ["${aws_security_group.ssh-allowed.id}"]

  tags = {
    Name = "FFmpeg_Server"
  }
}

/* Backend ffmpeg server iam role */
resource "aws_iam_role" "ffmpeg_role" {
  name = "ffmpeg_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = {
      tag-key = "tag-value"
  }
}

/* Backend ffmpeg server iam instance profile */
resource "aws_iam_instance_profile" "ffmpeg_profile" {
  name = "ffmpeg_profile"
  role = "${aws_iam_role.ffmpeg_role.name}"
}

/* Backend ffmpeg server S3 access */
resource "aws_iam_role_policy" "s3_policy" {
  name = "s3_policy"
  role = "${aws_iam_role.ffmpeg_role.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

/* Key pair for EC2 */
resource "aws_key_pair" "carcountr_key_pair" {
  key_name   = "carcountr"
  public_key = file(var.PUBLIC_KEY_PATH)
}

/* S3 bucket for hosting frames */
resource "aws_s3_bucket" "carcountr_bucket" {
  bucket = var.BACKEND_BUCKET_NAME
  acl    = "public-read"
  tags = {
    Name        = "${var.BACKEND_BUCKET_NAME}"
    Environment = "Dev"
  }
  force_destroy = true
  policy = <<EOF
    {
        "Id": "bucket_policy_site",
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "bucket_policy_site_main",
                "Action": [
                    "s3:getObject"
                ],
                "Effect": "Allow",
                "Resource": "arn:aws:s3:::${var.BACKEND_BUCKET_NAME}/*",
                "Principal": "*"
            }
        ]
    }
  EOF
}

/* Lambda Function For Frame Translation*/
resource "aws_lambda_function" "carcountr_frame_translation" {
  filename      = "translate_payload.zip"
  function_name = "translate_lambda"
  role          = aws_iam_role.translate_lambda_role.arn
  handler       = "handler.lambda_handler"

  source_code_hash = data.archive_file.translate_lambda_package.output_base64sha256

  runtime = "python3.6"

  environment {
    variables = {
      foo = "bar"
    }
  }
}

/* Code for Lambda Function */
data "archive_file" "translate_lambda_package" {
  type        = "zip"
  source_file = "code/lambda-translate/handler.py"
  output_path = "translate_payload.zip"
}

/* Role for Translate Lambda */
resource "aws_iam_role" "translate_lambda_role" {
  name = "translate_lambda_role"

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

/* Set up trigger for S3 bucket and translte lambda */

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.carcountr_frame_translation.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.carcountr_bucket.arn
}
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.carcountr_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.carcountr_frame_translation.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.allow_bucket]
}
/* Give Translate Lambda permissions to write to DynamoDB */

resource "aws_iam_policy" "translate_policy" {
  name = "translate-policy"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:PutItem"
        ],
        "Resource": ["arn:aws:dynamodb:${var.AWS_REGION}:${var.ACCOUNT_ID}:table/*"]
      },
      {
        "Effect": "Allow",
        "Action": [
          "rekognition:*"
        ],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource": "*"
      },
      {
          "Effect": "Allow",
          "Action": [
              "s3:GetObject",
              "s3:GetObjectVersion"
          ],
          "Resource": [
              "arn:aws:s3:::${var.BACKEND_BUCKET_NAME}/*"
          ]
      }
    ]
}
EOF
}
resource "aws_iam_role_policy_attachment" "translate-attach" {
  role       = aws_iam_role.translate_lambda_role.name
  policy_arn = aws_iam_policy.translate_policy.arn
}

/* DynamoDB Tables */

resource "aws_dynamodb_table" "carcountr-frame-table" {
  name           = "FrameData"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "camera"
  range_key      = "timestamp"

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "camera"
    type = "S"
  }

  tags = {
    Name        = "FrameData"
    Environment = "production"
  }
}

resource "aws_dynamodb_table" "carcountr-camera-table" {
  name           = "CameraData"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "url"
  range_key      = "camera"

  attribute {
    name = "url"
    type = "S"
  }

  attribute {
    name = "camera"
    type = "S"
  }

  tags = {
    Name        = "CameraData"
    Environment = "production"
  }
}