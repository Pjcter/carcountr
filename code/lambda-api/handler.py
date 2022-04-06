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
    elif '/cameras' in path:
        body = {}
        if method == 'POST':
            try:
                camera = qs["camera"]
                url = qs["url"]
            except:
                return {
                    'statusCode': 400,
                    'body' : json.dumps('Error: Query string missing parameters'),
                    'headers' : {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST'
                    }
                }
            response = put_camera(camera, url)
            return {
                'statusCode':200,
                'body': json.dumps(response),
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST'
                }
            }
        elif method == 'GET':
            try:
                response = get_cameras()
            except:
                return {
                    'statusCode':400,
                    'body': json.dumps('Error: DynamoDB scan failed'),
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,GET'
                    }
                }
            return {
                    'statusCode':200,
                    'body': json.dumps(response),
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,GET'
                    }
            }
        elif method == 'DELETE':
            try:
                camera = qs["camera"]
                response = remove_camera(camera)
            except:
                return {
                    'statusCode':400,
                    'body': json.dumps('Error!'),
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,GET,DELETE'
                    }
                }
            return {
                    'statusCode':200,
                    'body': json.dumps(response),
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,GET,DELETE'
                    }
            }
        elif method == 'OPTIONS':
            return {
                    'statusCode':200,
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,GET,DELETE,POST'
                    }
            }
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
def put_camera(camera, url):
    table = dynamodb.Table('CameraData')
    response = table.put_item(Item={'camera': camera, 'url': url})
    return response
def remove_camera(camera):
    table = dynamodb.Table('CameraData')
    response = table.remove_item(Key={'camera': camera})
    return response
def get_cameras():
    table= dynamodb.Table('CameraData')
    response = table.scan()
    return response
