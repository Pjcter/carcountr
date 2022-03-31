import json
import boto3
from boto3.dynamodb.conditions import Key
import logging

def lambda_handler(event, context):

    print("Event :", event)

    path = event["path"]
    method = event["httpMethod"]
    qs = event["queryStringParameters"]

    if '/frames' in path:
        body = {}
        if method == 'GET':
            try:
                camera = qs["camera"]
                start = qs["start"]
                end = qs["end"]
            except:
                return {
                    'statusCode': 400,
                    'body' : json.dumps('Error: Query string missing parameters'),
                    'headers' : {
                                    'Access-Control-Allow-Headers': 'Content-Type',
                                    'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Methods': 'OPTIONS,GET'
                    }
                }
            frames = get_frames(camera, start, end)
            return {
                'statusCode': 200,
                'body' : json.dumps(frames),
                'headers' : {
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'OPTIONS,GET'
                }
            }
    elif '/camera' in path:
        body = {}
    elif '/about' in path:
        body = {}
    else:
        return {
            'statusCode': 404,
            'body': json.dumps("Route not found")
        }
    return {
        'statusCode': 404,
        'body': json.dumps("Route not found")
    }

dynamodb = boto3.resource('dynamodb')

def get_frames(camera, start, end):
    frames = []
    
    table = dynamodb.Table('FrameData')
    
    response = table.query(
        KeyConditionExpression=Key('camera').eq(camera) & Key('timestamp').between(int(start), int(end))
    )
    for item in response["Items"]:
        frame_data = {
            "camera": item["camera"],
            "timestamp": str(item["timestamp"]),
            "cars": str(item["cars"]),
            "s3_url": item["s3_url"]
        }
        frames.append(frame_data)
    return frames