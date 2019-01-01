/*
 * @author Naomi Shao created 5/16/17, modified 6/26/17, uploaded and contributed by Suneet Agera and modified by Christian Warmuth 
 * require db module to connect to hana
 * use 'axios' to handle proxy issue, as Fetch SDK was for browser usage, had limitations for Node Servers, resolved by adding new features to SDK
 */

'use strict';

/* Vendor libraries */
const fetchWrapperServices = require('../lib/vendor/fetch/wrapperServices.js');
const mirWrapperServices = require('../lib/vendor/mir/wrapperServices.js');
const urWrapperServices = require('../lib/vendor/universalRobots/wrapperServices.js');

/* Demo librarie */

const demo = require('../src/Demo.js');


/* node libraries */
const axios = require('axios');

const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 2000,
    bodyParser = require('body-parser'),
    path = require("path");
/* ---------------- */

/* SAP libraries    */
const db = require('../lib/db');

/* ---------------- */

/* Configuration settings    */
const projectSettings = require('../config/ProjectSettings'); // project settings including usernames & passwords for HANA DB of RoSe

/* ---------------- */

app.listen(PORT);

app.get('/allocateFreeRobot/', function (req, res) {

    var DB_USER = projectSettings.dbUser;
    var DB_PASSWORD = projectSettings.dbPassword;
    var SQL_QUERY_FIND_UNALLOCATED_ROBOT = 'select top 1 A."ROBOT_ID",A."ROBOT_VENDOR", B."RESOURCE_ID" from (select "ROBOT_ID","ROBOT_VENDOR" from "ROBOTICS"."SAP.ROBOT.INVENTORY" where "ROBOT_TYPE" = \'material_transport\' and "ALLOCATION_FLAG" = \'No\' and "ROBOT_OPERATION_STATUS" = \'live\') as A INNER JOIN "ROBOTICS"."SAP.EWM.ROBOT.MAPPING" as B on A."ROBOT_ID" = B."ROBOT_ID"';
    db.connection(DB_USER, DB_PASSWORD, SQL_QUERY_FIND_UNALLOCATED_ROBOT, function (rst) {

        if (rst.length == 0) {
            console.log("Select returns nothing as all robots are allocated");
            res.send("No available robot in pool");

        } else {

            console.log("rst is not null, so obviously some robot is available");
            console.log("Rst value in Allocate Service:  " + rst[0].ROBOT_ID); // there should be another way of allocating a robot, because the first ones will be used frequently wheras the bottom ones not

            console.log("Allocating free robot and creating a JSON object AllocatedRobotInfo");
            res.type('json');
            res.json({
                "AllocatedRobotInfo": {
                    "RobotId": rst[0].ROBOT_ID,
                    "RobotVendor": rst[0].ROBOT_VENDOR,
                    "ResourceInEWM": rst[0].RESOURCE_ID
                }
            });

            console.log('Now going to the next db connection inside Allocate Function');

            var DB_USER = projectSettings.dbUser;
            var DB_PASSWORD = projectSettings.dbPassword;
            var SQL_QUERY_UPDATE_ALLOCATION_FLAG_YES = 'UPDATE "ROBOTICS"."SAP.ROBOT.INVENTORY" SET ALLOCATION_FLAG = \'Yes\' WHERE ROBOT_ID = \'' + rst[0].ROBOT_ID + '\'';

            db.connection(DB_USER, DB_PASSWORD, SQL_QUERY_UPDATE_ALLOCATION_FLAG_YES, function (rst1) {
                console.log("Updated the Allocation Flag by setting it to Yes");
            });

        }

    });

});

app.get('/deallocateRobotToPool/:EWMResourceID', function (req, res) {

    console.log("Deallocating free robot");

    var DB_USER = projectSettings.dbUser;
    var DB_PASSWORD = projectSettings.dbPassword;
    var SQL_QUERY_FIND_ROBOT_CORRESPONDING_TO_EWM_RESOURCE = 'select "ROBOT_ID" from "ROBOTICS"."SAP.EWM.ROBOT.MAPPING" where "RESOURCE_ID" = \'' + req.params.EWMResourceID + '\'';

    db.connection(DB_USER, DB_PASSWORD, SQL_QUERY_FIND_ROBOT_CORRESPONDING_TO_EWM_RESOURCE, function (rst) {

        console.log("Rst value in Deallocate Service: " + rst);

        if (rst !== null || typeof rst !== "undefined") {
            console.log("Robot corresponding to resource:  " + rst[0].ROBOT_ID);

            var DB_USER = projectSettings.dbUser;
            var DB_PASSWORD = projectSettings.dbPassword;
            var SQL_QUERY_UPDATE_ALLOCATION_FLAG_NO = 'UPDATE "ROBOTICS"."SAP.ROBOT.INVENTORY" SET ALLOCATION_FLAG = \'No\' WHERE "ROBOT_ID" = \'' + rst[0].ROBOT_ID + '\'';

            db.connection(DB_USER, DB_PASSWORD, SQL_QUERY_UPDATE_ALLOCATION_FLAG_NO, function (rst1) {
                console.log("Updated the Allocation Flag by setting it to NO");
            });

            res.send('Releasing robot ' + rst[0].ROBOT_ID + ' corresponding to EWM Resource ' + req.params.EWMResourceID + ' to pool');
        }

    });

});

app.get('/moveRobotToBin/:BinID/:EWMResourceID', function (req, res) {

    var DB_USER = projectSettings.dbUser;
    var DB_PASSWORD = projectSettings.dbPassword;

    var SQL_QUERY_DETERMINE_ROBOTNAME_AND_VENDOR_CORRESPONDING_TO_EWM_RESOURCE = 'select B."ROBOT_VENDOR", B."ROBOT_NAME" from (select "ROBOT_ID" from "ROBOTICS"."SAP.EWM.ROBOT.MAPPING" where "RESOURCE_ID" = \'' + req.params.EWMResourceID + '\') as A inner join "ROBOTICS"."SAP.ROBOT.INVENTORY" as B on A."ROBOT_ID" = B."ROBOT_ID"'

    db.connection(DB_USER, DB_PASSWORD, SQL_QUERY_DETERMINE_ROBOTNAME_AND_VENDOR_CORRESPONDING_TO_EWM_RESOURCE, function (rst) {

        console.log("Identifying the fetch robot corresponding to EWM resource");

        if (rst != null) {
            console.log(rst);
            var RobotName = rst[0].ROBOT_NAME;
            var RobotVendor = rst[0].ROBOT_VENDOR;
            console.log("RobotName:  " + rst[0].ROBOT_NAME + " , RobotVendor: " + rst[0].ROBOT_VENDOR);
            res.send('Moving Robot ' + RobotName + ' of Vendor ' + RobotVendor + ' (associated with EWM Resource ' + req.params.EWMResourceID + ') to Bin ' + req.params.BinID);
            switch (RobotVendor) {
                case 'Fetch':
                    console.log("Calling Fetch implementation to move the robot to " + req.params.BinID);
                    fetchWrapperServices.moveRobotToBin(req.params.BinID, RobotName);
                    break;
                case 'Mir':
                    console.log("Calling Mir implementation to move the robot to " + req.params.BinID);
                    mirWrapperServices.moveRobotToBin(req.params.BinID, undefined, RobotName); //MissionName instead of undefined (to be changed) 
                    break;
                default:
                    console.log("No implementation yet for this vendor");
            }

        } else {
            console.log("No Robot Associated With Provided Resource");
            res.send('Cannot Move Robot since No Robot Associated With Provided Resource');
        }
    });
});

/**
 * The following part is for the robotic demo of Christian Warmuth
 */
app.get('/startDemo', function (req, res) {
    demo.startDemo(req.params.Site, req.params.WorkStation);
});