'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Thirdparty imports

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebSocket = require('websocket').w3cwebsocket;

/*  eslint no-console: 0*/

var FetchSocket = function () {
    /**
     * Creates an instance of auto-reconnect WebSocket
     * @this FetchSocket
     * @param {String} streamUrl The URL of the stream source
     * @param {Object} socketEventHandlers An object that holds the event handlers for socket events
     */
    function FetchSocket(streamUrl, socketEventHandlers) {
        _classCallCheck(this, FetchSocket);

        this.maxTimeout = 8000;
        this.timeout = 500;
        this.streamUrl = streamUrl;
        this.onSocketOpen = socketEventHandlers.onSocketOpen;
        this.onSocketMessage = socketEventHandlers.onSocketMessage;
        this.onSocketClose = socketEventHandlers.onSocketClose;
        this.onSocketError = socketEventHandlers.onSocketError;
    }

    /**
     * Sends a message to upstream
     * @this FetchSocket
     * @param {String} message The JSON.stringified message that goes to the server
     */


    _createClass(FetchSocket, [{
        key: 'send',
        value: function send(message) {
            if (this.ws) {
                this.ws.send(message);
            } else {
                console.log('Web socket is not connected, cannot send message');
            }
        }

        /**
         * Sets up connection with stream endpoint
         * @this FetchSocket
         */

    }, {
        key: 'connect',
        value: function connect() {
            var _this = this;

            // Initializing stream connection
            var ws = new WebSocket(this.streamUrl);

            this.onopen = function () {
                console.log('Connection to ' + _this.streamUrl + ' is opened');
                if (_this.onSocketOpen) {
                    _this.onSocketOpen();
                }

                _this.timeout = 500;

                if (_this.nextReconnectTimeoutID) {
                    clearTimeout(_this.nextReconnectTimeoutID);
                    delete _this.nextReconnectTimeoutID;
                }
            };

            this.onmessage = function (message) {
                if (_this.onSocketMessage) {
                    _this.onSocketMessage(message);
                }
            };

            this.onerror = function () {
                console.log('Error occured, ' + _this.streamUrl + ' is closing');
                if (_this.onSocketError) {
                    _this.onSocketError(_this);
                }
                _this.ws.close();
            };

            this.onclose = function () {
                console.log('Connection to ' + _this.streamUrl + ' is closed');
                _this.reconnect();
            };

            ws.onopen = this.onopen;
            ws.onclose = this.onclose;
            ws.onmessage = this.onmessage;
            ws.onerror = this.onerror;

            this.ws = ws;
        }

        /**
         * Updates the onSocketMessage callback for instance of FetchSocket
         * @this FetchSocket
         * @param {Function} newOnSocketMessage The new callback for when message from stream is received
         */

    }, {
        key: 'updateOnSocketMessage',
        value: function updateOnSocketMessage(newOnSocketMessage) {
            this.onSocketMessage = newOnSocketMessage;
        }

        /**
         * Reconnects the WebSocket asynchrously by instantiating a new WebSocket
         * @this FetchSocket
         */

    }, {
        key: 'reconnect',
        value: function reconnect() {
            var _this2 = this;

            console.log('Attempting to reconnect to ' + this.streamUrl + ' in ' + this.timeout + ' ms');
            this.nextReconnectTimeoutID = setTimeout(function () {
                var reconnectingSocket = new WebSocket(_this2.streamUrl);
                if (_this2.timeout < _this2.maxTimeout) {
                    _this2.timeout *= 2;
                }

                // Assign all the corresponding callbacks
                reconnectingSocket.onopen = _this2.onopen;
                reconnectingSocket.onmessage = _this2.onmessage;
                reconnectingSocket.onclose = _this2.onclose;
                reconnectingSocket.onerror = _this2.onerror;

                // Re-assign instance of websocket
                _this2.ws = reconnectingSocket;
            }, this.timeout);
        }

        /**
         * Closes socket instance without any more attempts to reconnect
         * @this FetchSocket
         */

    }, {
        key: 'forceClose',
        value: function forceClose() {
            var _this3 = this;

            this.ws.onclose = function () {
                console.log('Connection to ' + _this3.streamUrl + ' is closed without attempts to reconnect');
                if (_this3.onSocketClose) {
                    _this3.onSocketClose();
                }
            };

            if (this.nextReconnectTimeoutID) {
                clearTimeout(this.nextReconnectTimeoutID);
                delete this.nextReconnectTimeoutID;
            }

            this.ws.close();
        }
    }]);

    return FetchSocket;
}();

module.exports = FetchSocket;