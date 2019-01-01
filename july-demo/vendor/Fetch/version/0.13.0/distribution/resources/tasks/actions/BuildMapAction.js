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

var BuildMapAction = function (_Action) {
    _inherits(BuildMapAction, _Action);

    _createClass(BuildMapAction, null, [{
        key: 'handleResponse',

        /**
         * Converts JSON into an BuildMapAction resource object
         * @param {JSON} response The response of server
         * @return {Action} newBuildMapAction
         */
        value: function handleResponse(response) {
            if (response.data.count !== undefined) {
                return BuildMapAction.createBuildMapActionList(response.data);
            }

            var newBuildMapAction = new BuildMapAction();
            newBuildMapAction.parse(response.data);

            return newBuildMapAction;
        }

        /**
         * Converts JSON data into a list of BuildMapAction resource object
         * @param {JSON} responseData The data coming from server response
         * @return {Array} actionList
         */

    }, {
        key: 'createBuildMapActionList',
        value: function createBuildMapActionList(responseData) {
            var actionList = [];
            responseData.results.forEach(function (data) {
                var newBuildMapAction = new BuildMapAction();
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

    }, {
        key: 'subscribeTo',
        value: function subscribeTo(robotName, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = _get(BuildMapAction.__proto__ || Object.getPrototypeOf(BuildMapAction), 'actionStreamEndpoint', this).call(this, robotName);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.action' && messageData.payload.data.action_definition === ActionDefinition.BUILDMAP) {
                    var newBuildMapAction = new BuildMapAction();
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

    }]);

    function BuildMapAction(newProps) {
        _classCallCheck(this, BuildMapAction);

        var _this = _possibleConstructorReturn(this, (BuildMapAction.__proto__ || Object.getPrototypeOf(BuildMapAction)).call(this, newProps));

        _this.updatedProps.actionDefinition = ActionDefinition.BUILDMAP;
        return _this;
    }

    _createClass(BuildMapAction, [{
        key: 'parse',
        value: function parse(JSONData) {
            _get(BuildMapAction.prototype.__proto__ || Object.getPrototypeOf(BuildMapAction.prototype), 'parse', this).call(this, JSONData);

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
                mapname: propsInputs.mapName
            };

            return assignDefined(Object.create(null), _get(BuildMapAction.prototype.__proto__ || Object.getPrototypeOf(BuildMapAction.prototype), 'toJSON', this).call(this), { inputs: inputs });
        }
    }]);

    return BuildMapAction;
}(Action);

module.exports = BuildMapAction;