#!/bin/bash
set -ex
sudo yum update -y
sudo amazon-linux-extras install docker
echo "Docker installed successfully!"
sudo service docker start
sudo usermod -a -G docker ec2-user
echo "About to enter loop"
while true
do
	sleep 5m
    d=$(date +%Y-%m-%d-%H-%M-%S)
    docker run jrottenberg/ffmpeg -i "https://s53.nysdot.skyvdn.com/rtplive/R4_090/chunklist_w673018897.m3u8" -vframes 1 -q:v 2 -f image2pipe - | aws s3 cp - s3://ffmpeg-tests/$d.jpg
    echo "Took picture"
done
--//--