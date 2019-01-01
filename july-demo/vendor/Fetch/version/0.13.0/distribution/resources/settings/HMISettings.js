'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc.
 * @author Nadir Muzaffar
 */

// Fetch imports

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FetchcoreClient = require('../../FetchcoreClient');
var assignDefined = require('../../utilities/assignDefined');

// TODO: create a parent Resource object

var HMISettings = function () {
    _createClass(HMISettings, null, [{
        key: 'handleResponse',


        /**
         * Returns a HMISettings resource object
         * @param {JSON} res Response of server
         * @return {HMISettings}
         */
        value: function handleResponse(res) {
            var hmiSettings = new HMISettings();
            hmiSettings.parse(res.data);
            return hmiSettings;
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
         * Gets HMISettings from the server
         * @return {Promise.<HMISettings>} When promise resolves, it will return a HMISettings resource object
         */

    }, {
        key: 'get',
        value: function get() {
            var client = FetchcoreClient.defaultClient();

            return client.get(HMISettings.ENDPOINT).then(HMISettings.handleResponse).catch(HMISettings.handleError);
        }
    }, {
        key: 'ENDPOINT',

        /**
         * Returns the server endpoint for HMISettings data
         * @return {String}
         */
        get: function get() {
            return 'api/v1/system/settings/hmi/';
        }
    }, {
        key: 'defaultProps',
        get: function get() {
            return {
                defaultURL: 'http://www.fetchrobotics.com'
            };
        }

        /**
         * Creates an instance of HMISettings resource object
         *
         * @constructor
         * @param {JSON} [newProps] Properties of a new HMISettings
         * @param {String} [newProps.defaultURL] The default url that HMI screen should load.
         */

    }]);

    function HMISettings() {
        var newProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Object.create(null);

        _classCallCheck(this, HMISettings);

        this.props = Object.create(null);
        this.updatedProps = assignDefined(Object.create(null), HMISettings.defaultProps, newProps);
    }

    _createClass(HMISettings, [{
        key: 'toJSON',
        value: function toJSON() {
            var isPatch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var JSON = void 0;

            if (isPatch) {
                JSON = {
                    default_url: this.updatedProps.defaultURL
                };
            } else {
                var props = assignDefined(this.props, this.updatedProps);
                JSON = {
                    default_url: props.defaultURL
                };
            }

            Object.keys(JSON).forEach(function (key) {
                if (JSON[key] === undefined) {
                    delete JSON[key];
                }
            });

            return JSON;
        }
    }, {
        key: 'parse',
        value: function parse() {
            var resourceJSON = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this.props = {
                modified: resourceJSON.modified,
                created: resourceJSON.created,
                id: resourceJSON.id,
                defaultURL: resourceJSON.default_url
            };

            this.updatedProps = Object.create(null);
        }

        /**
         * Saves HMISettings to server to the server
         * @this HMISettings
         * @return {Promise.<HMISettings>} When promise resolves, it will return a HMISettings resource object
         */

    }, {
        key: 'save',
        value: function save() {
            var client = FetchcoreClient.defaultClient();
            var data = this.toJSON();

            return client.put(HMISettings.ENDPOINT, null, data).then(HMISettings.handleResponse).catch(HMISettings.handleError);
        }

        /**
         * Updates attributes of HMISettings on server
         * @this HMISettings
         * @return {Promise.<HMISettings>} When promise resolves, it will return an updated HMISettings resource object
         */

    }, {
        key: 'update',
        value: function update() {
            var client = FetchcoreClient.defaultClient();
            var data = this.toJSON(true);

            return client.patch(HMISettings.ENDPOINT, null, data).then(HMISettings.handleResponse).catch(HMISettings.handleError);
        }

        /**
         * @type {String}
         */

    }, {
        key: 'defaultURL',
        get: function get() {
            if (this.updatedProps.defaultURL) {
                return this.updatedProps.defaultURL;
            }

            return this.props.defaultURL;
        },
        set: function set(url) {
            this.updatedProps.defaultURL = url;
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
        key: 'created',
        get: function get() {
            return this.props.created;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'id',
        get: function get() {
            return this.props.id;
        }
    }]);

    return HMISettings;
}();

module.exports = HMISettings;