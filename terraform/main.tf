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
  bucket = "carcountr_bucket"

  tags = {
    Name        = "carcountr_bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.carcountr_bucket.id
  acl    = "private"
}



