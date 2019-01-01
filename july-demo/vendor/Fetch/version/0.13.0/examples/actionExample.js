'use strict';

/*  eslint no-console: 0*/
const FetchcoreClient = require('../src/FetchcoreClient');
const Task            = require('../src/resources/tasks/Task');

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

const taskId = 124;
setTimeout(() => {
    Task.get(taskId)
        .then((task) => {
            console.log(`Number of actions in Task ${taskId}:`, task.actions.length);

            const buttonAction = task.actions[0];

            console.log(buttonAction.inputs.buttonData);
            buttonAction.outputs = {
                buttonReturn: '1'
            };

            buttonAction.status = 'COMPLETE';
            buttonAction.update()
                .then((updatedAction) => {
                    console.log('Successfully updated HMI buttonAction', updatedAction);
                })
                .catch((clientError) => {
                    console.log(clientError.toString());
                });
            console.log(buttonAction);
        })
        .catch((clientError) => {
            console.log(clientError.toString());
        });
}, 1000);
