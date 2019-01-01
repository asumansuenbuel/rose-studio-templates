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

var LocalizeAction = function (_Action) {
    _inherits(LocalizeAction, _Action);

    _createClass(LocalizeAction, null, [{
        key: 'handleResponse',

        /**
         * Converts JSON into an LocalizeAction resource object
         * @param {JSON} response The response of server
         * @return {Action} newLocalizeAction
         */
        value: function handleResponse(response) {
            if (response.data.count !== undefined) {
                return LocalizeAction.createLocalizeActionList(response.data);
            }

            var newLocalizeAction = new LocalizeAction();
            newLocalizeAction.parse(response.data);

            return newLocalizeAction;
        }

        /**
         * Converts JSON data into a list of LocalizeAction resource object
         * @param {JSON} responseData The data coming from server response
         * @return {Array} actionList
         */

    }, {
        key: 'createLocalizeActionList',
        value: function createLocalizeActionList(responseData) {
            var actionList = [];
            responseData.results.forEach(function (data) {
                var newLocalizeAction = new LocalizeAction();
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

    }, {
        key: 'subscribeTo',
        value: function subscribeTo(robotName, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = _get(LocalizeAction.__proto__ || Object.getPrototypeOf(LocalizeAction), 'actionStreamEndpoint', this).call(this, robotName);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.action' && messageData.payload.data.action_definition === ActionDefinition.LOCALIZE) {
                    var newLocalizeAction = new LocalizeAction();
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

    }]);

    function LocalizeAction(newProps) {
        _classCallCheck(this, LocalizeAction);

        var _this = _possibleConstructorReturn(this, (LocalizeAction.__proto__ || Object.getPrototypeOf(LocalizeAction)).call(this, newProps));

        _this.updatedProps.actionDefinition = ActionDefinition.LOCALIZE;
        return _this;
    }

    _createClass(LocalizeAction, [{
        key: 'parse',
        value: function parse(JSONData) {
            _get(LocalizeAction.prototype.__proto__ || Object.getPrototypeOf(LocalizeAction.prototype), 'parse', this).call(this, JSONData);
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
                pose_estimate: propsInputs.poseEstimate
            };

            return assignDefined(Object.create(null), _get(LocalizeAction.prototype.__proto__ || Object.getPrototypeOf(LocalizeAction.prototype), 'toJSON', this).call(this), { inputs: inputs });
        }
    }]);

    return LocalizeAction;
}(Action);

module.exports = LocalizeAction;