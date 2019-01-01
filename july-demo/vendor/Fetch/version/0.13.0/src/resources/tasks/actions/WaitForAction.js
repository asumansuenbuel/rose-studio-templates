'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const FetchcoreClient = require('../../../FetchcoreClient');
const assignDefined = require('../../../utilities/assignDefined.js');
const ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

const Action = require('../Action.js');

class WaitForAction extends Action {
    /**
     * Converts JSON into an WaitForAction resource object
     * @param {JSON} response The response of server
     * @return {Action} newUndockAction
     */
    static handleResponse(response) {
        if (response.data.count !== undefined) {
            return WaitForAction.createWaitForActionList(response.data);
        }

        const newWaitForAction = new WaitForAction();
        newWaitForAction.parse(response.data);

        return newWaitForAction;
    }

    /**
     * Converts JSON data into a list of WaitForAction resource object
     * @param {JSON} responseData The data coming from server response
     * @return {Array} actionList
     */
    static createWaitForActionList(responseData) {
        const actionList = [];
        responseData.results.forEach((data) => {
            const newWaitForAction = new WaitForAction();
            newWaitForAction.parse(data);
            actionList.push(newWaitForAction);
        });
        return actionList;
    }

    /**
     * Subscribes to WaitForAction updates of a particular Robot with a callback and receives all the updates through web socket stream
     * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static subscribeTo(robotName, handleStreamMessage) {
        const client = FetchcoreClient.defaultClient();
        const endpoint = super.actionStreamEndpoint(robotName);
        client.subscribe(endpoint, handleStreamMessage, (message) => {
            const messageData = JSON.parse(message.data);
            if (
                messageData.payload.model === 'api.action'
                && messageData.payload.data.action_definition === ActionDefinition.WAITFOR
            ) {
                const newWaitForAction = new WaitForAction();
                newWaitForAction.parse(messageData.payload.data);
                return newWaitForAction;
            }
        });
    }

    /**
     * Creates an instance of WaitFor Action resource object
     * @constructor
     * @param {JSON} newProps New properties of a new WaitFor Action, refer to Action superclass for shared properties
     * @param {JSON} newProps.inputs Inputs needed for wait-for
     * @param {String} newProps.inputs.duration The amount of time a robot should wait in HH\:MM\:SS format
     */
    constructor(newProps) {
        super(newProps);
        this.updatedProps.actionDefinition = ActionDefinition.WAITFOR;
    }

    parse(JSONData) {
        super.parse(JSONData);
        if (JSONData.inputs) {
            this.props.inputs = {
                duration: JSONData.inputs.duration
            };
        } else {
            this.props.inputs = {};
        }

        if (JSONData.outputs) {
            // There are no outputs associated with WAITFOR
            this.props.outputs = {};
        } else {
            this.props.outputs = {};
        }
    }

    toJSON() {
        let propsInputs;

        // By default, updatedProps.inputs should undefined
        let updatedInputs = {};
        if (this.updatedProps.inputs) {
            updatedInputs = this.updatedProps.inputs;
        }

        // Check if props has inputs, otherwise it's a new resource object
        if (this.isNew()) {
            propsInputs = assignDefined(Object.create(null), updatedInputs);
        } else {
            propsInputs = assignDefined(this.props.inputs, updatedInputs);
        }

        const inputs = {
            duration: propsInputs.duration,
        };

        return assignDefined(Object.create(null), super.toJSON(), { inputs });
    }
}

module.exports = WaitForAction;
