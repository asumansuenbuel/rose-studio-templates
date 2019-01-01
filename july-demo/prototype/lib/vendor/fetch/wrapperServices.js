/*
* @author Naomi Shao, Suneet Agera, Christian Warmuth
*/


'use strict';

/* Vendor - Fetch libraries */
const FetchcoreClient = require('../../../../vendor/Fetch/version/0.13.0/src/FetchcoreClient');
const Robot           = require('../../../../vendor/Fetch/version/0.13.0/src/resources/robots/Robot');
const Task            = require('../../../../vendor/Fetch/version/0.13.0/src/resources/tasks/Task');
const NavigateAction  = require('../../../../vendor/Fetch/version/0.13.0/src/resources/tasks/actions/NavigateAction');

/* Configuration libraries    */
var projectSettingsFetch = require('../../../config/vendor/Fetch.ProjectSettings');

/* Fetch specific variables    */
var hostname = projectSettingsFetch.vendor_cloud_hostname; 
var port = projectSettingsFetch.vendor_cloud_port;
var enableSSL = projectSettingsFetch.vendor_cloud_enableSSL;
var proxy = projectSettingsFetch.vendor_cloud_proxy;
var username = projectSettingsFetch.vendor_cloud_username;
var password = projectSettingsFetch.vendor_cloud_password;


module.exports = {

  moveRobotToBin : function(BinID,RobotName) {

    var fetchClient = FetchcoreClient.defaultClient();
    fetchClient.configure(hostname, port, enableSSL, proxy);

    // Start with authentication, log into the Fetchcore account

    fetchClient.SAPAuthenticate(username,password).then(() => {
        console.log('Authenticated against Fetch Cloud');
    })
    .catch((clientError) => {
        console.log(clientError.toString());
    }); 

    // The below implementation needs to be redone using promises. Right now the set timeout is a crude hack to handle the async nature of logging into Fetch Cloud

    setTimeout(() => {

      console.log("Bin ID: " + BinID);

      //Create a Navigate Action

      var navigateAction = new NavigateAction({
        inputs: { poseName: BinID }
      });

      //Create a new task of type GoTo with the above created action

      var taskGoto = new Task({
        name: 'GOTO_EXAMPLE',
        requester: 'admin',
        actions: [navigateAction],
        status: 'NEW',
        robot: RobotName,
        type: 'SIM'
      });

      //Save and queue the task in FetchCore

      taskGoto.save().then((task) => {
        console.log(task.name, 'has been successfully created!');
      }).catch((clientError) => {
        console.log(clientError.toString());
      });

     }, 2000);
  }
}
