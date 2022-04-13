import os
import requests
import time
from datetime import datetime

API = os.getenv('API')
BUCKET = os.getenv('BUCKET')
DELAY = int(os.getenv('DELAY'))
while True:
    
    now = datetime.now().strftime("%d%m%y-%H%M%S")
    data = requests.get(f"{API}/cameras").json()
    for element in data["Items"]:
        try:
            url = element["url"]
            camera = element["camera"]
            os.system(f"docker run jrottenberg/ffmpeg -i '{url}' -vframes 1 -q:v 2 -f image2pipe - | aws s3 cp - s3://{BUCKET}/{camera}_{now}.jpg")
        except:
            name = element["camera"]
            print(f"Error occured with camera: {name}")
    time.sleep(DELAY * 60)
