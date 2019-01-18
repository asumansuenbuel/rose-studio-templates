#!/bin/sh
#

d=`dirname $0`
ros_packages_dir="${d}/../ros_packages"
export ROS_PACKAGE_PATH="${ros_packages_dir}:${ROS_PACKAGE_PATH}"

echo "ROS_PACKAGE_PATH=$ROS_PACKAGE_PATH"


echo "press enter when Gazebo UI is initialized..."

read x

roslaunch my_fetch_gazebo_demo mydemo.launch