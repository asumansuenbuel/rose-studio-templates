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

var NavigateAction = function (_Action) {
    _inherits(NavigateAction, _Action);

    _createClass(NavigateAction, null, [{
        key: 'handleResponse',

        /**
         * Converts JSON into an NavigateAction resource object
         * @param {JSON} response The response of server
         * @return {Action} newNavigateAction
         */
        value: function handleResponse(response) {
            if (response.data.count !== undefined) {
                return NavigateAction.createNavigateActionList(response.data);
            }

            var newNavigateAction = new NavigateAction();
            newNavigateAction.parse(response.data);

            return newNavigateAction;
        }

        /**
         * Converts JSON data into a list of NavigateAction resource object
         * @param {JSON} responseData The data coming from server response
         * @return {Array} actionList
         */

    }, {
        key: 'createNavigateActionList',
        value: function createNavigateActionList(responseData) {
            var actionList = [];
            responseData.results.forEach(function (data) {
                var newNavigateAction = new NavigateAction();
                newNavigateAction.parse(data);
                actionList.push(newNavigateAction);
            });
            return actionList;
        }

        /**
         * Subscribes to NavigateAction updates of a particular Robot with a callback and receives all the updates through web socket stream
         * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'subscribeTo',
        value: function subscribeTo(robotName, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = _get(NavigateAction.__proto__ || Object.getPrototypeOf(NavigateAction), 'actionStreamEndpoint', this).call(this, robotName);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.action' && messageData.payload.data.action_definition === ActionDefinition.NAVIGATE) {
                    var newNavigateAction = new NavigateAction();
                    newNavigateAction.parse(messageData.payload.data);
                    return newNavigateAction;
                }
            });
        }

        /**
         * Creates an instance of Navigate Action resource object
         * @constructor
         * @param {JSON} newProps Properties of a new Navigate Action, refer to Action superclass for shared properties
         * @param {JSON} newProps.inputs Inputs needed for navigating
         * @param {JSON} newProps.inputs.goalPose The goal pose to navigate to as a JSON dictionary with a {x, y, theta} values
         * @param {Boolean} [newProps.inputs.monitored] Run monitoring software on this navigation action
         * @param {Boolean} [newProps.inputs.resultBased] If the location of this navigate action is dependent on the result of a previous action
         * @param {Integer} [newProps.inputs.poseGroupId] The ID of the pose group to navigate to
         * @param {Boolean} [newProps.inputs.clearCostMaps] If the collision costmap should be cleared before planning
         * @param {String} newProps.inputs.poseName The name of the pose to navigate to
         * @param {Number} [newProps.inputs.maxVelocity] An optional maximum velocity override in meters per second
         * @param {Number} [newProps.inputs.maxAngularVelocity] An optional maximum angular velocity override in radians per second
         * @param {Boolean} [newProps.inputs.limitVelocity] If the provided 'max_velocity' and 'max_angular_velocity' values should override the system-wide defaults
         * @param {Integer} newProps.inputs.poseId The ID of the pose to navigate to
         *
         * @example
         * // Only one of the three (poseId, poseName, or goalPose) is required
         * const newAction = new NavigateAction({
         *     status: 'NEW',
         *     preemptable: 'NONE',
         *     inputs: {
         *         poseName: 'Shipping',
         *         monitored: false,
         *         resultBased: false,
         *         clearCostMaps: false,
         *         limitVelocity: true,
         *         maxVelocity: 0.5,
         *         maxAngularVelocity: 0.1
         *     }
         * });
         */

    }]);

    function NavigateAction(newProps) {
        _classCallCheck(this, NavigateAction);

        var _this = _possibleConstructorReturn(this, (NavigateAction.__proto__ || Object.getPrototypeOf(NavigateAction)).call(this, newProps));

        _this.updatedProps.actionDefinition = ActionDefinition.NAVIGATE;
        return _this;
    }

    _createClass(NavigateAction, [{
        key: 'parse',
        value: function parse(JSONData) {
            _get(NavigateAction.prototype.__proto__ || Object.getPrototypeOf(NavigateAction.prototype), 'parse', this).call(this, JSONData);
            if (JSONData.inputs) {
                this.props.inputs = {
                    goalPose: JSONData.inputs.goal_pose,
                    monitored: JSONData.inputs.monitored,
                    resultBased: JSONData.inputs.result_based,
                    poseGroupId: JSONData.inputs.pose_groud_id,
                    clearCostmaps: JSONData.inputs.clear_costmaps,
                    poseName: JSONData.inputs.pose_name,
                    maxVelocity: JSONData.inputs.max_velocity,
                    maxAngularVelocity: JSONData.inputs.max_angular_velocity,
                    limitVelocity: JSONData.inputs.limit_velocity,
                    poseId: JSONData.inputs.pose_id
                };
            } else {
                this.props.inputs = {};
            }

            if (JSONData.outputs) {
                this.props.outputs = {
                    totalDuration: JSONData.outputs.total_duration,
                    recoveryDuration: JSONData.outputs.recovery_duration,
                    controllerDuration: JSONData.outputs.controller_duration,
                    planningDuration: JSONData.outputs.planning_duration,
                    message: JSONData.outputs.message,
                    events: JSONData.outputs.events
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
                goal_pose: propsInputs.goalPose,
                monitored: propsInputs.monitored,
                result_based: propsInputs.resultBased,
                pose_group_id: propsInputs.poseGroupId,
                clear_costmaps: propsInputs.clearCostmaps,
                pose_name: propsInputs.poseName,
                max_velocity: propsInputs.maxVelocity,
                max_angular_velocity: propsInputs.maxAngularVelocity,
                limit_velocity: propsInputs.limitVelocity,
                pose_id: propsInputs.poseId
            };

            return assignDefined(Object.create(null), _get(NavigateAction.prototype.__proto__ || Object.getPrototypeOf(NavigateAction.prototype), 'toJSON', this).call(this), { inputs: inputs });
        }
    }]);

    return NavigateAction;
}(Action);

module.exports = NavigateAction;