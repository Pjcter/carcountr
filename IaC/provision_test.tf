terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  profile = "default"
  region  = "us-east-1"
}

# docker run jrottenberg/ffmpeg -stats -i "https://49-d2.divas.cloud/CHAN-8293/CHAN-8293_1.stream/chunklist_w1134282071_tkdmRzd3p0b2tlbmhhc2g9ZDRLS3Z0SENQdlNkS2JOcE9mRmtfUENVR1ZITGlsRS1KNGgyYjRwY2dobz0=.m3u8" -vf fps=1/60 test_%04d.jpg
# docker run jrottenberg/ffmpeg -i "https://pa511wmedia102.ilchost.com/live/CAM-11-154.stream/chunklist_w983027938.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9My8zMC8yMDIyIDM6NTI6MjggQU0maGFzaF92YWx1ZT1QUGFKbnlrMmRCMVV5cVptK1FOaDNRPT0mdmFsaWRtaW51dGVzPTIwJmlkPTEwNC4yMjkuMzAuODE%3D" -vframes 1 -q:v 2 -f image2pipe - | aws s3 cp - s3://ffmpeg-tests/test2.jpg
resource "aws_instance" "ffmpeg_server" {
  ami           = "ami-0c293f3f676ec4f90"
  instance_type = "t2.micro"
  user_data	= file("docker.sh")
  iam_instance_profile = "${aws_iam_instance_profile.ffmpeg_profile.name}"
  key_name = "terra_ffmpeg"
  vpc_security_group_ids = [aws_security_group.main.id]

  tags = {
    Name = "ExampleAppServerInstance"
  }
}

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

resource "aws_iam_instance_profile" "ffmpeg_profile" {
  name = "ffmpeg_profile"
  role = "${aws_iam_role.ffmpeg_role.name}"
}

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

resource "aws_key_pair" "deployer" {
  key_name = "terra_ffmpeg"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC5WVWXAmcgzllGz6nl7CBzQDz5tRqCnFbt34Gho5Dma91s29rrC1Tc/qq07ozLUE+0EDT1FjkZP5sNqouQibo+ISdZ1WHlXbQu/IoYP55yqvB6CqFxDJKbBlwmDO+xteKIw5Ly8TWANakqO1ZK0/HXuUbRz3h8+dbrqMhpQY+CjQIK9Mg7qWYa2fb1nVky52FUZEALMs1z8QHUSeETqo1a8vmIhBkwdnYo3gYary4Us3ml+pFoMxVo/bDuyXHGL/apW/Jivj99h7+LQrLrYjbycys7exED41EqwHR5mChxttE5X/Pvg/vL16G4+EICvvFWjNuszxiXkHpNjKVfB487 frank@FranksLaptop"
}

resource "aws_security_group" "main" {
  egress = [
    {
      cidr_blocks      = [ "0.0.0.0/0", ]
      description      = ""
      from_port        = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "-1"
      security_groups  = []
      self             = false
      to_port          = 0
    },
  {
     cidr_blocks      = [ "0.0.0.0/0", ]
     description      = ""
     from_port        = 80
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 80
  },
  {
     cidr_blocks      = [ "0.0.0.0/0", ]
     description      = ""
     from_port        = 443
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 443
  }
  ]
 ingress                = [
   {
     cidr_blocks      = [ "0.0.0.0/0", ]
     description      = ""
     from_port        = 22
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 22
  },
  {
     cidr_blocks      = [ "0.0.0.0/0", ]
     description      = ""
     from_port        = 80
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 80
  },
  {
     cidr_blocks      = [ "0.0.0.0/0", ]
     description      = ""
     from_port        = 443
     ipv6_cidr_blocks = []
     prefix_list_ids  = []
     protocol         = "tcp"
     security_groups  = []
     self             = false
     to_port          = 443
  }
  ]
}
