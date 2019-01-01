'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc.
 * @author Nadir Muzaffar
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var assignDefined = require('../../../utilities/assignDefined.js');
var ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

var Action = require('../Action.js');

var URLAction = function (_Action) {
    _inherits(URLAction, _Action);

    /**
     * Creates an instance of WaitFor Action resource object
     * @constructor
     * @param {JSON} [newProps] New properties of a new WaitFor Action, refer to Action superclass for shared properties
     * @param {JSON} [newProps.inputs] Inputs needed for wait-for
     * @param {String} [newProps.inputs.url] The URL that the application should load
     */
    function URLAction(newProps) {
        _classCallCheck(this, URLAction);

        var _this = _possibleConstructorReturn(this, (URLAction.__proto__ || Object.getPrototypeOf(URLAction)).call(this, newProps));

        _this.updatedProps.actionDefinition = ActionDefinition.URL;
        return _this;
    }

    _createClass(URLAction, [{
        key: 'parse',
        value: function parse(JSONData) {
            _get(URLAction.prototype.__proto__ || Object.getPrototypeOf(URLAction.prototype), 'parse', this).call(this, JSONData);
            if (JSONData.inputs) {
                this.props.inputs = {
                    url: JSONData.inputs.url
                };
            } else {
                this.props.inputs = {};
            }

            if (JSONData.outputs) {
                this.props.outputs = {
                    responseCode: JSONData.outputs.response_code
                };
            } else {
                this.props.outputs = {};
            }
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var propsInputs = void 0;

            // Check if props has inputs, if object was initialized by user, it should have an empty props
            if (this.props && this.props.inputs) {
                propsInputs = assignDefined(this.props.inputs, this.updatedProps.inputs);
            } else {
                propsInputs = assignDefined(Object.create(null), this.updatedProps.inputs);
            }

            var inputs = {
                url: propsInputs.url
            };

            return assignDefined(Object.create(null), _get(URLAction.prototype.__proto__ || Object.getPrototypeOf(URLAction.prototype), 'toJSON', this).call(this), { inputs: inputs });
        }
    }]);

    return URLAction;
}(Action);

module.exports = URLAction;