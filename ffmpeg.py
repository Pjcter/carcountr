import os
import requests
import time
count = 0
API = os.getenv('API')
BUCKET = os.getenv('BUCKET')
DELAY = int(os.getenv('DELAY'))
while True:
    count = count + 1
    test = requests.get(f"{API}/cameras").json()
    for element in test["Items"]:
        try:
            url = element["url"]
            camera = element["camera"]
            os.system(f"docker run jrottenberg/ffmpeg -i '{url}' -vframes 1 -q:v 2 -f image2pipe - | aws s3 cp - s3://{BUCKET}/{camera}_{count}.jpg")
        except:
            name = element["camera"]
            print(f"Error occured with camera: {name}")
    time.sleep(DELAY * 60)
