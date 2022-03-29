terraform {
    required_providers {
        aws = {
        source  = "hashicorp/aws"
        version = "~> 3.27"
        }
    }

    required_version = ">= 0.14.9"
}

/* Frontend EC2 for hosting React application */
resource "aws_instance" "frontend_ec2" {
    ami           = "ami-0c293f3f676ec4f90"
    instance_type = "t2.micro"
    vpc_security_group_ids = ["${aws_security_group.ssh-allowed.id}"]
    key_name = "${aws_key_pair.carcountr_key_pair.id}"
    subnet_id = "${aws_subnet.public_subnet.id}"
    associate_public_ip_address = true

    connection {
        user = "${var.EC2_USER}"
        private_key = "${file("${var.PRIVATE_KEY_PATH}")}"
    }

    tags = {
      Name = "frontend_ec2"
    }
}

/* Backend EC2 for hosting running ffmpeg */
resource "aws_instance" "ffmpeg_server" {
  ami           = "ami-0c293f3f676ec4f90"
  instance_type = "t2.micro"
  user_data	= file("docker.sh")
  key_name = "${aws_key_pair.carcountr_key_pair.id}"
  subnet_id = "${aws_subnet.private_subnet.id}"
  vpc_security_group_ids = ["${aws_security_group.ssh-allowed.id}"]


  tags = {
    Name = "ExampleAppServerInstance"
  }
}
# docker run jrottenberg/ffmpeg -stats -i "https://pa511wmedia102.ilchost.com/live/CAM-11-154.stream/chunklist_w1230942918.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9My8xMS8yMDIyIDE6MDQ6MzQgQU0maGFzaF92YWx1ZT1yY2VRY2tpc1BURDh1UEhxSVJOV21BPT0mdmFsaWRtaW51dGVzPTIwJmlkPTczLjE1NC44MC4yMjA%3D" -vf fps=1/60 test_%04d.jpg


/* Key pair for both EC2s */
resource "aws_key_pair" "carcountr_key_pair" {
    key_name   = "carcountr"
    public_key = "${file(var.PUBLIC_KEY_PATH)}"
}

/* S3 bucket for hosting frames */
resource "aws_s3_bucket" "carcountr_bucket" {
  bucket = "carcountr-bucket"

  tags = {
    Name        = "carcountr-bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.carcountr_bucket.id
  acl    = "private"
}

/* Lambda Function For Frame Translation*/

resource "aws_lambda_function" "carcountr_frame_translation" {
  filename      = "translate_payload.zip"
  function_name = "translate_lambda"
  role          = "${var.LAB_ROLE_ARN}"
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
  type = "zip"  
  source_file = "code/lambda-translate/handler.py" 
  output_path = "translate_payload.zip"
}

/* DynamoDB Table */

resource "aws_dynamodb_table" "carcountr-table" {
  name           = "FrameData"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "Data"
  range_key      = "Timestamp"

  attribute {
    name = "Data"
    type = "S"
  }

  attribute {
    name = "Timestamp"
    type = "S"
  }

  tags = {
    Name        = "dynamodb-table-1"
    Environment = "production"
  }
}

/* Lambda Function For Frontend API*/
resource "aws_lambda_function" "carcountr_api" {
  filename      = "api_payload.zip"
  function_name = "api_lambda"
  role          = "${var.LAB_ROLE_ARN}"
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

/* API Gateway */
resource "aws_api_gateway_rest_api" "carcountr_api_gateway" {
  name = "carcountr_api"
}

