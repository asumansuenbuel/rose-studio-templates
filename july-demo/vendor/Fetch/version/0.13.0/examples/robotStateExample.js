'use strict';

/*  eslint no-console: 0*/
const FetchcoreClient = require('../src/FetchcoreClient');
const RobotState      = require('../src/resources/robots/RobotState');

const hostname = 'localhost';
const port = 8000;

const client = FetchcoreClient.defaultClient();

// Apparently eslint-plugin-brackets has dependency on lodash
client.configure(hostname, port);
client.authenticate('fetch', 'robotics')
.then(() => {
    console.log('Authenticated');
})
.catch((clientError) => {
    console.log(clientError.toString);
});

const robotStateStreamCallback1 = (robotState) => {
    console.log('RobotState callback #1 with', robotState.robot);
};

const robotStateStreamCallback2 = (robotState) => {
    console.log('RobotState callback #2 with', robotState.robot);
};

const robotStateStreamCallback3 = (robotState) => {
    console.log('RobotState callback #3 with', robotState.robot);
};

setTimeout(() => {
    RobotState.all().then((robotStates) => {
        robotStates.forEach((robotState) => {
            console.log(robotState);
        });
    }).catch((clientError) => {
        console.log(clientError.toString);
    });

    RobotState.subscribeTo('freight255', robotStateStreamCallback1);

    RobotState.subscribeTo('freight255', robotStateStreamCallback2);

    RobotState.subscribeToAll(robotStateStreamCallback3);
}, 1000);

setTimeout(() => {
    console.log('Unsubscribing to callback #1');
    RobotState.unsubscribeTo('freight255', robotStateStreamCallback1);
}, 3000);

setTimeout(() => {
    console.log('Unsubscribing to callback #2');
    RobotState.unsubscribeTo('freight255', robotStateStreamCallback2);
}, 4000);

setTimeout(() => {
    console.log('Unsubscribing to callback #3');
    RobotState.unsubscribeToAll(robotStateStreamCallback3);
}, 7000);
