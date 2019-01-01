'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const assignDefined = require('../../utilities/assignDefined.js');
const FetchcoreClient = require('../../FetchcoreClient');

class Action {

    /**
     * Returns the server endpoint for action data
     * @return {String} ACTION_ENDPOINT
     */
    static get ENDPOINT() {
        return 'api/v1/tasks/actions/';
    }

    /**
     * Converts JSON into an Action resource object
     * @param {JSON} res The response of server
     * @return {Action} newAction
     */
    static handleResponse(response) {
        if (response.data.count !== undefined) {
            return Action.createActionList(response.data);
        }

        const newAction = new Action();
        newAction.parse(response.data);

        return newAction;
    }

    /**
    * Converts JSON data into a list of Action resource object
     * @param {JSON} responseData The data coming from server response
     * @return {Array} actionList
     */
    static createActionList(responseData) {
        const actionList = [];
        responseData.results.forEach((data) => {
            const newAction = new Action();
            newAction.parse(data);
            actionList.push(newAction);
        });
        return actionList;
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

    static get defaultProps() {
        return {
            status: 'NEW',
            preemptable: 'NONE',
            inputs: {},
            outputs: {}
        };
    }

    static actionStreamEndpoint(robotName) {
        if (robotName) {
            return `/api/v1/streams/tasks/${robotName}/`;
        }
        return '/api/v1/streams/tasks/';
    }

    /**
     * Creates an instance of Action resource object
     * @constructor
     * @param {JSON} newProps New properties of a new Action
     * @param {String} newProps.status Status of this action
     * @param {String} newProps.preemptable
     * @param {Integer} [newProps.task] ID of a task that this action belongs to
     */
    constructor(newProps = Object.create(null)) {
        this.props = Object.create(null);
        this.updatedProps = assignDefined(Object.create(null), Action.defaultProps, newProps);
    }

    toJSON(isPatch = false) {
        let JSON;

        if (isPatch) {
            JSON = {
                status: this.updatedProps.status,
                preemptable: this.updatedProps.preemptable,
                task: this.updatedProps.task,
                start: this.updatedProps.start,
                end: this.updatedProps.end,
                created: this.updatedProps.created,
                modified: this.updatedProps.modified,
                on_complete: this.updatedProps.onComplete,
                action_definition: this.updatedProps.actionDefinition,
                outputs: this.updatedProps.outputs
            };
        } else {
            const properties = assignDefined(this.props, this.updatedProps);

            JSON = {
                id: properties.id,
                status: properties.status,
                preemptable: properties.preemptable,
                task: properties.task,
                start: properties.start,
                end: properties.end,
                created: properties.created,
                modified: properties.modified,
                on_complete: properties.onComplete,
                action_definition: properties.actionDefinition,
                outputs: properties.outputs
            };
        }
        return assignDefined(Object.create(null), JSON);
    }

    parse(resourceJSON = {}) {
        this.props =  {
            actionDefinition: resourceJSON.action_definition,
            status: resourceJSON.status,
            preemptable: resourceJSON.preemptable,
            task: resourceJSON.task,
            start: resourceJSON.start,
            end: resourceJSON.end,
            created: resourceJSON.created,
            modified: resourceJSON.modified,
            id: resourceJSON.id,
            onComplete: resourceJSON.on_complete
        };

        this.updatedProps = Object.create(null);
    }

    /**
     * Updates attributes of action on server
     * @this Action
     * @return {Promise.<Task>} When promise resolves, it will return an updated Action resource object
     */
    update() {
        const client = FetchcoreClient.defaultClient();
        const data = this.toJSON(true);
        return client.patch(Action.ENDPOINT, this.id, data)
                .then(this.constructor.handleResponse) // Using this.constructor to perform static method overriding
                .catch(Action.handleError);
    }

    /**
     * Checks if an instance of Action is a new Action that has yet been persisted to database
     * @this Action
     * @return {Boolean} isNew
     */
    isNew() {
        return (this.props.id === undefined);
    }

    /**
     * Unsubscribes to Action of a particular robot through the callback that was previously submitted for
     * subscription
     * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static unsubscribeTo(robotName, handleStreamMessage) {
        FetchcoreClient.defaultClient().unsubscribe(
            Action.actionStreamEndpoint(robotName),
            handleStreamMessage
        );
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
    get preemptable() {
        if (this.updatedProps.preemptable) {
            return this.updatedProps.preemptable;
        }
        return this.props.preemptable;
    }

    set preemptable(value) {
        this.updatedProps.preemptable = value;
    }

    /**
     * @type {Number}
     */
    get task() {
        return this.props.task;
    }

    /**
     * @type {String}
     */
    get start() {
        return this.props.start;
    }

    /**
     * @type {String}
     */
    get end() {
        return this.props.end;
    }

    /**
     * @type {String}
     */
    get created() {
        return this.props.created;
    }

    /**
     * @type {String}
     */
    get modified() {
        return this.props.modified;
    }

    /**
     * @type {Number}
     */
    get id() {
        return this.props.id;
    }

    /**
     * @type {Array.<JSON>}
     */
    get onComplete() {
        if (this.updatedProps.onComplete) {
            return this.updatedProps.onComplete;
        }
        return this.props.onComplete;
    }

    /**
     * @type {String}
     */
    get actionDefinition() {
        return this.props.actionDefinition;
    }

    /**
     * @type {Array.<JSON>}
     */
    get inputs() {
        if (this.updatedProps.inputs) {
            return this.updatedProps.inputs;
        }
        return this.props.inputs;
    }

    set inputs(value) {
        this.updatedProps.inputs = value;
    }

    /**
     * @type {Array.<JSON>}
     */
    get outputs() {
        return this.props.outputs;
    }

    set outputs(value) {
        this.updatedProps.outputs = value;
    }
}

module.exports = Action;
