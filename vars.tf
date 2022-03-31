variable "AWS_REGION" {    
    default = "us-east-1"
}

variable "PUBLIC_KEY_PATH" {
    default = "./key.pub"
}

variable "LAB_ROLE_ARN" {
    default = "arn:aws:iam::272092739532:role/LabRole"
}

variable "ACCOUNT_ID" {
    default = "272092739532"
}