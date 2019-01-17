#!/bin/bash

d=`dirname $0`
ros_packages_dir="${d}/../ros_packages"
export ROS_PACKAGE_PATH="${ros_packages_dir}:${ROS_PACKAGE_PATH}"

echo "ROS_PACKAGE_PATH=$ROS_PACKAGE_PATH"


clean_processes()
{
    kill `ps aux|grep gazebo|grep fetch|awk '{print $2}'`
}

clean_processes

sleep 2

//! if (runDemo) {
(sleep 10; xterm -e sh $d/start_demo.sh) &
//! }

exec roslaunch my_fetch_gazebo playground.launch \
//! if (robot.shortName === 'FetchFreight') {
   robot:=fetch
//! } else {
   robot:=freight
//! }


