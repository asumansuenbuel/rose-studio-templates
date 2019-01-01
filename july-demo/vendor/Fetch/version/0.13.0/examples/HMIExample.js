'use strict';

/*  eslint no-console: 0*/
const FetchcoreClient  = require('../src/FetchcoreClient');
const Task             = require('../src/resources/tasks/Task');
const HMIButtonsAction = require('../src/resources/tasks/actions/HMIButtonsAction');

const hostname = 'localhost';
const port = 8000;

const client = FetchcoreClient.defaultClient();
client.configure(hostname, port);

// Start with authentication, log into your Fetchcore account
client.authenticate('fetch', 'robotics')
    .then(() => {
        console.log('Authenticated');
    })
    .catch((clientError) => {
        console.log(clientError.toString);
    });

setTimeout(() => {
    const buttonPress = new HMIButtonsAction();
    buttonPress.inputs = {
        buttonNames: ['Pose 1', 'Pose 2'],
        buttonsPerRow: 2,
        buttonDat: ['Navigate yourself to Pose 1', 'Navigate yourself to Pose 2']
    };

    const HMITask = new Task({
        name: 'HMI Button Mission',
        type: 'SIM',
        actions: [buttonPress],
        robot: 'freight0'
    });

    HMITask.save()
        .then((task) => {
            console.log(task);
        })
        .catch((clientError) => {
            console.log(clientError.toString());
        });
}, 1000);
