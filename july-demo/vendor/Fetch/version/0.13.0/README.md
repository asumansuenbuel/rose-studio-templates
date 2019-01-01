# Fetchcore Asynchronous JavaScript SDK

## Introduction
`fetchcorejs` is a JavaScript SDK built on top of Fetchcore. It enables consumers to interact with Fetchcore with ease.
All HTTP requests to the server for resources such as annotation data, map, robot and robot state data, task data, and etc,
can be handled by this SDK. This tool serves to lower the barrier of entry for third-party integrators. Consumers may easily
build new UI components and front end features on top of Fetchcore.

## Usage

### Authentication
In order to access resources on Fetchcore server, consumer must first authenticate his/her credentials. For example, using
ES5 syntax

```javascript
var FetchcoreClient = require('fetchcore-sdk').FetchcoreClient;

var hostname = 'localhost';
var port = 8000;
var client = FetchcoreClient.defaultClient();

client.configure(hostname, port);

client.authenticate('admin@admin.com', 'admin')
    .then(function() {
        // Authentication is successful
    })
    .catch(function(clientError) {
        // Failed
    });
```

### Fetching sources
This is an asynchronous SDK, it is completely promise-based.

For example, we want a particular robot, we can call `get()` which is a static method of `Robot` class.

```javascript
// Assuming that you have already authenticated

var Robot = require('fetchcore-sdk').Robot;

var freight5;
Robot.get('freight5')
    .then(function(robot) {
        freight5 = robot;
    })
    .catch(function(clientError) {
        // Report error
    });
```
Or maybe we want all robots, then we can simply call `all()`

```javascript
Robot.all()
    .then(function(robots) {
        robots.forEach(function(robot) {
            // do something to each robot...
        })
    })
    .catch(function(clientError) {
        // Report error
    });
```

### Creating, and updating resources
For creating new resources, we can use `save()`. It does a `POST` request to the server.
```javascript
var Task = require('fetchcore-sdk').Task;

var newTask = Task({
    name: 'Recharge battery',
    actions: [],
    robot: 'freight5',
    status: 'NEW',
    type: 'SIM'
});

newTask.save()
    .then(function(task) {
        // Save is sucessful
    })
    .catch(function(clientError) {
        // Report Error
    });
```

However, if the resource already exists on the server, it will do a `PUT` instead.

For example,
```javascript
Task.get(1)
    .then(function(fetchedTask) {
        // fetchedTask.status => 'NEW'
        fetchedTask.status = 'WORKING'
        fetchedTask.save()
            .then(function(updatedTask) {
                // Update is successful
            })
            .catch(function(clientError) {
                // Report error
            });
    })
    .catch(function(clientError) {
        // Report error
    });
```

### WebSocket Subscription
A lot of live data from Fetchcore is delivered by web socket stream, thus our JavaScript SDK also provides subscription
functionality.

The state of robot is constantly being updated, such as its position, its current task, and its status (battery level,
wifi strength, and etc...) Consumer may subscribe to `RobotState` to receive live updates.

```javascript
var RobotState = require('fetchcore-sdk').RobotState;

var handleUpdate = function(robotState) {
    // Do something with robotState
}

RobotState.subscribeTo('freight5', handleUpdate);
```

If we wish to unsubscribe, then simply call `unsubscribeTo`

```javascript
RobotState.unsubscribeTo('freight5', handleUpdate);
```

We can also subscribe to all robots

```javascript
RobotState.subscribeToAll(handleUpdate);

// Or

RobotState.unsubscribeToAll(handleUpdate);
```
