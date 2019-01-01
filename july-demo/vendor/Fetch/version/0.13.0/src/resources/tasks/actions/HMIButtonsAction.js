'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const FetchcoreClient = require('../../../FetchcoreClient');
const assignDefined = require('../../../utilities/assignDefined.js');
const ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

const Action = require('../Action.js');

class HMIButtonsAction extends Action {
    /**
     * Converts JSON into an HMIButtonsAction resource object
     * @param {JSON} response The response of server
     * @return {Action} newHMIButtonsAction
     */
    static handleResponse(response) {
        if (response.data.count !== undefined) {
            return HMIButtonsAction.createHMIButtonsActionList(response.data);
        }

        const newHMIButtonsAction = new HMIButtonsAction();
        newHMIButtonsAction.parse(response.data);

        return newHMIButtonsAction;
    }

    /**
     * Converts JSON data into a list of HMIButtonsAction resource object
     * @param {JSON} responseData The data coming from server response
     * @return {Array} actionList
     */
    static createHMIButtonsActionList(responseData) {
        const actionList = [];
        responseData.results.forEach((data) => {
            const newHMIButtonsAction = new HMIButtonsAction();
            newHMIButtonsAction.parse(data);
            actionList.push(newHMIButtonsAction);
        });
        return actionList;
    }

    /**
     * Subscribes to HMIButtonsAction updates of a particular Robot with a callback and receives all the updates through web socket stream
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
                && messageData.payload.data.action_definition === ActionDefinition.HMI_BUTTONS
            ) {
                const newHMIButtonsAction = new HMIButtonsAction();
                newHMIButtonsAction.parse(messageData.payload.data);
                return newHMIButtonsAction;
            }
        });
    }

    /**
     * Creates an instance of HMIButtons Action resource object
     * @constructor
     * @param {JSON} newProps New properties of a new HMIButtons Action, refer to Action superclass for shared properties
     * @param {JSON} newProps.inputs Inputs needed for creating HMI buttons
     * @param {Array} [newProps.inputs.buttonData] An array of button data (as strings) to associate with a button
     * @param {Integer} [newProps.inputs.buttonsPerRow] The number of buttons to display on a single row
     * @param {Array} newProps.inputs.buttonNames An array of button names to display
     */
    constructor(newProps) {
        super(newProps);
        this.updatedProps.actionDefinition = ActionDefinition.HMI_BUTTONS;
    }

    parse(JSONData) {
        super.parse(JSONData);
        if (JSONData.inputs) {
            this.props.inputs = {
                buttonData: JSONData.inputs.button_data,
                buttonsPerRow: JSONData.inputs.buttons_per_row,
                buttonNames: JSONData.inputs.button_names
            };
        } else {
            this.props.inputs = {};
        }

        if (JSONData.outputs) {
            this.props.outputs = {
                buttonReturn: JSONData.outputs.button_return
            };
        } else {
            this.props.outputs = {};
        }
    }

    toJSON() {
        let propsInputs;
        let propsOutputs;

        // By default, updatedProps.inputs should undefined
        let updatedInputs = {};
        if (this.updatedProps.inputs) {
            updatedInputs = this.updatedProps.inputs;
        }

        let updatedOutputs = {};
        if (this.updatedProps.outputs) {
            updatedOutputs = this.updatedProps.outputs;
        }

        // Check if props has inputs, otherwise it's a new resource object
        if (this.isNew()) {
            propsInputs = assignDefined(Object.create(null), updatedInputs);
            propsOutputs = assignDefined(Object.create(null), updatedOutputs);
        } else {
            propsInputs = assignDefined(this.props.inputs, updatedInputs);
            propsOutputs = assignDefined(this.props.outputs, updatedOutputs);
        }

        const inputs = {
            button_data: propsInputs.buttonData,
            buttons_per_row: propsInputs.buttonsPerRow,
            button_names: propsInputs.buttonNames
        };

        const outputs = {
            button_return: propsOutputs.buttonReturn
        };

        return assignDefined(Object.create(null), super.toJSON(), { inputs, outputs });
    }
}

module.exports = HMIButtonsAction;
