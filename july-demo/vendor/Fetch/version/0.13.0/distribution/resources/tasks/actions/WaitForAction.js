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

var WaitForAction = function (_Action) {
    _inherits(WaitForAction, _Action);

    _createClass(WaitForAction, null, [{
        key: 'handleResponse',

        /**
         * Converts JSON into an WaitForAction resource object
         * @param {JSON} response The response of server
         * @return {Action} newUndockAction
         */
        value: function handleResponse(response) {
            if (response.data.count !== undefined) {
                return WaitForAction.createWaitForActionList(response.data);
            }

            var newWaitForAction = new WaitForAction();
            newWaitForAction.parse(response.data);

            return newWaitForAction;
        }

        /**
         * Converts JSON data into a list of WaitForAction resource object
         * @param {JSON} responseData The data coming from server response
         * @return {Array} actionList
         */

    }, {
        key: 'createWaitForActionList',
        value: function createWaitForActionList(responseData) {
            var actionList = [];
            responseData.results.forEach(function (data) {
                var newWaitForAction = new WaitForAction();
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

    }, {
        key: 'subscribeTo',
        value: function subscribeTo(robotName, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = _get(WaitForAction.__proto__ || Object.getPrototypeOf(WaitForAction), 'actionStreamEndpoint', this).call(this, robotName);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.action' && messageData.payload.data.action_definition === ActionDefinition.WAITFOR) {
                    var newWaitForAction = new WaitForAction();
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

    }]);

    function WaitForAction(newProps) {
        _classCallCheck(this, WaitForAction);

        var _this = _possibleConstructorReturn(this, (WaitForAction.__proto__ || Object.getPrototypeOf(WaitForAction)).call(this, newProps));

        _this.updatedProps.actionDefinition = ActionDefinition.WAITFOR;
        return _this;
    }

    _createClass(WaitForAction, [{
        key: 'parse',
        value: function parse(JSONData) {
            _get(WaitForAction.prototype.__proto__ || Object.getPrototypeOf(WaitForAction.prototype), 'parse', this).call(this, JSONData);
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
                duration: propsInputs.duration
            };

            return assignDefined(Object.create(null), _get(WaitForAction.prototype.__proto__ || Object.getPrototypeOf(WaitForAction.prototype), 'toJSON', this).call(this), { inputs: inputs });
        }
    }]);

    return WaitForAction;
}(Action);

module.exports = WaitForAction;