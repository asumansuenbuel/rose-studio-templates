'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const FetchcoreClient = require('../../../FetchcoreClient');
const assignDefined = require('../../../utilities/assignDefined.js');
const ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

const Action = require('../Action.js');

class DockAction extends Action {
    /**
     * Converts JSON into an DockAction resource object
     * @param {JSON} response The response of server
     * @return {Action} newDockAction
     */
    static handleResponse(response) {
        if (response.data.count !== undefined) {
            return DockAction.createDockActionList(response.data);
        }

        const newDockAction = new DockAction();
        newDockAction.parse(response.data);

        return newDockAction;
    }

    /**
     * Converts JSON data into a list of DockAction resource object
     * @param {JSON} responseData The data coming from server response
     * @return {Array} actionList
     */
    static createDockActionList(responseData) {
        const actionList = [];
        responseData.results.forEach((data) => {
            const newDockAction = new DockAction();
            newDockAction.parse(data);
            actionList.push(newDockAction);
        });
        return actionList;
    }

    /**
     * Subscribes to DockAction updates of a particular Robot with a callback and receives all the updates through web socket stream
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
                && messageData.payload.data.action_definition === ActionDefinition.DOCK
            ) {
                const newDockAction = new DockAction();
                newDockAction.parse(messageData.payload.data);
                return newDockAction;
            }
        });
    }

    /**
     * Creates an instance of Dock Action resource object
     * @constructor
     * @param {JSON} newProps New properties of a new Dock Action, refer to Action superclass for shared properties
     * @param {JSON} newProps.inputs Inputs needed for docking
     * @param {Number} [newProps.inputs.dockPoseQy] The qy orientation of the dock (in quaternions)
     * @param {Number} [newProps.inputs.dockPoseQx] The qx orientation of the dock (in quaternions)
     * @param {Number} [newProps.inputs.dockPoseQz] The qz orientation of the dock (in quaternions)
     * @param {Number} [newProps.inputs.dockPoseQw] The qw orientation of the dock (in quaternions)
     * @param {Number} [newProps.inputs.dockPoseY] The Y position of the dock (in meters)
     * @param {Number} [newProps.inputs.dockPoseX] The X position of the dock (in meters)
     * @param {Integer} [newProps.inputs.dockId] The ID of the dock the robot is docking with, if known
     *
     * @example
     * // All inputs are optional unless you want the robot to go to a specific dock pose
     * const newAction = DockAction({
     *     status: 'NEW',
     *     preemptable: 'NONE',
     *     inputs: {
     *         dockId: 5
     *     }
     * });
     *
     * // Or use quaternions
     * const newAction = DockAction({
     *     status: 'NEW',
     *     preemptable: 'NONE',
     *     inputs: {
     *         dockPoseQx: 1,
     *         dockPoseQy: 1,
     *         dockPoseQz: 0.5,
     *         dockPoseQw: 0.35,
     *         dockPoseX: 0.25,
     *         dockPoseY: 0.53
     *     }
     * });
     */
    constructor(newProps) {
        super(newProps);
        this.updatedProps.actionDefinition = ActionDefinition.DOCK;
    }

    parse(JSONData) {
        super.parse(JSONData);
        if (JSONData.inputs) {
            this.props.inputs = {
                dockPoseQy: JSONData.inputs.dock_pose_qy,
                dockPoseQx: JSONData.inputs.dock_pose_qx,
                dockPoseQz: JSONData.inputs.dock_pose_qz,
                dockPoseQw: JSONData.inputs.dock_pose_qw,
                dockPoseY: JSONData.inputs.dock_pose_y,
                dockPoseX: JSONData.inputs.dock_pose_x,
                dockId: JSONData.inputs.dock_id
            };
        } else {
            this.props.inputs = {};
        }

        if (JSONData.outputs) {
            this.props.outputs = {
                dockId: JSONData.outputs.dock_id,
                docked: JSONData.outputs.docked
            };
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
            dock_pose_qy: propsInputs.dockPoseQy,
            dock_pose_qx: propsInputs.dockPoseQx,
            dock_pose_qz: propsInputs.dockPoseQz,
            dock_pose_qw: propsInputs.dockPoseQw,
            dock_pose_y: propsInputs.dockPoseY,
            dock_pose_x: propsInputs.dockPoseX,
            dock_id: propsInputs.dockId
        };

        return assignDefined(Object.create(null), super.toJSON(), { inputs });
    }
}

module.exports = DockAction;
