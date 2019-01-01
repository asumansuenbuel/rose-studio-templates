'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FetchcoreClient = require('../../../FetchcoreClient');
var assignDefined = require('../../../utilities/assignDefined.js');
var ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

var Action = require('../Action.js');

var DockAction = function (_Action) {
    _inherits(DockAction, _Action);

    _createClass(DockAction, null, [{
        key: 'handleResponse',

        /**
         * Converts JSON into an DockAction resource object
         * @param {JSON} response The response of server
         * @return {Action} newDockAction
         */
        value: function handleResponse(response) {
            if (response.data.count !== undefined) {
                return DockAction.createDockActionList(response.data);
            }

            var newDockAction = new DockAction();
            newDockAction.parse(response.data);

            return newDockAction;
        }

        /**
         * Converts JSON data into a list of DockAction resource object
         * @param {JSON} responseData The data coming from server response
         * @return {Array} actionList
         */

    }, {
        key: 'createDockActionList',
        value: function createDockActionList(responseData) {
            var actionList = [];
            responseData.results.forEach(function (data) {
                var newDockAction = new DockAction();
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

    }, {
        key: 'subscribeTo',
        value: function subscribeTo(robotName, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = _get(DockAction.__proto__ || Object.getPrototypeOf(DockAction), 'actionStreamEndpoint', this).call(this, robotName);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.action' && messageData.payload.data.action_definition === ActionDefinition.DOCK) {
                    var newDockAction = new DockAction();
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

    }]);

    function DockAction(newProps) {
        _classCallCheck(this, DockAction);

        var _this = _possibleConstructorReturn(this, (DockAction.__proto__ || Object.getPrototypeOf(DockAction)).call(this, newProps));

        _this.updatedProps.actionDefinition = ActionDefinition.DOCK;
        return _this;
    }

    _createClass(DockAction, [{
        key: 'parse',
        value: function parse(JSONData) {
            _get(DockAction.prototype.__proto__ || Object.getPrototypeOf(DockAction.prototype), 'parse', this).call(this, JSONData);
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
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var propsInputs = void 0;

            // By default, updatedProps.inputs should undefined
            var updatedInputs = {};
            if (this.updatedProps.inputs) {
                updatedInputs = this.updatedProps.inputs;
            }

            // Check if props has inputs, otherwise it's a new resource object
            if (this.isNew()) {
                propsInputs = assignDefined(Object.create(null), updatedInputs);
            } else {
                propsInputs = assignDefined(this.props.inputs, updatedInputs);
            }

            var inputs = {
                dock_pose_qy: propsInputs.dockPoseQy,
                dock_pose_qx: propsInputs.dockPoseQx,
                dock_pose_qz: propsInputs.dockPoseQz,
                dock_pose_qw: propsInputs.dockPoseQw,
                dock_pose_y: propsInputs.dockPoseY,
                dock_pose_x: propsInputs.dockPoseX,
                dock_id: propsInputs.dockId
            };

            return assignDefined(Object.create(null), _get(DockAction.prototype.__proto__ || Object.getPrototypeOf(DockAction.prototype), 'toJSON', this).call(this), { inputs: inputs });
        }
    }]);

    return DockAction;
}(Action);

module.exports = DockAction;