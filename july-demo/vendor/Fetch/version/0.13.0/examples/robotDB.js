'use strict';
 
/*
* @author xshao created 6/25/17
*/


/*  eslint no-console: 0*/
const FetchcoreClient = require('../src/FetchcoreClient');
const Robot           = require('../src/resources/robots/Robot');
const Task            = require('../src/resources/tasks/Task');
const NavigateAction  = require('../src/resources/tasks/actions/NavigateAction');
const axios           = require('axios');

const hdb             = require('hdb');

const db              = require('./db');
 
var express         = require('express'),
    app             = express(),
    PORT            = process.env.PORT || 2000,
    bodyParser      = require('body-parser'),
    path = require("path");
 
const hostname = 'sap.fetchcore-cloud.com';
const port = 443;
const enableSSL = true;
//const proxy = 'http://proxy.wdf.sap.corp:8080';
const proxy = '';


//FETCH 
const client = FetchcoreClient.defaultClient();
client.configure(hostname, port, enableSSL, proxy);
 
const username = 'sap@demo.com';
const password = 'robotslikesap';
 
// Start with authentication, log into your Fetchcore account
client.SAPAuthenticate(username, password)
    .then(() => {
        console.log('Authenticated');
    })
    .catch((clientError) => {
        console.log(clientError.toString());
    });


 

app.listen(PORT);



app.get('/hdb/', function(req, res){
  
  var DB_USER = 'i028948';
  var DB_PASSWORD = 'Sap12345';
  var SQL_QUERY = 'select RobotId,RobotVendor,PackingMaterialInEWM from "ROBOTICS"."EWM_ROBOT_MAPPING" where AllocationFlag = \'No\' LIMIT 1';


  db.connection(DB_USER, DB_PASSWORD,SQL_QUERY, function(rst){
        var records = rst;
        console.log("~ RST:  " + res.ROBOTID);

        res.send("ROBOTID:" + rst.ROBOTID + "    PackingMaterialInEWM: " + rst.PACKINGMATERIALINEWM);
    });
  
});

app.get('/moveRobotToBin/:Bin', function(req, res) {

        console.log(req.params.Bin)
        res.send('Moving Robot to Bin ' + req.params.Bin);

        setTimeout(() => {
        const navigateAction = new NavigateAction({
            inputs: { poseName: req.params.Bin }
        });
 
        const taskGoto = new Task({
            name: 'GOTO_EXAMPLE',
            requester: 'admin',
            actions: [navigateAction],
            status: 'NEW',
            robot: 'freight60',
            type: 'SIM'
        });
 
        taskGoto.save().then((task) => {
            console.log(task.name, 'has been successfully created!');
        }).catch((clientError) => {
            console.log(clientError.toString());
        });
    }, 2000);
        


});

app.get('/allocateFreeRobot/', function(req, res) {


        console.log("Allocating free robot");
        res.send('Allocating robot freight60');  
  
    }
);

app.get('/deallocateRobotToPool/', function(req, res) {

        console.log("Deallocating free robot");
        res.send('Releasing robot freight60 to pool');        
    }
);

app.use(bodyParser.json());

app.post('/sendHUToRobot/', function(req, res) {

        res.setHeader('Content-Type', 'application/text');
        
        res.send(
                "productName: " + req.body.productName + " ; HandlingUnit: " + req.body.handlingUnit
        );

        console.log('you posted: Product Name: ' + req.body.productName + ', Handling Unit: ' + req.body.handlingUnit);       
    }
);
