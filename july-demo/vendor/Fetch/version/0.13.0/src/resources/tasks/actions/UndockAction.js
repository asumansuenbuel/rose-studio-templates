'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const FetchcoreClient = require('../../../FetchcoreClient');
const assignDefined = require('../../../utilities/assignDefined.js');
const ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

const Action = require('../Action.js');

class UndockAction extends Action {
    /**
     * Converts JSON into an UndockAction resource object
     * @param {JSON} response The response of server
     * @return {Action} newUndockAction
     */
    static handleResponse(response) {
        if (response.data.count !== undefined) {
            return UndockAction.createUndockActionList(response.data);
        }

        const newUndockAction = new UndockAction();
        newUndockAction.parse(response.data);

        return newUndockAction;
    }

    /**
     * Converts JSON data into a list of UndockAction resource object
     * @param {JSON} responseData The data coming from server response
     * @return {Array} actionList
     */
    static createUndockActionList(responseData) {
        const actionList = [];
        responseData.results.forEach((data) => {
            const newUndockAction = new UndockAction();
            newUndockAction.parse(data);
            actionList.push(newUndockAction);
        });
        return actionList;
    }

    /**
     * Subscribes to UndockAction updates of a particular Robot with a callback and receives all the updates through web socket stream
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
                && messageData.payload.data.action_definition === ActionDefinition.UNDOCK
            ) {
                const newUndockAction = new UndockAction();
                newUndockAction.parse(messageData.payload.data);
                return newUndockAction;
            }
        });
    }

    /**
     * Creates an instance of Undock Action resource object
     * @constructor
     * @param {JSON} newProps New properties of a new Undock Action, refer to Action superclass for shared properties
     * @param {JSON} newProps.inputs Inputs needed for undocking
     * @param {Boolean} [newProps.inputs.rotateInPlace] If the robot should rotate 180 degrees after undocking
     */
    constructor(newProps) {
        super(newProps);
        this.updatedProps.actionDefinition = ActionDefinition.UNDOCK;
    }

    parse(JSONData) {
        super.parse(JSONData);
        if (JSONData.inputs) {
            this.props.inputs = {
                rotateInPlace: JSONData.inputs.rotate_in_place
            };
        } else {
            this.props.inputs = {};
        }

        if (JSONData.outputs) {
            // There are no outputs associated with UNDOCK
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
            rotate_in_place: propsInputs.rotateInPlace,
        };

        return assignDefined(Object.create(null), super.toJSON(), { inputs });
    }
}

module.exports = UndockAction;
