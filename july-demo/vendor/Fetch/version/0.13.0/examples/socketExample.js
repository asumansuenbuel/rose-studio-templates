'use strict';

/*  eslint no-console: 0*/
const FetchcoreClient = require('../src/FetchcoreClient');
const FetchSocket     = require('../src/FetchSocket.js');

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

let ws;
setTimeout(() => {
    let streamUrl = `ws://${hostname}:${port}`;
    streamUrl += `/api/v1/streams/robots/?token=${client.token}`;

    const handleSocketMessage = (message) => {
        console.log(message.data);
    };

    ws = new FetchSocket(streamUrl, { onSocketMessage: handleSocketMessage });
    ws.connect();
}, 2000);

// A robot must exist, e.g. freight255 in this case, before sending robot state updates
setTimeout(() => {
    const upstreamMessage = {
        payload: {
            action: 'update',
            data: {
                battery_level: 0.50,
                localization_weight: null,
                robot: 'freight255',
                current_pose: {
                    x: 0,
                    y: 1,
                    theta: 0
                },
                wifi_strength: 0.50,
            }
        },
        stream: 'robot-states'
    };
    ws.send(JSON.stringify(upstreamMessage));
    console.log('Message sent');
}, 3000);
