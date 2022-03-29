import json
import boto3
import logging

# boto3 S3 initialization
s3_client = boto3.client("s3")


def lambda_handler(event, context):

    # event contains all information about uploaded object
    print("Event :", event)

    # Bucket Name where file was uploaded
    source_bucket_name = event['Records'][0]['s3']['bucket']['name']

    # Filename of object (with path)
    file_key_name = event['Records'][0]['s3']['object']['key']

    #####

    #TODO: Take file from S3 bucket and submit to Rekognition, get results, and then store the results into DynamoDB

    ######

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from S3 events Lambda!')
}