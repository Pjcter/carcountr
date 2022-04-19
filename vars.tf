#AWS Region to deploy to
variable "AWS_REGION" {
  default = "us-east-1"
}

#AWS Account ID to deploy to 
variable "ACCOUNT_ID" {
  default = ""
}

#Unique bucket name for an S3 bucket. Bucket is used to host website.
variable "FRONTEND_BUCKET_NAME" {
  default = ""
}

#Unique bucket name for an S3 bucket. Bucket is used to store livestream pictures
variable "BACKEND_BUCKET_NAME" {
  default = ""
}

#Number of minutes between FFmpeg execution. 
variable "FFMPEG_DELAY" {
  default = "10"
}