#!/bin/sh
#

echo "===================================="
echo "           Rose Gazebo Demo"
echo "===================================="

baseDir=~/rose-generated
downloadDir=~/Downloads

mkdir ${baseDir} 2> /dev/null
cd ${baseDir}

unzip_latest ${downloadDir}

if [ $? -ne 0 ]; then
    exit
fi

echo "running demo script..."
sh scripts/start.sh
