/* Main VPC */
resource "aws_vpc" "carcountr_vpc" {
    cidr_block = "10.0.0.0/16"
    enable_dns_support = true
    enable_dns_hostnames = true

    tags = {
        Name = "carcountr_vpc"
    }
}

/* GATEWAYS */

/* Internet Gateway for Public Subnet */
resource "aws_internet_gateway" "carcountr_igw" {
    vpc_id = "${aws_vpc.carcountr_vpc.id}"
    tags = {
        Name = "default"
    }
}

/* Elastic IP for NAT Gateway */
resource "aws_eip" "nat_eip" {
    vpc = true
    depends_on = [aws_internet_gateway.carcountr_igw]
}

/* NAT Gateway for Private Subnet */
resource "aws_nat_gateway" "nat_gateway" {
    allocation_id = aws_eip.nat_eip.allocation_id
    subnet_id     = aws_subnet.private_subnet.id
    tags = {
        Name = "nat_gateway"
    }
    depends_on = [aws_internet_gateway.carcountr_igw]
}

/* SUBNETS */

/* Public Subnet */
resource "aws_subnet" "public_subnet" {
    vpc_id     = aws_vpc.carcountr_vpc.id
    cidr_block = "10.0.0.0/26"
    map_public_ip_on_launch = true

    tags = {
        Name = "public_subnet"
    }
}

/* Private Subnet */
resource "aws_subnet" "private_subnet" {
    vpc_id     = aws_vpc.carcountr_vpc.id
    cidr_block = "10.0.0.128/26"
    map_public_ip_on_launch = false

    tags = {
        Name = "private_subnet"
    }
}

/* Public Route Table for Public Subnet */
resource "aws_route_table" "public_route_table" {
    vpc_id = "${aws_vpc.carcountr_vpc.id}"
    
    route {
        cidr_block = "0.0.0.0/0" 
        gateway_id = "${aws_internet_gateway.carcountr_igw.id}" 
    }
    
    tags = {
        Name = "public_route_table"
    }
}

/* Attatch Public Route Table to Public Subnet */
resource "aws_route_table_association" "public_association"{
    subnet_id = "${aws_subnet.public_subnet.id}"
    route_table_id = "${aws_route_table.public_route_table.id}"
}

/* Private Route Table for Private Subnet */
resource "aws_route_table" "private_route_table" {
    vpc_id = "${aws_vpc.carcountr_vpc.id}"

    route {
        cidr_block = "0.0.0.0/0" 
        nat_gateway_id = "${aws_nat_gateway.nat_gateway.id}" 
    }

    tags = {
        Name = "private_route_table"
    }
}

/* Attatch Private Route Table to Private Subnet */
resource "aws_route_table_association" "private_association"{
    subnet_id = "${aws_subnet.private_subnet.id}"
    route_table_id = "${aws_route_table.private_route_table.id}"
}

resource "aws_security_group" "ssh-allowed" {
    vpc_id = "${aws_vpc.carcountr_vpc.id}"
    
    egress {
        from_port = 0
        to_port = 0
        protocol = -1
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    tags = {
        Name = "ssh-allowed"
    }
}