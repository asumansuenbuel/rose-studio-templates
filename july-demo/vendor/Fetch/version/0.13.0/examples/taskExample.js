'use strict';

/*  eslint no-console: 0*/
const FetchcoreClient = require('../src/FetchcoreClient');
const Task            = require('../src/resources/tasks/Task');
const UndockAction    = require('../src/resources/tasks/actions/UndockAction');

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
        console.log(clientError.toString());
    });

// Authentication is an asychronous process, we need to use setTimeout to give
// time for server to respond back with a login success

setTimeout(() => {
    Task.get(1).then((task) => {
        console.log(task.actions[0]);
    }).catch((clientError) => {
        console.log(clientError.toString());
    });

    Task.all(1).then((taskList) => {
        console.log('Task page 1');
        taskList.forEach((task) => {
            console.log(task.name);
        });
    }).catch((clientError) => {
        console.log(clientError.toString());
    });

    Task.all(2).then((taskList) => {
        console.log('Task page 2');
        taskList.forEach((task) => {
            console.log(task.name);
        });
    }).catch((clientError) => {
        console.log(clientError.toString());
    });

    Task.all(3).then((taskList) => {
        console.log('Task page 3');
        taskList.forEach((task) => {
            console.log(task.name);
        });
    }).catch((clientError) => {
        console.log(clientError.toString());
    });

    Task.allForRobot('freight255').then((taskList) => {
        console.log('Fetching tasks for freight255 => Task count:', taskList.length);
        taskList.forEach((task) => {
            console.log(`Task: ${task.name}`);
            task.actions.forEach((action) => {
                console.log(action.actionDefinition);
            });
        });
    }).catch((clientError) => {
        console.log(clientError.toString());
    });

    Task.allForRobot('freight256').then((taskList) => {
        console.log('Fetching tasks for freight256 => Task count:', taskList.length);
        taskList.forEach((task) => {
            console.log(`Task: ${task.name}`);
        });
    }).catch((clientError) => {
        console.log(clientError.toString());
    });


    Task.getWorkingTaskForRobot('freight255').then((taskList) => {
        console.log('freight255 is currently working on:');
        taskList.forEach((task) => {
            console.log(`Task: ${task.name}`);
        });
    });

    Task.getWorkingTaskForRobot('freight256').then((taskList) => {
        console.log('freight256 is currently working on:');
        taskList.forEach((task) => {
            console.log(`Task: ${task.name}`);
        });
    });

    // Create task
    const myNewTask = new Task({ name: 'Nadir', type: 'SIM' });
    const newAction = new UndockAction({
        inputs: {
            rotateInPlace: true
        }
    });
    myNewTask.actions = [newAction];
    console.log('myNewTask toJSON', myNewTask.toJSON());

    myNewTask.save().then((task) => {
        console.log(`Task ${task.id}: ${task.name} is saved`);
    })
    .catch((clientError) => {
        console.log(clientError.errorList);
    });
}, 1000);

const taskStreamCallback1 = (task) => {
    const str = `Calling CB #1 - Robot: ${task.robot} with task: ${task.name} - STATUS: ${task.status}`;
    console.log(str);
};

const taskStreamCallback2 = (task) => {
    const str = `Calling CB #2 - Robot: ${task.robot} with task: ${task.name} - STATUS: ${task.status}`;
    console.log(str);
};

const taskStreamCallback3 = (task) => {
    const str = `Calling CB #3 - Robot: ${task.robot} with task: ${task.name} - STATUS: ${task.status}`;
    console.log(str);
};

setTimeout(() => {
    Task.subscribeTo('freight255', taskStreamCallback1);

    Task.subscribeTo('freight255', taskStreamCallback2);

    Task.subscribeToAll(taskStreamCallback3);
}, 1000);

setTimeout(() => {
    console.log('Unsubscribing to callback #1');
    Task.unsubscribeTo('freight255', taskStreamCallback1);
}, 10000);

setTimeout(() => {
    console.log('Unsubscribing to callback #2');
    Task.unsubscribeTo('freight255', taskStreamCallback2);
}, 15000);

setTimeout(() => {
    console.log('Unsubscribing to callback #3');
    Task.unsubscribeToAll(taskStreamCallback3);
}, 20000);

setTimeout(() => {
    Task.subscribeTo('freight255', taskStreamCallback1);
}, 21000);
