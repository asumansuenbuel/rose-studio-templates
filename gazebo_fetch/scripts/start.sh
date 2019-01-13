#!/bin/bash

d=`dirname $0`
ros_packages_dir="${d}/../ros_packages"
export ROS_PACKAGE_PATH="${ROS_PACKAGE_PATH}:${ros_packages_dir}"

echo "ROS_PACKAGE_PATH=$ROS_PACKAGE_PATH"


clean_processes()
{
    kill `ps aux|grep gazebo|grep fetch|awk '{print $2}'`
}

clean_processes

sleep 2

(sleep 10; xterm -e ) &

exec roslaunch my_fetch_gazebo playground.launch \
//! switch(robot.shortName) {
//! case 'FetchFreight':
robot:=freight
//!   break
//! case 'Fetch':
robot:=fetch
//!   break
//! }


