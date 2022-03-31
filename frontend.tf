resource "aws_s3_bucket" "react_bucket" {
    bucket = "${var.FRONTEND_BUCKET_NAME}"
    acl = "public-read"

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
                "Resource": "arn:aws:s3:::${var.FRONTEND_BUCKET_NAME}/*",
                "Principal": "*"
            }
        ]
    }
    EOF

    website {
        index_document = "index.html"
        error_document = "index.html"
    }
}

output "website_domain" {
    value = "${aws_s3_bucket.react_bucket.website_domain}"
}

output "website_endpoint" {
    value = "${aws_s3_bucket.react_bucket.website_endpoint}"
}

variable "upload_directory" {
  default = "code/frontend/build/"
}

variable "mime_types" {
  default = {
    htm   = "text/html"
    html  = "text/html"
    css   = "text/css"
    ttf   = "font/ttf"
    js    = "application/javascript"
    map   = "application/javascript"
    json  = "application/json"
    png = "image/png"
    ico = "image/x-icon"
    txt = "text/plain"
    svg = "image/svg+xml"
    
  }
}

resource "aws_s3_bucket_object" "website_files" {
  for_each      = fileset(var.upload_directory, "**/*.*")
  bucket        = aws_s3_bucket.react_bucket.bucket
  key           = replace(each.value, var.upload_directory, "")
  source        = "${var.upload_directory}${each.value}"
  acl           = "public-read"
  etag          = filemd5("${var.upload_directory}${each.value}")
  content_type  = lookup(var.mime_types, split(".", each.value)[length(split(".", each.value)) - 1])
}

resource "aws_s3_bucket_cors_configuration" "cors_config" {
  bucket = aws_s3_bucket.react_bucket.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = [""]
    max_age_seconds = 3000
  }
}