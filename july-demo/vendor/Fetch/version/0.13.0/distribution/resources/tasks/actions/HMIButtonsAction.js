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

var HMIButtonsAction = function (_Action) {
    _inherits(HMIButtonsAction, _Action);

    _createClass(HMIButtonsAction, null, [{
        key: 'handleResponse',

        /**
         * Converts JSON into an HMIButtonsAction resource object
         * @param {JSON} response The response of server
         * @return {Action} newHMIButtonsAction
         */
        value: function handleResponse(response) {
            if (response.data.count !== undefined) {
                return HMIButtonsAction.createHMIButtonsActionList(response.data);
            }

            var newHMIButtonsAction = new HMIButtonsAction();
            newHMIButtonsAction.parse(response.data);

            return newHMIButtonsAction;
        }

        /**
         * Converts JSON data into a list of HMIButtonsAction resource object
         * @param {JSON} responseData The data coming from server response
         * @return {Array} actionList
         */

    }, {
        key: 'createHMIButtonsActionList',
        value: function createHMIButtonsActionList(responseData) {
            var actionList = [];
            responseData.results.forEach(function (data) {
                var newHMIButtonsAction = new HMIButtonsAction();
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

    }, {
        key: 'subscribeTo',
        value: function subscribeTo(robotName, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = _get(HMIButtonsAction.__proto__ || Object.getPrototypeOf(HMIButtonsAction), 'actionStreamEndpoint', this).call(this, robotName);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.action' && messageData.payload.data.action_definition === ActionDefinition.HMI_BUTTONS) {
                    var newHMIButtonsAction = new HMIButtonsAction();
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

    }]);

    function HMIButtonsAction(newProps) {
        _classCallCheck(this, HMIButtonsAction);

        var _this = _possibleConstructorReturn(this, (HMIButtonsAction.__proto__ || Object.getPrototypeOf(HMIButtonsAction)).call(this, newProps));

        _this.updatedProps.actionDefinition = ActionDefinition.HMI_BUTTONS;
        return _this;
    }

    _createClass(HMIButtonsAction, [{
        key: 'parse',
        value: function parse(JSONData) {
            _get(HMIButtonsAction.prototype.__proto__ || Object.getPrototypeOf(HMIButtonsAction.prototype), 'parse', this).call(this, JSONData);
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
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var propsInputs = void 0;
            var propsOutputs = void 0;

            // By default, updatedProps.inputs should undefined
            var updatedInputs = {};
            if (this.updatedProps.inputs) {
                updatedInputs = this.updatedProps.inputs;
            }

            var updatedOutputs = {};
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

            var inputs = {
                button_data: propsInputs.buttonData,
                buttons_per_row: propsInputs.buttonsPerRow,
                button_names: propsInputs.buttonNames
            };

            var outputs = {
                button_return: propsOutputs.buttonReturn
            };

            return assignDefined(Object.create(null), _get(HMIButtonsAction.prototype.__proto__ || Object.getPrototypeOf(HMIButtonsAction.prototype), 'toJSON', this).call(this), { inputs: inputs, outputs: outputs });
        }
    }]);

    return HMIButtonsAction;
}(Action);

module.exports = HMIButtonsAction;