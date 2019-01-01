'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const FetchcoreClient = require('../../../FetchcoreClient');
const assignDefined = require('../../../utilities/assignDefined.js');
const ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

const Action = require('../Action.js');

class BuildMapAction extends Action {
    /**
     * Converts JSON into an BuildMapAction resource object
     * @param {JSON} response The response of server
     * @return {Action} newBuildMapAction
     */
    static handleResponse(response) {
        if (response.data.count !== undefined) {
            return BuildMapAction.createBuildMapActionList(response.data);
        }

        const newBuildMapAction = new BuildMapAction();
        newBuildMapAction.parse(response.data);

        return newBuildMapAction;
    }

    /**
     * Converts JSON data into a list of BuildMapAction resource object
     * @param {JSON} responseData The data coming from server response
     * @return {Array} actionList
     */
    static createBuildMapActionList(responseData) {
        const actionList = [];
        responseData.results.forEach((data) => {
            const newBuildMapAction = new BuildMapAction();
            newBuildMapAction.parse(data);
            actionList.push(newBuildMapAction);
        });
        return actionList;
    }

    /**
     * Subscribes to BuildMapAction updates of a particular Robot with a callback and receives all the updates through web socket stream
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
                && messageData.payload.data.action_definition === ActionDefinition.BUILDMAP
            ) {
                const newBuildMapAction = new BuildMapAction();
                newBuildMapAction.parse(messageData.payload.data);
                return newBuildMapAction;
            }
        });
    }

    /**
     * Creates an instance of BuildMap Action resource object
     * @constructor
     * @param {JSON} newProps New properties of a new BuildMap Action, refer to Action superclass for shared properties
     * @param {JSON} newProps.inputs Inputs needed for building map
     * @param {String} newProps.inputs.mapName A human-readable name of the map. If not provided, one is generated based on the date
     *
     * @example
     * // status and preemptable are optional
     * const newAction = BuildMapAction({
     *     status: 'NEW',
     *     preemptable: 'NONE',
     *     inputs: {
     *         mapName: 'Warehouse New Map'
     *     }
     * });
     */
    constructor(newProps) {
        super(newProps);
        this.updatedProps.actionDefinition = ActionDefinition.BUILDMAP;
    }

    parse(JSONData) {
        super.parse(JSONData);

        if (JSONData.inputs) {
            this.props.inputs = {
                mapName: JSONData.inputs.mapname
            };
        } else {
            this.props.inputs = {};
        }

        if (JSONData.outputs) {
            // There are no outputs associated with BUILDMAP
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
            mapname: propsInputs.mapName,
        };

        return assignDefined(Object.create(null), super.toJSON(), { inputs });
    }
}

module.exports = BuildMapAction;
