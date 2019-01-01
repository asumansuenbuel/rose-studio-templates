'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 * @author Nadir Muzaffar
 */

// Fetch imports

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FetchcoreClient = require('../../FetchcoreClient');
var assignDefined = require('../../utilities/assignDefined');
var ActionDefinition = require('../../utilities/enums').ActionDefinition;
var TaskStatus = require('../../utilities/enums').TaskStatus;

var Action = require('./Action');
var NavigateAction = require('./actions/NavigateAction');
var DockAction = require('./actions/DockAction');
var UndockAction = require('./actions/UndockAction');
var HMIButtonsAction = require('./actions/HMIButtonsAction');
var LocalizeAction = require('./actions/LocalizeAction');
var WaitForAction = require('./actions/WaitForAction');
var BuildMapAction = require('./actions/BuildMapAction');
var URLAction = require('./actions/URLAction');

var TASK_STREAM_ENDPOINT = function TASK_STREAM_ENDPOINT(robotName) {
    if (robotName) {
        return '/api/v1/streams/tasks/' + robotName + '/';
    }
    return '/api/v1/streams/tasks/';
};

var Task = function () {
    _createClass(Task, null, [{
        key: 'createTaskList',


        /**
         * Converts JSON data into a list of Task resource object
         * @param {JSON} responseData The data coming from server response
         * @return {Array} taskList
         */
        value: function createTaskList(responseData) {
            var taskList = [];
            responseData.results.forEach(function (data) {
                var newTask = new Task();
                newTask.parse(data);
                taskList.push(newTask);
            });
            return taskList;
        }

        /**
         * Converts JSON into a Task resource object
         * @param {JSON} res The response of server
         * @return {Task} newTask
         */

    }, {
        key: 'handleResponse',
        value: function handleResponse(response) {
            if (response.data.count !== undefined) {
                return Task.createTaskList(response.data);
            }

            var newTask = new Task();
            newTask.parse(response.data);
            return newTask;
        }

        /**
         * Throws a custom error
         * @param {ClientError} clientError The client error coming from defaultClient object
         * @throws {ClientError} clientError
         */

    }, {
        key: 'handleError',
        value: function handleError(clientError) {
            // We have the option to attach more attributes to this object before throwing it
            throw clientError;
        }

        /**
         * Gets task from the server
         * @param {Number} taskId Id of an existing task on the server
         * @return {Promise.<Task>} When promise resolves, it will return a Task resource object
         */

    }, {
        key: 'get',
        value: function get(taskId) {
            var client = FetchcoreClient.defaultClient();
            if (taskId == null) {
                return;
            }
            return client.get(Task.ENDPOINT, taskId).then(Task.handleResponse).catch(Task.handleError);
        }

        /**
         * Gets all tasks from the server
         * @param {Number} pageNumber Page number for the paginated list of Tasks
         * @return {Promise.<Array>} When promise resolves, it will return a list of Task resource objects
         */

    }, {
        key: 'all',
        value: function all(pageNumber) {
            var client = FetchcoreClient.defaultClient();
            var params = {
                page: pageNumber
            };
            return client.get(Task.ENDPOINT, undefined, params).then(Task.handleResponse).catch(Task.handleError);
        }

        /**
         * Gets all the tasks that were assigned to a specific robot, this should mirror Task.all() method except for a
         * specific robot
         * @param {String} robotName Name of a robot, e.g. freight255
         * @return {Promise.<Array>} When promise resolves, it will return a list of Task resource objects
         */

    }, {
        key: 'allForRobot',
        value: function allForRobot(robotName) {
            return Task.getByStatusForRobot(robotName);
        }

        /**
         * Gets all the working tasks that were assigned to a specific robot, it should return an array of size one because
         * robot can only be working on one task at a time
         * @param {String} robotName Name of a robot, e.g. freight255
         * @return {Promise.<Array>} When promise resolves, it will return a list of Task resource objects
         */

    }, {
        key: 'getWorkingTaskForRobot',
        value: function getWorkingTaskForRobot(robotName) {
            return Task.getByStatusForRobot(robotName, TaskStatus.WORKING);
        }

        /**
         * Gets all tasks that were assigned to a specific robot and currently are in a particular status, if no status is
         * provided, all the tasks that are belonging to the robot will returned
         * @param {String} robotName Name of a robot, e.g. freight255
         * @param {String} status Status of a task, e.g. WORKING, NEW, COMPLETE, and etc...
         * @return {Promise.<Array>} When promise resolves, it will return a list of Task resource objects
         */

    }, {
        key: 'getByStatusForRobot',
        value: function getByStatusForRobot(robotName, status) {
            var client = FetchcoreClient.defaultClient();

            var endpoint = void 0;
            if (status) {
                endpoint = 'api/v1/robots/' + robotName + '/tasks/' + status + '/';
            } else {
                endpoint = 'api/v1/robots/' + robotName + '/tasks/';
            }

            return client.get(endpoint).then(Task.handleResponse).catch(Task.handleError);
        }

        /**
         * Subscribes to Task updates of a particular Robot with a callback and receives all the updates through web socket stream
         * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'subscribeTo',
        value: function subscribeTo(robotName, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = TASK_STREAM_ENDPOINT(robotName);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.task') {
                    var newTask = new Task();
                    newTask.parse(messageData.payload.data);
                    return newTask;
                }
            });
        }

        /**
         * Unsubscribes to the tasks of a particular robot through the callback that was previously submitted for
         * subscription
         * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'unsubscribeTo',
        value: function unsubscribeTo(robotName, handleStreamMessage) {
            FetchcoreClient.defaultClient().unsubscribe(TASK_STREAM_ENDPOINT(robotName), handleStreamMessage);
        }

        /**
         * Subscribes to all tasks with a callback and receives all the updates through data stream
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'subscribeToAll',
        value: function subscribeToAll(handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = TASK_STREAM_ENDPOINT();
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.task') {
                    var newTask = new Task();
                    newTask.parse(messageData.payload.data);
                    return newTask;
                }
            });
        }

        /**
         * Unsubscribes to all tasks through the callback that was previously submitted for subscription
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'unsubscribeToAll',
        value: function unsubscribeToAll(handleStreamMessage) {
            FetchcoreClient.defaultClient().unsubscribe(TASK_STREAM_ENDPOINT(), handleStreamMessage);
        }
    }, {
        key: 'parseActions',
        value: function parseActions(actionJSONs) {
            return actionJSONs.map(function (actionJSON) {
                var action = void 0;
                switch (actionJSON.action_definition) {
                    case ActionDefinition.DOCK:
                        action = new DockAction();
                        break;

                    case ActionDefinition.UNDOCK:
                        action = new UndockAction();
                        break;

                    case ActionDefinition.NAVIGATE:
                        action = new NavigateAction();
                        break;

                    case ActionDefinition.BUILDMAP:
                        action = new BuildMapAction();
                        break;

                    case ActionDefinition.LOCALIZE:
                        action = new LocalizeAction();
                        break;

                    case ActionDefinition.WAITFOR:
                        action = new WaitForAction();
                        break;

                    case ActionDefinition.HMI_BUTTONS:
                        action = new HMIButtonsAction();
                        break;

                    case ActionDefinition.URL:
                        action = new URLAction();
                        break;

                    default:
                        action = new Action();
                        break;
                }
                action.parse(actionJSON);
                return action;
            });
        }
    }, {
        key: 'actionsToJSON',
        value: function actionsToJSON(actions) {
            if (actions) {
                return actions.map(function (action) {
                    return action.toJSON();
                });
            }

            return actions;
        }

        /**
         * Creates an instance of Task resource object
         * @constructor
         * @param {JSON} newProps New properties of a new Task
         * @param {String} [newProps.status] Status of this task - NEW, QUEUED, WORKING, PREEMPTED, COMPLETE, CANCELED,
         * FAILED
         * @param {String} newProps.name Human readable name for this task
         * @param {Integer} [newProps.taskTemplate] ID of the task template that this task belongs to
         * @param {Integer} [newProps.schedule] ID of the schedule that generated this task if any
         * @param {String} [newProps.robot] Name of the robot that is assigned to this task
         * @param {Array.<Action>} newProps.actions List of actions that this task should carry out
         * @param {String} [newProps.requester] The email address of the user that requested this task, if any
         * @param {String} newProps.type The type association of this task
         */

    }, {
        key: 'ENDPOINT',

        /**
         * Returns the server endpoint for task data
         * @return {String} TASK_ENDPOINT
         */
        get: function get() {
            return 'api/v1/tasks/';
        }
    }, {
        key: 'defaultProps',
        get: function get() {
            return {
                status: 'NEW',
                actions: []
            };
        }
    }]);

    function Task() {
        var newProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Object.create(null);

        _classCallCheck(this, Task);

        this.props = Object.create(null);
        this.updatedProps = assignDefined(Object.create(null), Task.defaultProps, newProps);
    }

    _createClass(Task, [{
        key: 'parse',
        value: function parse() {
            var resourceJSON = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.props = {
                status: resourceJSON.status,
                modified: resourceJSON.modified,
                name: resourceJSON.name,
                parent: resourceJSON.parent,
                created: resourceJSON.created,
                taskTemplate: resourceJSON.task_template,
                schedule: resourceJSON.schedule,
                robot: resourceJSON.robot,
                actions: resourceJSON.actions ? Task.parseActions(resourceJSON.actions) : resourceJSON.actions,
                id: resourceJSON.id,
                requester: resourceJSON.requester,
                type: resourceJSON.type,
                children: resourceJSON.children
            };

            this.updatedProps = Object.create(null);
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var isPatch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var JSON = void 0;
            if (isPatch) {
                JSON = {
                    status: this.updatedProps.status,
                    name: this.updatedProps.name,
                    parent: this.updatedProps.parent,
                    task_template: this.updatedProps.taskTemplate,
                    schedule: this.updatedProps.schedule,
                    robot: this.updatedProps.robot,
                    actions: Task.actionsToJSON(this.updatedProps.actions),
                    requester: this.updatedProps.requester,
                    type: this.updatedProps.type,
                    children: this.updatedProps.children
                };
            } else {
                var props = assignDefined(this.props, this.updatedProps);
                JSON = {
                    status: props.status,
                    name: props.name,
                    parent: props.parent,
                    task_template: props.taskTemplate,
                    schedule: props.schedule,
                    robot: props.robot,
                    actions: Task.actionsToJSON(props.actions),
                    requester: props.requester,
                    type: props.type,
                    children: props.children
                };
            }

            return assignDefined(Object.create(null), JSON);
        }

        /**
         * Saves task to the server
         * @this Task
         * @return {Promise.<Task>} When promise resolves, it will return a Task resource object
         */

    }, {
        key: 'save',
        value: function save() {
            var client = FetchcoreClient.defaultClient();
            var data = this.toJSON();

            if (this.isNew()) {
                return client.post(Task.ENDPOINT, data).then(Task.handleResponse).catch(Task.handleError);
            }

            return client.put(Task.ENDPOINT, this.id, data).then(Task.handleResponse).catch(Task.handleError);
        }

        /**
         * Updates attributes of task on server
         * @this Task
         * @return {Promise.<Task>} When promise resolves, it will return an updated Task resource object
         */

    }, {
        key: 'update',
        value: function update() {
            var client = FetchcoreClient.defaultClient();
            var data = this.toJSON(true);
            return client.patch(Task.ENDPOINT, this.id, data).then(Task.handleResponse).catch(Task.handleError);
        }

        /**
         * Checks if a Task instance is new
         * @this Task
         * @return {Boolean} isNew
         */

    }, {
        key: 'isNew',
        value: function isNew() {
            return this.id == null;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'status',
        get: function get() {
            if (this.updatedProps.status) {
                return this.updatedProps.status;
            }
            return this.props.status;
        },
        set: function set(value) {
            this.updatedProps.status = value;
        }

        /**
        * @type {String}
        */

    }, {
        key: 'name',
        get: function get() {
            if (this.updatedProps.name) {
                return this.updatedProps.name;
            }
            return this.props.name;
        },
        set: function set(value) {
            this.updatedProps.name = value;
        }

        /**
        * @type {String}
        */

    }, {
        key: 'parent',
        get: function get() {
            if (this.updatedProps.parent) {
                return this.updatedProps.parent;
            }
            return this.props.parent;
        },
        set: function set(value) {
            this.updatedProps.parent = value;
        }

        /**
        * @type {Number}
        */

    }, {
        key: 'taskTemplate',
        get: function get() {
            if (this.updatedProps.taskTemplate) {
                return this.updatedProps.taskTemplate;
            }
            return this.props.taskTemplate;
        },
        set: function set(value) {
            this.updatedProps.taskTemplate = value;
        }

        /**
        * @type {Number}
        */

    }, {
        key: 'schedule',
        get: function get() {
            if (this.updatedProps.schedule) {
                return this.updatedProps.schedule;
            }
            return this.props.schedule;
        },
        set: function set(value) {
            this.updatedProps.schedule = value;
        }

        /**
        * @type {String}
        */

    }, {
        key: 'robot',
        get: function get() {
            if (this.updatedProps.robot) {
                return this.updatedProps.robot;
            }
            return this.props.robot;
        },
        set: function set(value) {
            this.updatedProps.robot = value;
        }

        /**
        * @type {Array.<Action>}
        */

    }, {
        key: 'actions',
        get: function get() {
            if (this.updatedProps.actions) {
                return this.updatedProps.actions;
            }
            return this.props.actions;
        },
        set: function set(value) {
            this.updatedProps.actions = value;
        }

        /**
        * @type {String}
        */

    }, {
        key: 'requester',
        get: function get() {
            if (this.updatedProps.requester) {
                return this.updatedProps.requester;
            }
            return this.props.requester;
        },
        set: function set(value) {
            this.updatedProps.requester = value;
        }

        /**
        * @type {String}
        */

    }, {
        key: 'type',
        get: function get() {
            if (this.updatedProps.type) {
                return this.updatedProps.type;
            }
            return this.props.type;
        },
        set: function set(value) {
            this.updatedProps.type = value;
        }

        /**
        * @type {Array}
        */

    }, {
        key: 'children',
        get: function get() {
            if (this.updatedProps.children) {
                return this.updatedProps.children;
            }
            return this.props.children;
        },
        set: function set(value) {
            this.updatedProps.children = value;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'modified',
        get: function get() {
            return this.props.modified;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'created',
        get: function get() {
            return this.props.created;
        }

        /**
        * @type {Number}
        */

    }, {
        key: 'id',
        get: function get() {
            return this.props.id;
        }
    }]);

    return Task;
}();

module.exports = Task;