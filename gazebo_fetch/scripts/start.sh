#!/bin/bash

clean_processes()
{
    kill `ps aux|grep gazebo|grep fetch|awk '{print $2}'`
}

clean_processes

sleep 2

(sleep 10; xterm -e roslaunch my_fetch_gazebo_demo mydemo.launch) &

exec roslaunch my_fetch_gazebo playground.launch robot:=freight


