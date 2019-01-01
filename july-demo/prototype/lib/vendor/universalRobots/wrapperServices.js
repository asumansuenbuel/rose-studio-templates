/*
 *  @author: Christian Warmuth
 *  @version: 1.0, 7/9/2018 
 */

'use strict'

const net = require('net');
const processScript = require("../../../config/vendor/UR.ProcessScript"); //For the future, it would be worth considering what file format process scripts are in


const HOST = '';
const PORT = 8880;

/**
 * Loads Script with the name, the ID and the number of steps (and associated names)
 */
function loadProcessScript() {
    let process1 = processScript.process1;
    let name = process1.name;
    let id = process1.id;
    console.log("----------------- Execute Process script: ", name, " id: ", id, " -----------------------------------------");
    return process1.steps;
}

/**
 * Establishes a Connection, and processes the defined Steps (the UR is already programmed and the steps are ready to be executed and the robot in "idle")
 * @param {array} scriptList 
 * @param {function} callback 
 */
function establishConnection(scriptList, callback) {
    let server = net.createServer();
    server.on('connection', function (sock) {
        console.log('Connection opened: ' + sock.remoteAddress + ' : ' + sock.remotePort);
        let dataText = "PREPARE";

        sock.on('end', function (end) {
            callback(null, "Robot ended connection");
        });
        sock.on('data', function (data) {
            console.log('DATA recieved: ' + sock.remoteAddress + ': ' + data);
            dataHandler(data, function (err, result) {
                if (err) {
                    server.close();
                    console.log("Robot Problem: Mission Aborted")
                    console.log(err.message);
                }
                if (result === 1) {
                    let nextStep = scriptList.shift();
                    console.log("Started with step- : ", nextStep.name);
                    sock.write("RECIEVED", "utf-8")
                }
                if (result === 2) {
                    let nextStep = scriptList.shift();
                    console.log("Continued with Step-: ", nextStep.name);
                    sock.write("RECIEVED", "utf-8")
                }
                if (result === 4) {
                    if (scriptList.length === 0) {
                        console.log("Process finished");
                        server.close();
                        callback(null, "Finished"); /// is that correct?

                    }
                    else { callback(new Error("Process Script does not match the robots tasks"), null); }

                }
            });
        });
        sock.write(dataText, "utf-8")


    });
    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.log('Address in use, retrying...');
            setTimeout(() => {
                server.close();
            }, 10000);
        }
    });
    server.on('end', function (data) {
        console.log('Connection closed: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });


    server.listen(PORT, HOST);
    console.log('Server listening on ' + HOST + ':' + PORT);

}

function dataHandler(inputString, callback) {
    //console.log(inputString.toString());
    switch (inputString.toString()) {
        case "STARTED":
            console.log('Robot Started');
            callback(null, 1);
            break;
        case "CONTINUED":
            console.log('Robot Continued');
            callback(null, 2);
            break;
        case "ENDED":                       //Difference between Finish and End: End indicates the End of a task, Finish indicates that the whole process is finished
            console.log('Robot Ended');
            callback(null, 3);
            break;
        case "FINISHED":
            console.log('Robot Ended');
            callback(null, 4);
            break;
        case "READY":
            console.log('Robot Ready');
            callback(null, 5);
            break;
        case "PROBLEM":
            console.log('Robot Problem');
            callback(null, 6);
            break;
        default:
            console.log('Invalid response from Robot: ' + inputString);
            callback(new Error(inputString), null);
            break;
    }
}
module.exports = {
    /**
     *  Starts the predefined robot tasks on the UR
     *  @param {function} callback 
     */
    performRobotTask: function (callback) {
        let scriptList = loadProcessScript();
        establishConnection(scriptList, (err, result) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, 1);
        });
    }

}
