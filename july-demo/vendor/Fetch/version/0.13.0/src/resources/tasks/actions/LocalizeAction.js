'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const FetchcoreClient = require('../../../FetchcoreClient');
const assignDefined = require('../../../utilities/assignDefined.js');
const ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

const Action = require('../Action.js');

class LocalizeAction extends Action {
    /**
     * Converts JSON into an LocalizeAction resource object
     * @param {JSON} response The response of server
     * @return {Action} newLocalizeAction
     */
    static handleResponse(response) {
        if (response.data.count !== undefined) {
            return LocalizeAction.createLocalizeActionList(response.data);
        }

        const newLocalizeAction = new LocalizeAction();
        newLocalizeAction.parse(response.data);

        return newLocalizeAction;
    }

    /**
     * Converts JSON data into a list of LocalizeAction resource object
     * @param {JSON} responseData The data coming from server response
     * @return {Array} actionList
     */
    static createLocalizeActionList(responseData) {
        const actionList = [];
        responseData.results.forEach((data) => {
            const newLocalizeAction = new LocalizeAction();
            newLocalizeAction.parse(data);
            actionList.push(newLocalizeAction);
        });
        return actionList;
    }

    /**
     * Subscribes to LocalizeAction updates of a particular Robot with a callback and receives all the updates through web socket stream
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
                && messageData.payload.data.action_definition === ActionDefinition.LOCALIZE
            ) {
                const newLocalizeAction = new LocalizeAction();
                newLocalizeAction.parse(messageData.payload.data);
                return newLocalizeAction;
            }
        });
    }

    /**
     * Creates an instance of Localize Action resource object
     * @constructor
     * @param {JSON} newProps New properties of a new Localize Action, refer to Action superclass for shared properties
     * @param {JSON} newProps.inputs Inputs needed for localizing
     * @param {JSON} newProps.inputs.poseEstimate A JSON dictionary with a {x, y, theta} pose estimate of the robot's current location
     *
     * @example
     * const newAction = new LocalizeAction({
     *     status: 'NEW',
     *     preemptable: 'NONE',
     *     inputs: {
     *         poseEstimate: {
     *             x: 0.5,
     *             y: 0.6,
     *             theta: 0
     *         }
     *     }
     * });
     */
    constructor(newProps) {
        super(newProps);
        this.updatedProps.actionDefinition = ActionDefinition.LOCALIZE;
    }

    parse(JSONData) {
        super.parse(JSONData);
        if (JSONData.inputs) {
            this.props.inputs = {
                poseEstimate: JSONData.inputs.pose_estimate
            };
        } else {
            this.props.inputs = {};
        }

        if (JSONData.outputs) {
            // There are no outputs associated with LOCALIZE
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
            pose_estimate: propsInputs.poseEstimate,
        };

        return assignDefined(Object.create(null), super.toJSON(), { inputs });
    }

}

module.exports = LocalizeAction;
