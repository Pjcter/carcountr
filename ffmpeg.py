import os
import requests
import time
count = 0
API = os.getenv('API')
BUCKET = os.getenv('BUCKET')
while True:
    count = count + 1
    test = requests.get(f"{API}/cameras")
    for element in test["Items"]:
        url = element["url"]
        camera = element["camera"]
        os.system(f"docker run jrottenberg/ffmpeg -i '{url}' -vframes 1 -q:v 2 -f image2pipe - | aws s3 cp - s3://{BUCKET}/{camera}_{count}.jpg")
    time.sleep(60)
