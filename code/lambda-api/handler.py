import json
import boto3
import logging

def lambda_handler(event, context):

   print("Event :", event)

   ####

   #TODO: Create Lambda Handler for different routes.

   ####

   logger = logging.getLogger()
   logger.setLevel(logging.INFO)

   return {
       'statusCode': 200,
       'body': json.dumps('Hello from S3 events Lambda!')
}