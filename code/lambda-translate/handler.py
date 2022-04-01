import boto3
from decimal import Decimal
import time
import urllib.request
import urllib.parse
import urllib.error

print('Loading function')

rekognition = boto3.client('rekognition')

def detect_labels(bucket, key):
    response = rekognition.detect_labels(Image={"S3Object": {"Bucket": bucket, "Name": key}})

    # Note: role used for executing this Lambda function should have write access to the table.
    table = boto3.resource('dynamodb').Table('FrameData')
    labels = [{'Name': label_prediction['Name'], 'Occurrences': len(label_prediction['Instances'])} for label_prediction in response['Labels']]
    count = 0
    for element in labels:
        if element['Name'] == 'Car':
            count = element['Occurrences']
    table.put_item(Item={'camera': key, 'timestamp': int(time.time()), 'cars': count, 's3_url': bucket})
    return response

def lambda_handler(event, context):

    # Get the object from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'])
    try:

        # Calls rekognition DetectLabels API to detect labels in S3 object
        response = detect_labels(bucket, key)

        # Print response to console.
        print(response)

        return response
    except Exception as e:
        print(e)
        print("Error processing object {} from bucket {}. ".format(key, bucket) +
              "Make sure your object and bucket exist and your bucket is in the same region as this function.")
        raise e
        