'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 * @author Nadir Muzaffar
 */

// Fetch imports
const FetchcoreClient = require('../../FetchcoreClient');
const assignDefined = require('../../utilities/assignDefined');
const ActionDefinition = require('../../utilities/enums').ActionDefinition;
const TaskStatus = require('../../utilities/enums').TaskStatus;

const Action = require('./Action');
const NavigateAction = require('./actions/NavigateAction');
const DockAction = require('./actions/DockAction');
const UndockAction = require('./actions/UndockAction');
const HMIButtonsAction = require('./actions/HMIButtonsAction');
const LocalizeAction = require('./actions/LocalizeAction');
const WaitForAction = require('./actions/WaitForAction');
const BuildMapAction = require('./actions/BuildMapAction');
const URLAction = require('./actions/URLAction');

const TASK_STREAM_ENDPOINT = (robotName) => {
    if (robotName) {
        return `/api/v1/streams/tasks/${robotName}/`;
    }
    return '/api/v1/streams/tasks/';
};

class Task {
    /**
     * Returns the server endpoint for task data
     * @return {String} TASK_ENDPOINT
     */
    static get ENDPOINT() {
        return 'api/v1/tasks/';
    }

    /**
     * Converts JSON data into a list of Task resource object
     * @param {JSON} responseData The data coming from server response
     * @return {Array} taskList
     */
    static createTaskList(responseData) {
        const taskList = [];
        responseData.results.forEach((data) => {
            const newTask = new Task();
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
    static handleResponse(res) {
        if (res.count) {
            return Task.createTaskList(res);
        }

        const newTask = new Task();
        newTask.parse(res);
        return newTask;
    }

    /**
     * Throws a custom error
     * @param {ClientError} clientError The client error coming from defaultClient object
     * @throws {ClientError} clientError
     */
    static handleError(clientError) {
        // We have the option to attach more attributes to this object before throwing it
        throw clientError;
    }

    /**
     * Gets task from the server
     * @param {Number} taskId Id of an existing task on the server
     * @return {Promise.<Task>} When promise resolves, it will return a Task resource object
     */
    static get(taskId) {
        const client = FetchcoreClient.defaultClient();
        if (taskId == null) {
            return;
        }
        return client
                .get(Task.ENDPOINT, taskId)
                .then(Task.handleResponse)
                .catch(Task.handleError);
    }

    /**
     * Gets all tasks from the server
     * @param {Number} pageNumber Page number for the paginated list of Tasks
     * @return {Promise.<Array>} When promise resolves, it will return a list of Task resource objects
     */
    static all(pageNumber) {
        const client = FetchcoreClient.defaultClient();
        const params = {
            page: pageNumber
        };
        return client
                .get(Task.ENDPOINT, undefined, params)
                .then(Task.handleResponse)
                .catch(Task.handleError);
    }

    /**
     * Gets all the tasks that were assigned to a specific robot, this should mirror Task.all() method except for a
     * specific robot
     * @param {String} robotName Name of a robot, e.g. freight255
     * @return {Promise.<Array>} When promise resolves, it will return a list of Task resource objects
     */
    static allForRobot(robotName) {
        return Task.getByStatusForRobot(robotName);
    }

    /**
     * Gets all the working tasks that were assigned to a specific robot, it should return an array of size one because
     * robot can only be working on one task at a time
     * @param {String} robotName Name of a robot, e.g. freight255
     * @return {Promise.<Array>} When promise resolves, it will return a list of Task resource objects
     */
    static getWorkingTaskForRobot(robotName) {
        return Task.getByStatusForRobot(robotName, TaskStatus.WORKING);
    }

    /**
     * Gets all tasks that were assigned to a specific robot and currently are in a particular status, if no status is
     * provided, all the tasks that are belonging to the robot will returned
     * @param {String} robotName Name of a robot, e.g. freight255
     * @param {String} status Status of a task, e.g. WORKING, NEW, COMPLETE, and etc...
     * @return {Promise.<Array>} When promise resolves, it will return a list of Task resource objects
     */
    static getByStatusForRobot(robotName, status) {
        const client = FetchcoreClient.defaultClient();

        let endpoint;
        if (status) {
            endpoint = `api/v1/robots/${robotName}/tasks/${status}/`;
        } else {
            endpoint = `api/v1/robots/${robotName}/tasks/`;
        }

        return client
                .get(endpoint)
                .then(Task.handleResponse)
                .catch(Task.handleError);
    }

    /**
     * Subscribes to Task updates of a particular Robot with a callback and receives all the updates through web socket stream
     * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static subscribeTo(robotName, handleStreamMessage) {
        const client = FetchcoreClient.defaultClient();
        const endpoint = TASK_STREAM_ENDPOINT(robotName);
        client.subscribe(endpoint, handleStreamMessage, (message) => {
            const messageData = JSON.parse(message.data);
            if (messageData.payload.model === 'api.task') {
                const newTask = new Task();
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
    static unsubscribeTo(robotName, handleStreamMessage) {
        FetchcoreClient.defaultClient().unsubscribe(
            TASK_STREAM_ENDPOINT(robotName),
            handleStreamMessage
        );
    }

    /**
     * Subscribes to all tasks with a callback and receives all the updates through data stream
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static subscribeToAll(handleStreamMessage) {
        const client = FetchcoreClient.defaultClient();
        const endpoint = TASK_STREAM_ENDPOINT();
        client.subscribe(endpoint, handleStreamMessage, (message) => {
            const messageData = JSON.parse(message.data);
            if (messageData.payload.model === 'api.task') {
                const newTask = new Task();
                newTask.parse(messageData.payload.data);
                return newTask;
            }
        });
    }

    /**
     * Unsubscribes to all tasks through the callback that was previously submitted for subscription
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static unsubscribeToAll(handleStreamMessage) {
        FetchcoreClient.defaultClient().unsubscribe(
            TASK_STREAM_ENDPOINT(),
            handleStreamMessage
        );
    }

    static get defaultProps() {
        return {
            status: 'NEW',
            actions: []
        };
    }

    static parseActions(actionJSONs) {
        return actionJSONs.map((actionJSON) => {
            let action;
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

    static actionsToJSON(actions) {
        if (actions) {
            return actions.map((action) => {
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
    constructor(newProps = Object.create(null)) {
        this.props = Object.create(null);
        this.updatedProps = assignDefined(Object.create(null), Task.defaultProps, newProps);
    }

    parse(resourceJSON = {}) {
        this.props =  {
            status: resourceJSON.status,
            modified: resourceJSON.modified,
            name: resourceJSON.name,
            parent: resourceJSON.parent,
            created: resourceJSON.created,
            taskTemplate: resourceJSON.task_template,
            schedule: resourceJSON.schedule,
            robot: resourceJSON.robot,
            actions: resourceJSON.actions
                ? Task.parseActions(resourceJSON.actions)
                : resourceJSON.actions,
            id: resourceJSON.id,
            requester: resourceJSON.requester,
            type: resourceJSON.type,
            children: resourceJSON.children
        };

        this.updatedProps = Object.create(null);
    }

    toJSON(isPatch = false) {
        let JSON;
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
                children: this.updatedProps.children,
            };
        } else {
            const props = assignDefined(this.props, this.updatedProps);
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
    save() {
        const client = FetchcoreClient.defaultClient();
        const data = this.toJSON();

        if (this.isNew()) {
            return client
                    .post(Task.ENDPOINT, data)
                    .then(Task.handleResponse)
                    .catch(Task.handleError);
        }

        return client
                .put(Task.ENDPOINT, this.id, data)
                .then(Task.handleResponse)
                .catch(Task.handleError);
    }

    /**
     * Updates attributes of task on server
     * @this Task
     * @return {Promise.<Task>} When promise resolves, it will return an updated Task resource object
     */
    update() {
        const client = FetchcoreClient.defaultClient();
        const data = this.toJSON(true);
        return client.patch(Task.ENDPOINT, this.id, data)
                .then(Task.handleResponse)
                .catch(Task.handleError);
    }

    /**
     * Checks if a Task instance is new
     * @this Task
     * @return {Boolean} isNew
     */
    isNew() {
        return this.id == null;
    }

    /**
     * @type {String}
     */
    get status() {
        if (this.updatedProps.status) {
            return this.updatedProps.status;
        }
        return this.props.status;
    }

    set status(value) {
        this.updatedProps.status = value;
    }

    /**
    * @type {String}
    */
    get name() {
        if (this.updatedProps.name) {
            return this.updatedProps.name;
        }
        return this.props.name;
    }

    set name(value) {
        this.updatedProps.name = value;
    }

    /**
    * @type {String}
    */
    get parent() {
        if (this.updatedProps.parent) {
            return this.updatedProps.parent;
        }
        return this.props.parent;
    }

    set parent(value) {
        this.updatedProps.parent = value;
    }

    /**
    * @type {Number}
    */
    get taskTemplate() {
        if (this.updatedProps.taskTemplate) {
            return this.updatedProps.taskTemplate;
        }
        return this.props.taskTemplate;
    }

    set taskTemplate(value) {
        this.updatedProps.taskTemplate = value;
    }

    /**
    * @type {Number}
    */
    get schedule() {
        if (this.updatedProps.schedule) {
            return this.updatedProps.schedule;
        }
        return this.props.schedule;
    }

    set schedule(value) {
        this.updatedProps.schedule = value;
    }

    /**
    * @type {String}
    */
    get robot() {
        if (this.updatedProps.robot) {
            return this.updatedProps.robot;
        }
        return this.props.robot;
    }

    set robot(value) {
        this.updatedProps.robot = value;
    }

    /**
    * @type {Array.<Action>}
    */
    get actions() {
        if (this.updatedProps.actions) {
            return this.updatedProps.actions;
        }
        return this.props.actions;
    }

    set actions(value) {
        this.updatedProps.actions = value;
    }

    /**
    * @type {String}
    */
    get requester() {
        if (this.updatedProps.requester) {
            return this.updatedProps.requester;
        }
        return this.props.requester;
    }

    set requester(value) {
        this.updatedProps.requester = value;
    }

    /**
    * @type {String}
    */
    get type() {
        if (this.updatedProps.type) {
            return this.updatedProps.type;
        }
        return this.props.type;
    }

    set type(value) {
        this.updatedProps.type = value;
    }

    /**
    * @type {Array}
    */
    get children() {
        if (this.updatedProps.children) {
            return this.updatedProps.children;
        }
        return this.props.children;
    }

    set children(value) {
        this.updatedProps.children = value;
    }

    /**
     * @type {String}
     */
    get modified() {
        return this.props.modified;
    }

    /**
     * @type {String}
     */
    get created() {
        return this.props.created;
    }

    /**
    * @type {Number}
    */
    get id() {
        return this.props.id;
    }
}

module.exports = Task;
