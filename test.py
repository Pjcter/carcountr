import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')

def get_frames(camera, start, end):
    frames = []
    
    table = dynamodb.Table('TestTable')

    response = table.query(
        KeyConditionExpression=Key('camera').eq(camera) & Key('timestamp').between(start, end)
    )
    frames = response["Items"]
    
    return frames

get_frames("nocamera", 1648681299, 1648681380)