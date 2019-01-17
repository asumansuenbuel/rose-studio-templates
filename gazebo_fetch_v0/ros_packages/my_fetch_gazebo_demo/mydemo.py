#!/usr/bin/env python

# Copyright (c) 2015, Fetch Robotics Inc.
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#     * Neither the name of the Fetch Robotics Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from
#       this software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL FETCH ROBOTICS INC. BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
# THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Author: Michael Ferguson



import copy
import actionlib
import rospy
import time

from math import sin, cos
from moveit_python import (MoveGroupInterface,
                           PlanningSceneInterface)
from moveit_python.geometry import rotate_pose_msg_by_euler_angles

from geometry_msgs.msg import PoseStamped
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal
from moveit_msgs.msg import PlaceLocation, MoveItErrorCodes

from gazebo_msgs.srv import GetModelState, SetModelState
from gazebo_msgs.msg import ModelState


# Move base using navigation stack
class MoveBaseClient(object):

    def __init__(self):
        self.client = actionlib.SimpleActionClient("move_base", MoveBaseAction)
        rospy.loginfo("Waiting for move_base...")
        self.client.wait_for_server()

    def goto(self, x, y, theta, frame="map"):
        move_goal = MoveBaseGoal()
        move_goal.target_pose.pose.position.x = x
        move_goal.target_pose.pose.position.y = y
        move_goal.target_pose.pose.orientation.z = sin(theta/2.0)
        move_goal.target_pose.pose.orientation.w = cos(theta/2.0)
        move_goal.target_pose.header.frame_id = frame
        move_goal.target_pose.header.stamp = rospy.Time.now()

        # TODO wait for things to work
        self.client.send_goal(move_goal)
        self.client.wait_for_result()


def place_demo_cube_onto(object_name, link_name = 'link', z = 0.9):
    try:
        getCoords = rospy.ServiceProxy('/gazebo/get_model_state', GetModelState)
        objectCoords = getCoords(object_name, link_name)
        place_demo_cube_onto_xy(objectCoords.pose.position.x, objectCoords.pose.position.y, z)
    except rospy.ServiceException as e:
        rospy.loginfo("placing demo cube on object failed:  {0}".format(e))
        
def place_demo_cube_onto_xy(x, y, z = 0.9):
    try:
        demoCubeName = 'demo_cube'
        demoCubeRef = 'link'
        print("placing demo_cube on (%f,%f)..." % (x, y))
        # first get coordinates of demo_cube:
        getCoords = rospy.ServiceProxy('/gazebo/get_model_state', GetModelState)
        setProps = rospy.ServiceProxy('/gazebo/set_model_state', SetModelState)
        demoCubeCoords = getCoords(demoCubeName, demoCubeRef)
        # next, get the object's coordinates:
        #objectCoords = getCoords(object_name, link_name)
        # determine the difference between the object and the cube:
        x_diff = x - demoCubeCoords.pose.position.x
        y_diff = y - demoCubeCoords.pose.position.y
        # finally, set the new coordinates of the cube:
        msg = ModelState()
        msg.model_name = demoCubeName
        msg.reference_frame = demoCubeRef
        msg.pose = demoCubeCoords.pose
        msg.twist = demoCubeCoords.twist
        msg.pose.position.x = x_diff
        msg.pose.position.y = y_diff
        msg.pose.position.z = z
        setProps(msg)
    except rospy.ServiceException as e:
        rospy.loginfo("placing demo cube on object failed:  {0}".format(e))


if __name__ == "__main__":
    # Create a node
    rospy.init_node("mydemo")

    # Make sure sim time is working
    while not rospy.Time.now():
        pass

    # Setup clients
    move_base = MoveBaseClient()
    
    
    rospy.loginfo("Moving to table table1...")
    move_base.goto(2.25, 3.118, 0.0)
    rospy.loginfo("move to 2.25, 3.118 successful.")
    #move_base.goto(2.75, 3.118, 0.0)
    #rospy.loginfo("move to 2.75, 3.118 successful.")
    place_demo_cube_onto('freight', 'world')
    time.sleep(3)
    # this table has the cube.
    rospy.loginfo("Moving to table table2...")
    move_base.goto(-4.8, 5.118, 0.0)
    rospy.loginfo("move to -4.8, 5.118 successful.")
    #move_base.goto(-4.3, 5.118, 0.0)
    #rospy.loginfo("move to -4.3, 5.118 successful.")
    place_demo_cube_onto("table2")
    time.sleep(3)


