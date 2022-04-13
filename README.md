# Car Countr
# Modify this document to expand any and all sections that are applicable for a better understanding from your users/testers/collaborators (remove this comment and other instructions areas for your FINAL release)

An online cloud system to view traffic livestreams and provide insights on the number of cars over time
  
## Team

- Frank Agnello 
- Peter Carter

## Prerequisites

- Terraform
- AWS CLI

## How to deploy it 

Make sure you run 'aws configure' to set your credentials file to your AWS Free Tier credentials

1. Update varibles in Project/vars.tf
1. terraform init
2. terraform plan -out "final"
3. terraform apply "final"

## Known bugs and disclaimers
AWS Requires each bucket to have a unique name, if your bucket name already exists on AWS some errors may occur.
This is made for AWS Free Tier, not Academy. Some issues may come up if running in an Academy account.

## How to test/run/access/use it

1. Open in your browser and navigate to the frontend URL given in the terraform output
2. Find a **m3u8** stream link that includes cars
3. Click "Add Camera" to supply a stream name and related link
4. Wait until data comes in, by default cameras are polled every 2 minutes


## License

MIT License

See LICENSE for details.
