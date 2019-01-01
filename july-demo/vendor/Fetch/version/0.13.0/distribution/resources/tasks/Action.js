'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assignDefined = require('../../utilities/assignDefined.js');
var FetchcoreClient = require('../../FetchcoreClient');

var Action = function () {
    _createClass(Action, null, [{
        key: 'handleResponse',


        /**
         * Converts JSON into an Action resource object
         * @param {JSON} res The response of server
         * @return {Action} newAction
         */
        value: function handleResponse(response) {
            if (response.data.count !== undefined) {
                return Action.createActionList(response.data);
            }

            var newAction = new Action();
            newAction.parse(response.data);

            return newAction;
        }

        /**
        * Converts JSON data into a list of Action resource object
         * @param {JSON} responseData The data coming from server response
         * @return {Array} actionList
         */

    }, {
        key: 'createActionList',
        value: function createActionList(responseData) {
            var actionList = [];
            responseData.results.forEach(function (data) {
                var newAction = new Action();
                newAction.parse(data);
                actionList.push(newAction);
            });
            return actionList;
        }

        /**
         * Throws a custom error
         * @param {ClientError} clientError The client error coming from defaultClient object
         * @throws {ClientError} clientError
         */

    }, {
        key: 'handleError',
        value: function handleError(clientError) {
            // We have the option to attach more attributes to this object before throwing it
            throw clientError;
        }
    }, {
        key: 'actionStreamEndpoint',
        value: function actionStreamEndpoint(robotName) {
            if (robotName) {
                return '/api/v1/streams/tasks/' + robotName + '/';
            }
            return '/api/v1/streams/tasks/';
        }

        /**
         * Creates an instance of Action resource object
         * @constructor
         * @param {JSON} newProps New properties of a new Action
         * @param {String} newProps.status Status of this action
         * @param {String} newProps.preemptable
         * @param {Integer} [newProps.task] ID of a task that this action belongs to
         */

    }, {
        key: 'ENDPOINT',


        /**
         * Returns the server endpoint for action data
         * @return {String} ACTION_ENDPOINT
         */
        get: function get() {
            return 'api/v1/tasks/actions/';
        }
    }, {
        key: 'defaultProps',
        get: function get() {
            return {
                status: 'NEW',
                preemptable: 'NONE',
                inputs: {},
                outputs: {}
            };
        }
    }]);

    function Action() {
        var newProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Object.create(null);

        _classCallCheck(this, Action);

        this.props = Object.create(null);
        this.updatedProps = assignDefined(Object.create(null), Action.defaultProps, newProps);
    }

    _createClass(Action, [{
        key: 'toJSON',
        value: function toJSON() {
            var isPatch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var JSON = void 0;

            if (isPatch) {
                JSON = {
                    status: this.updatedProps.status,
                    preemptable: this.updatedProps.preemptable,
                    task: this.updatedProps.task,
                    start: this.updatedProps.start,
                    end: this.updatedProps.end,
                    created: this.updatedProps.created,
                    modified: this.updatedProps.modified,
                    on_complete: this.updatedProps.onComplete,
                    action_definition: this.updatedProps.actionDefinition,
                    outputs: this.updatedProps.outputs
                };
            } else {
                var properties = assignDefined(this.props, this.updatedProps);

                JSON = {
                    id: properties.id,
                    status: properties.status,
                    preemptable: properties.preemptable,
                    task: properties.task,
                    start: properties.start,
                    end: properties.end,
                    created: properties.created,
                    modified: properties.modified,
                    on_complete: properties.onComplete,
                    action_definition: properties.actionDefinition,
                    outputs: properties.outputs
                };
            }
            return assignDefined(Object.create(null), JSON);
        }
    }, {
        key: 'parse',
        value: function parse() {
            var resourceJSON = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.props = {
                actionDefinition: resourceJSON.action_definition,
                status: resourceJSON.status,
                preemptable: resourceJSON.preemptable,
                task: resourceJSON.task,
                start: resourceJSON.start,
                end: resourceJSON.end,
                created: resourceJSON.created,
                modified: resourceJSON.modified,
                id: resourceJSON.id,
                onComplete: resourceJSON.on_complete
            };

            this.updatedProps = Object.create(null);
        }

        /**
         * Updates attributes of action on server
         * @this Action
         * @return {Promise.<Task>} When promise resolves, it will return an updated Action resource object
         */

    }, {
        key: 'update',
        value: function update() {
            var client = FetchcoreClient.defaultClient();
            var data = this.toJSON(true);
            return client.patch(Action.ENDPOINT, this.id, data).then(this.constructor.handleResponse) // Using this.constructor to perform static method overriding
            .catch(Action.handleError);
        }

        /**
         * Checks if an instance of Action is a new Action that has yet been persisted to database
         * @this Action
         * @return {Boolean} isNew
         */

    }, {
        key: 'isNew',
        value: function isNew() {
            return this.props.id === undefined;
        }

        /**
         * Unsubscribes to Action of a particular robot through the callback that was previously submitted for
         * subscription
         * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'status',


        /**
         * @type {String}
         */
        get: function get() {
            if (this.updatedProps.status) {
                return this.updatedProps.status;
            }
            return this.props.status;
        },
        set: function set(value) {
            this.updatedProps.status = value;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'preemptable',
        get: function get() {
            if (this.updatedProps.preemptable) {
                return this.updatedProps.preemptable;
            }
            return this.props.preemptable;
        },
        set: function set(value) {
            this.updatedProps.preemptable = value;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'task',
        get: function get() {
            return this.props.task;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'start',
        get: function get() {
            return this.props.start;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'end',
        get: function get() {
            return this.props.end;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'created',
        get: function get() {
            return this.props.created;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'modified',
        get: function get() {
            return this.props.modified;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'id',
        get: function get() {
            return this.props.id;
        }

        /**
         * @type {Array.<JSON>}
         */

    }, {
        key: 'onComplete',
        get: function get() {
            if (this.updatedProps.onComplete) {
                return this.updatedProps.onComplete;
            }
            return this.props.onComplete;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'actionDefinition',
        get: function get() {
            return this.props.actionDefinition;
        }

        /**
         * @type {Array.<JSON>}
         */

    }, {
        key: 'inputs',
        get: function get() {
            if (this.updatedProps.inputs) {
                return this.updatedProps.inputs;
            }
            return this.props.inputs;
        },
        set: function set(value) {
            this.updatedProps.inputs = value;
        }

        /**
         * @type {Array.<JSON>}
         */

    }, {
        key: 'outputs',
        get: function get() {
            return this.props.outputs;
        },
        set: function set(value) {
            this.updatedProps.outputs = value;
        }
    }], [{
        key: 'unsubscribeTo',
        value: function unsubscribeTo(robotName, handleStreamMessage) {
            FetchcoreClient.defaultClient().unsubscribe(Action.actionStreamEndpoint(robotName), handleStreamMessage);
        }
    }]);

    return Action;
}();

module.exports = Action;