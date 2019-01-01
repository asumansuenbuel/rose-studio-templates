'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Fetch imports

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FetchcoreClient = require('../../FetchcoreClient');
var ClientError = require('../../errors/ClientError');
var assignDefined = require('../../utilities/assignDefined');

var Robot = function () {
    _createClass(Robot, null, [{
        key: 'createRobotList',


        /**
         * Returns a list of Robot resource object
         * @param {JSON} responseData Data coming from server response
         * @return {Array} robotList
         */
        value: function createRobotList(responseData) {
            var robotList = [];
            responseData.results.forEach(function (data) {
                robotList.push(new Robot(data));
            });
            return robotList;
        }

        /**
         * Returns a Robot resource object
         * @param {JSON} res Response of server
         * @return {Robot|Array} robot
         */

    }, {
        key: 'handleResponse',
        value: function handleResponse(res) {
            if (res.data.count) {
                return Robot.createRobotList(res.data);
            }
            return new Robot(res.data);
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
         * Gets robot from the server
         * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
         * @return {Promise.<Robot>} serverResponse When promise resolves, it will return a Robot resource object
         */

    }, {
        key: 'get',
        value: function get(robotName) {
            var client = FetchcoreClient.defaultClient();
            if (robotName == null) {
                return;
            }
            return client.get(Robot.ENDPOINT, robotName).then(Robot.handleResponse).catch(Robot.handleError);
        }

        /**
         * Gets all robots from the server
         * @param {Number} pageNumber Page number for the paginated list of robots
         * @return {Promise.<Array>} When promise resolves, it will return a list of Robot resource objects
         */

    }, {
        key: 'all',
        value: function all(pageNumber) {
            var client = FetchcoreClient.defaultClient();
            var params = {
                page: pageNumber
            };
            return client.get(Robot.ENDPOINT, undefined, params).then(Robot.handleResponse).catch(Robot.handleError);
        }

        /**
         * Creates an instace of Robot resource object
         * @constructor
         * @param {JSON} props Properties of a new Robot
         */

    }, {
        key: 'ENDPOINT',


        /**
         * Returns the server endpoint for robot data
         * @return {String} ROBOT_ENDPOINT
         */
        get: function get() {
            return 'api/v1/robots/';
        }
    }]);

    function Robot(props) {
        _classCallCheck(this, Robot);

        var defaultProps = {
            footprint: 'FREIGHT100',
            configurations: ['MOBILE']
        };

        this.props = assignDefined(Object.create(null), defaultProps, props);
        this.updatedProps = Object.create(null);
    }

    _createClass(Robot, [{
        key: 'parse',
        value: function parse() {
            var resourceJSON = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.props = {
                status: resourceJSON.status,
                modified: resourceJSON.modified,
                name: resourceJSON.name,
                map: resourceJSON.map,
                created: resourceJSON.created,
                lastCharge: resourceJSON.last_charge,
                ip: resourceJSON.ip,
                lastConnectiontime: resourceJSON.last_connectiontime,
                apSsid: resourceJSON.ap_ssid,
                lastStatusChange: resourceJSON.last_status_change,
                lastBoot: resourceJSON.last_boot,
                footprint: resourceJSON.footprint,
                chargingState: resourceJSON.charging_state,
                id: resourceJSON.id,
                installedActions: resourceJSON.installed_actions,
                apMacAddress: resourceJSON.ap_mac_address,
                localized: resourceJSON.localized,
                configurations: resourceJSON.configurations
            };

            this.updatedProps = Object.create(null);
        }
    }, {
        key: 'toJSON',
        value: function toJSON() {
            var isPatch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var JSON = void 0;
            if (isPatch) {
                JSON = {
                    name: this.updatedProps.name,
                    map: this.updatedProps.map,
                    footprint: this.updatedProps.footprint,
                    installed_actions: this.updatedProps.installedActions,
                    configurations: this.updatedProps.configurations
                };
            } else {
                var props = assignDefined(this.props, this.updatedProps);
                JSON = {
                    name: props.name,
                    map: props.map,
                    footprint: props.footprint,
                    installed_actions: props.installedActions,
                    configurations: props.configurations
                };
            }

            return assignDefined(Object.create(null), JSON);
        }

        /**
         * Saves robot to the server
         * @param {String} password Password which is needed for saving robot to server
         * @this Robot
         * @return {Promise.<Robot>} When promise resolves, it will return a Robot resource object
         */

    }, {
        key: 'save',
        value: function save(password) {
            var client = FetchcoreClient.defaultClient();
            var data = assignDefined(Object.create(null), { password: password }, this.toJSON());

            if (this.isNew()) {
                return client.post(Robot.ENDPOINT, data).then(Robot.handleResponse).catch(Robot.handleError);
            }

            return client.put(Robot.ENDPOINT, this.name, data).then(Robot.handleResponse).catch(Robot.handleError);
        }

        /**
         * Updates attributes of robot on the server
         * @this Robot
         * @return {Promise.<Robot>} When promise resolves, it will return an updated Robot resource object
         */

    }, {
        key: 'update',
        value: function update() {
            var client = FetchcoreClient.defaultClient();
            var data = this.toJSON(true);
            return client.patch(Robot.ENDPOINT, this.name, data).then(Robot.handleResponse).catch(Robot.handleError);
        }

        /**
         * Deletes robot from the server
         * @this Robot
         * @return {Promise.<Robot>} When promise resolves, it will return a Robot resource object
         */

    }, {
        key: 'delete',
        value: function _delete() {
            var _this = this;

            var client = FetchcoreClient.defaultClient();
            if (this.isNew()) {
                throw new ClientError({
                    data: {
                        detail: 'This robot does not exist on server'
                    }
                });
            }
            return client.delete(Robot.ENDPOINT, this.name).then(function () {
                _this.isDeleted = true;
                return _this;
            }).catch(Robot.handleError);
        }

        /**
         * Checks if a Robot instance is new
         * @this Robot
         * @return {Boolean} isNew
         */

    }, {
        key: 'isNew',
        value: function isNew() {
            return this.id == null;
        }

        /**
         * Checks if a Robot instance is deleted
         * @this Robot
         * @return {Boolean} isDeleted
         */

    }, {
        key: 'isDeleted',
        value: function isDeleted() {
            if (this.isDeleted == null) {
                return false;
            }
            return this.isDeleted;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'name',
        get: function get() {
            if (this.updatedProps.name) {
                return this.updatedProps.name;
            }
            return this.props.name;
        },
        set: function set(value) {
            this.updatedProps.name = value;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'status',
        get: function get() {
            return this.props.status;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'map',
        get: function get() {
            if (this.updatedProps.map) {
                return this.updatedProps.map;
            }
            return this.props.map;
        },
        set: function set(value) {
            this.updatedProps.map = value;
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
        key: 'lastCharge',
        get: function get() {
            return this.props.last_charge;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'ip',
        get: function get() {
            return this.props.ip;
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
        key: 'lastConnectiontime',
        get: function get() {
            return this.props.last_connection_time;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'apSsid',
        get: function get() {
            return this.props.ap_ssid;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'lastStatusChange',
        get: function get() {
            return this.props.last_status_change;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'lastBoot',
        get: function get() {
            return this.props.last_boot;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'footprint',
        get: function get() {
            if (this.updatedProps.footprint) {
                return this.updatedProps.footprint;
            }
            return this.props.footprint;
        },
        set: function set(value) {
            this.updatedProps.footprint = value;
        }

        /**
         * @type {Boolean}
         */

    }, {
        key: 'chargingState',
        get: function get() {
            return this.props.charging_state;
        }

        /**
         * @type {Array}
         */

    }, {
        key: 'installedActions',
        get: function get() {
            if (this.updatedProps.installed_actions) {
                return this.updatedProps.installed_actions;
            }
            return this.props.installed_actions;
        },
        set: function set(value) {
            this.updatedProps.installed_actions = value;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'apMacAddress',
        get: function get() {
            return this.props.ap_mac_address;
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
         * @type {Boolean}
         */

    }, {
        key: 'localized',
        get: function get() {
            return this.props.localized;
        }

        /**
         * @type {Array}
         */

    }, {
        key: 'configurations',
        get: function get() {
            if (this.updatedProps.configurations) {
                return this.updatedProps.configurations;
            }
            return this.props.configurations;
        },
        set: function set(value) {
            this.updatedProps.configurations = value;
        }
    }]);

    return Robot;
}();

module.exports = Robot;