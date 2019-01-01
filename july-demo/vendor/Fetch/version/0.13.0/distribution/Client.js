'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Thirparty imports

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

// Fetch imports
var ClientError = require('./errors/ClientError');
var FetchSocket = require('./FetchSocket');

/**
 * @class Client
 * @classdesc Client provides wrapper for HTTP requests to server
 */

var Client = function () {
    function Client(hostname, port, enableSSL) {
        _classCallCheck(this, Client);

        this._token = undefined;
        this.configure(hostname, port, enableSSL);
    }

    /**
     * Returns the server endpoint for submitting authentication credentials
     * @return {String} AUTH_ENDPOINT
     */


    _createClass(Client, [{
        key: 'configure',


        /**
         * Fills in the required information for connection to server
         * @this Client
         * @param {String} hostname The hostname for fetchcore server
         * @param {Number} port The port number for fetchcore server
         */
        value: function configure(hostname, port, enableSSL) {
            this.hostname = hostname;
            this.port = port;
            this.enableSSL = enableSSL;

            if (this.enableSSL) {
                this.baseURL = 'https://' + this.hostname + ':' + this.port + '/';
            } else {
                this.baseURL = 'http://' + this.hostname + ':' + this.port + '/';
            }

            this.request = axios.create({ baseURL: this.baseURL });
            this.connectedStreams = Object.create(null);
        }

        /**
         * Authenticates the current instance of client and returns a request promise
         * @this Client
         * @param {String} username The username for login to fetchcore server
         * @param {String} password The password for login to fetchcore server
         */

    }, {
        key: 'authenticate',
        value: function authenticate(username, password) {
            var _this = this;

            var resourceUrl = Client.parseURL(Client.AUTH_ENDPOINT);
            return this.request.post(resourceUrl, { username: username, password: password }).then(function (httpResObj) {
                _this.token = httpResObj;
                // Re-instantiate axios instance with the new token
                _this.request = axios.create({
                    baseURL: _this.baseURL,
                    headers: {
                        AUTHORIZATION: 'Token ' + _this.token
                    }
                });
            }).catch(Client.handleError);
        }

        /**
         * @this Client
         * @return {Boolean}
         */

    }, {
        key: 'subscribe',


        /**
         * Subscribes a callback to a specific WebSocket channel
         * @this Client
         * @param {String} endpoint The endpoint to WebSocket stream
         * @param {Function} onMessageCallback The callback that is subscribed to the WebSocket stream
         * @param {Function} parseMessage The function that parses stream message into a resource object
         */
        value: function subscribe(endpoint, onMessageCallback, parseMessage) {
            var _this2 = this;

            var streamUrl = this.getStreamUrl(endpoint);

            // If stream is already connected, add the onMessageCallback to the FetchSocket instance
            if (this.connectedStreams[streamUrl] && this.connectedStreams[streamUrl].socket) {
                var socket = this.connectedStreams[streamUrl].socket;

                var doesCallbackExist = false;
                this.connectedStreams[streamUrl].messageHandlers.forEach(function (handler) {
                    if (handler.callback === onMessageCallback) {
                        doesCallbackExist = true;
                    }
                });

                if (doesCallbackExist) {
                    return;
                }

                this.connectedStreams[streamUrl].messageHandlers.push({
                    callback: onMessageCallback,
                    parseFunction: parseMessage
                });

                socket.updateOnSocketMessage(function (message) {
                    _this2.connectedStreams[streamUrl].messageHandlers.forEach(function (handler) {
                        var callback = handler.callback,
                            parseFunction = handler.parseFunction;
                        // If parseMessage does not return an object, onMessage will not be called

                        var resourceObject = parseFunction(message);
                        if (resourceObject) {
                            callback(resourceObject);
                        }
                    });
                });
            } else {
                var handleSocketClose = function handleSocketClose() {
                    delete _this2.connectedStreams[streamUrl];
                };

                var handleSocketMessage = function handleSocketMessage(message) {
                    _this2.connectedStreams[streamUrl].messageHandlers.forEach(function (handler) {
                        var callback = handler.callback,
                            parseFunction = handler.parseFunction;

                        var resourceObject = parseFunction(message);
                        if (resourceObject) {
                            callback(resourceObject);
                        }
                    });
                };

                // Store instance of the websocket in Client
                var newSocketInstance = new FetchSocket(streamUrl, {
                    onSocketMessage: handleSocketMessage,
                    onSocketClose: handleSocketClose
                });
                newSocketInstance.connect();
                this.connectedStreams[streamUrl] = {
                    socket: newSocketInstance
                };

                this.connectedStreams[streamUrl].messageHandlers = [{
                    callback: onMessageCallback,
                    parseFunction: parseMessage
                }];
            }
        }

        /**
         * Unsubscribes a callback from a specific WebSocket channel
         * @this Client
         * @param {String} endpoint The endpoint to WebSocket stream
         * @param {Function} onMessageCallback The callback that is going to be unsubscribed from the WebSocket stream
         */

    }, {
        key: 'unsubscribe',
        value: function unsubscribe(endpoint, onMessageCallback) {
            var streamUrl = this.getStreamUrl(endpoint);

            if (this.connectedStreams[streamUrl] == null || this.connectedStreams[streamUrl].socket == null) {
                return;
            }

            var socketInstance = this.connectedStreams[streamUrl].socket;
            if (this.connectedStreams[streamUrl].messageHandlers) {
                var handlers = this.connectedStreams[streamUrl].messageHandlers;
                var foundCallbackAtIndex = void 0;
                for (var i = 0; i < handlers.length; i += 1) {
                    if (handlers[i].callback === onMessageCallback) {
                        foundCallbackAtIndex = i;
                    }
                }
                if (foundCallbackAtIndex != null) {
                    this.connectedStreams[streamUrl].messageHandlers.splice(foundCallbackAtIndex, 1);
                }

                var numberOfHandlers = this.connectedStreams[streamUrl].messageHandlers.length;
                if (numberOfHandlers === 0) {
                    socketInstance.forceClose();
                }
            }
        }

        /**
         * Parses and formats an endpoint into a WebSocket stream URL
         * @this Client
         * @param {String} endpoint The endpoint of a resource on the server
         * @return {String} streamUrl
         */

    }, {
        key: 'getStreamUrl',
        value: function getStreamUrl(endpoint) {
            if (this.enableSSL) {
                return 'wss://' + this.hostname + ':' + this.port + endpoint + '?token=' + this.token;
            }
            return 'ws://' + this.hostname + ':' + this.port + endpoint + '?token=' + this.token;
        }

        /**
         * Dispatches a GET request to an endpoint of a resource on the server
         * @this Client
         * @param {String} endpoint The endpoint of a resource on the server
         * @param {String} resourceId The ID of a resource
         * @param {JSON} params The query parameters for a GET request
         */

    }, {
        key: 'get',
        value: function get(endpoint, resourceId, params) {
            var resourceUrl = Client.parseURL(endpoint, resourceId);
            var config = { params: params };
            return this.request.get(resourceUrl, config).catch(Client.handleError);
        }

        /**
         * Dispatches a POST request to an endpoint of a resource on the server
         * @this Client
         * @param {String} endpoint The endpoint of a resource on the server
         * @param {JSON} data The data which are to be saved on the server
         */

    }, {
        key: 'post',
        value: function post(endpoint, data, config) {
            var resourceUrl = Client.parseURL(endpoint);
            return this.request.post(resourceUrl, data, config).catch(Client.handleError);
        }

        /**
         * Dispatches a DELETE request to an endpoint of a resource on the server
         * @this Client
         * @param {String} endpoint The endpoint of a resource on the server
         * @param {String} resourceId The ID of a resource
         */

    }, {
        key: 'delete',
        value: function _delete(endpoint, resourceId) {
            var resourceUrl = Client.parseURL(endpoint, resourceId);
            return this.request.delete(resourceUrl).catch(Client.handleError);
        }

        /**
         * Dispatches a PUT request to an endpoint of a resource on the server
         * @this Client
         * @param {String} endpoint The endpoint of a resource on the server
         * @param {String} resourceId The ID of a resource
         * @param {JSON} data The data which are to be saved on the server
         */

    }, {
        key: 'put',
        value: function put(endpoint, resourceId, data) {
            var resourceUrl = Client.parseURL(endpoint, resourceId);

            return this.request.put(resourceUrl, data).catch(Client.handleError);
        }

        /**
         * Dispatches a PATCH request to an endpoint of a resource on the server
         * @this Client
         * @param {String} endpoint The endpoint of a resource on the server
         * @param {String|Number} resourceId The ID of a resource
         * @param {JSON} data The data which are to be saved on the server
         */

    }, {
        key: 'patch',
        value: function patch(endpoint, resourceId, data) {
            var resourceUrl = Client.parseURL(endpoint, resourceId);

            return this.request.patch(resourceUrl, data).catch(Client.handleError);
        }
    }, {
        key: 'isAuthenticated',
        get: function get() {
            return !(this._token === undefined);
        }

        /**
         * Returns auth token
         * @this Client
         * @return {String} token
         */

    }, {
        key: 'token',
        get: function get() {
            return this._token;
        }

        /**
         * Sets auth token
         * @this Client
         * @param {JSON} httpResponseObject The HTTP response from server
         */
        ,
        set: function set(httpResponseObject) {
            var authData = httpResponseObject.data;
            this._token = authData.token;
            this._currentUserId = authData.user;
        }
    }], [{
        key: 'parseURL',


        /**
         * Returns a parsed URL
         * @return {String} parsedUrl
         */
        value: function parseURL(endpoint, id) {
            if (id == null) {
                return '' + endpoint;
            }
            return '' + endpoint + id + '/';
        }

        /**
         * Throws a custom error object called ClientError
         * @throws {ClientError} clientError
         */

    }, {
        key: 'handleError',
        value: function handleError(error) {
            if (error.response) {
                throw new ClientError(error.response);
            }
            throw error;
        }
    }, {
        key: 'AUTH_ENDPOINT',
        get: function get() {
            return 'api/v1/auth/login';
        }
    }]);

    return Client;
}();

module.exports = Client;