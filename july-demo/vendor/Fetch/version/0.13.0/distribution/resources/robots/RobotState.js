'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Fetch imports

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FetchcoreClient = require('../../FetchcoreClient');

var ROBOT_STREAM_ENDPOINT = function ROBOT_STREAM_ENDPOINT(robotName) {
    if (robotName) {
        return '/api/v1/streams/robots/' + robotName + '/';
    }
    return '/api/v1/streams/robots/';
};

var ROBOT_ON_MAP_STREAM_ENDPOINT = function ROBOT_ON_MAP_STREAM_ENDPOINT(mapId) {
    return '/api/v1/streams/maps/' + mapId + '/robots/';
};

var RobotState = function () {
    _createClass(RobotState, null, [{
        key: 'createRobotStateList',


        /**
         * Returns a list of RobotState resource object
         * @param {JSON} responseData Data coming from server response
         * @return {Array} robotStateList
         */
        value: function createRobotStateList(responseData) {
            var robotStateList = [];
            responseData.results.forEach(function (data) {
                robotStateList.push(new RobotState(data));
            });
            return robotStateList;
        }

        /**
         * Subscribes to a robot with a callback and receives all the updates through data stream
         * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'subscribeTo',
        value: function subscribeTo(robotName, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = ROBOT_STREAM_ENDPOINT(robotName);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.robotstate') {
                    return new RobotState(messageData.payload.data);
                }
            });
        }

        /**
         * Unsubscribes to a robot through the callback that was previously submitted for subscription
         * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'unsubscribeTo',
        value: function unsubscribeTo(robotName, handleStreamMessage) {
            FetchcoreClient.defaultClient().unsubscribe(ROBOT_STREAM_ENDPOINT(robotName), handleStreamMessage);
        }

        /**
         * Subscribes to all robots with a callback and receives all the robot state updates through data stream
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'subscribeToAll',
        value: function subscribeToAll(handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = ROBOT_STREAM_ENDPOINT();
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.robotstate') {
                    return new RobotState(messageData.payload.data);
                }
            });
        }

        /**
         * Unsubscribes to all robots through the callback that was previously submitted for subscription
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'unsubscribeToAll',
        value: function unsubscribeToAll(handleStreamMessage) {
            FetchcoreClient.defaultClient().unsubscribe(ROBOT_STREAM_ENDPOINT(), handleStreamMessage);
        }

        /**
         * Subscribes to all robots on a given map with a callback and receives all the robot state updates through data stream
         * @param {Number} mapId
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'subscribeToAllOnMap',
        value: function subscribeToAllOnMap(mapId, handleStreamMessage) {
            var client = FetchcoreClient.defaultClient();
            var endpoint = ROBOT_ON_MAP_STREAM_ENDPOINT(mapId);
            client.subscribe(endpoint, handleStreamMessage, function (message) {
                var messageData = JSON.parse(message.data);
                if (messageData.payload.model === 'api.robotstate') {
                    return new RobotState(messageData.payload.data);
                }
            });
        }

        /**
         * Unsubscribes to all robots on a given map through the callback that was previously submitted for subscription
         * @param {Number} mapId
         * @param {Function} handleStreamMessage Callback for handling stream messages
         */

    }, {
        key: 'unsubscribeToAllOnMap',
        value: function unsubscribeToAllOnMap(mapId, handleStreamMessage) {
            FetchcoreClient.defaultClient().unsubscribe(ROBOT_ON_MAP_STREAM_ENDPOINT(mapId), handleStreamMessage);
        }

        /**
         * Gets robot state from the server
         * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
         * @return {Promise.<Robot>} When promise resolves, it will return a RobotState resource object
         */

    }, {
        key: 'get',
        value: function get(robotName) {
            var client = FetchcoreClient.defaultClient();
            if (robotName == null) {
                return;
            }
            return client.get(RobotState.ENDPOINT, robotName).then(RobotState.handleResponse).catch(RobotState.handleError);
        }

        /**
         * Gets all robot states from the server
         * @param {Number} pageNumber Page number for the paginated list of RobotStates
         * @return {Promise.<Array>} When promise resolves, it will return a list of RobotState resource objects
         */

    }, {
        key: 'all',
        value: function all(pageNumber) {
            var client = FetchcoreClient.defaultClient();
            var params = {
                page: pageNumber
            };
            return client.get(RobotState.ENDPOINT, undefined, params).then(RobotState.handleResponse).catch(RobotState.handleError);
        }

        /**
         * Returns a RobotState resource object
         * @param {JSON} res HTTP response from server
         * @return {Robot} robot
         */

    }, {
        key: 'handleResponse',
        value: function handleResponse(res) {
            if (res.data.count) {
                return RobotState.createRobotStateList(res.data);
            }
            return new RobotState(res.data);
        }

        /**
         * Throws a custom error
         * @param {ClientError} clientError Client error coming from defaultClient object
         * @throws {ClientError} clientError
         */

    }, {
        key: 'handleError',
        value: function handleError(clientError) {
            // We have the option to attach more attributes to this object before throwing it
            throw clientError;
        }

        /**
         * Creates an instance of RobotState resource object
         * @constructor
         * @param {JSON} props Properties of a new RobotState
         */

    }, {
        key: 'ENDPOINT',


        /**
         * Returns the server endpoint for robot state data
         * @return {String} ROBOT_STATE_ENDPOINT
         */
        get: function get() {
            return 'api/v1/robots/states/';
        }
    }]);

    function RobotState(props) {
        _classCallCheck(this, RobotState);

        // Consumers may not assign new value to props; they cannot save or update RobotStates
        this.props = props;
    }

    /**
     * @type {Number}
     */


    _createClass(RobotState, [{
        key: 'batteryLevel',
        get: function get() {
            return this.props.battery_level;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'localizationWeight',
        get: function get() {
            return this.props.localization_weight;
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
         * @type {Number}
         */

    }, {
        key: 'robotBatteryVoltage',
        get: function get() {
            return this.props.robot_battery_voltage;
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
         * @type {String}
         */

    }, {
        key: 'robot',
        get: function get() {
            return this.props.robot;
        }

        /**
         * @type {JSON}
         */

    }, {
        key: 'currentPose',
        get: function get() {
            return this.props.current_pose;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'wifiStrength',
        get: function get() {
            return this.props.wifi_strength;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'lastDeepCharge',
        get: function get() {
            return this.props.last_deep_charge;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'id',
        get: function get() {
            return this.props.id;
        }
    }]);

    return RobotState;
}();

module.exports = RobotState;