'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Thirdparty imports
const WebSocket = require('websocket').w3cwebsocket;

/*  eslint no-console: 0*/
class FetchSocket {
    /**
     * Creates an instance of auto-reconnect WebSocket
     * @this FetchSocket
     * @param {String} streamUrl The URL of the stream source
     * @param {Object} socketEventHandlers An object that holds the event handlers for socket events
     */
    constructor(streamUrl, socketEventHandlers) {
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
    send(message) {
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
    connect() {
        // Initializing stream connection
        const ws = new WebSocket(this.streamUrl);

        this.onopen = () => {
            console.log(`Connection to ${this.streamUrl} is opened`);
            if (this.onSocketOpen) {
                this.onSocketOpen();
            }

            this.timeout = 500;

            if (this.nextReconnectTimeoutID) {
                clearTimeout(this.nextReconnectTimeoutID);
                delete this.nextReconnectTimeoutID;
            }
        };

        this.onmessage = (message) => {
            if (this.onSocketMessage) {
                this.onSocketMessage(message);
            }
        };

        this.onerror = () => {
            console.log(`Error occured, ${this.streamUrl} is closing`);
            if (this.onSocketError) {
                this.onSocketError(this);
            }
            this.ws.close();
        };

        this.onclose = () => {
            console.log(`Connection to ${this.streamUrl} is closed`);
            this.reconnect();
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
    updateOnSocketMessage(newOnSocketMessage) {
        this.onSocketMessage = newOnSocketMessage;
    }

    /**
     * Reconnects the WebSocket asynchrously by instantiating a new WebSocket
     * @this FetchSocket
     */
    reconnect() {
        console.log(`Attempting to reconnect to ${this.streamUrl} in ${this.timeout} ms`);
        this.nextReconnectTimeoutID = setTimeout(() => {
            const reconnectingSocket = new WebSocket(this.streamUrl);
            if (this.timeout < this.maxTimeout) {
                this.timeout *= 2;
            }

            // Assign all the corresponding callbacks
            reconnectingSocket.onopen = this.onopen;
            reconnectingSocket.onmessage = this.onmessage;
            reconnectingSocket.onclose = this.onclose;
            reconnectingSocket.onerror = this.onerror;

            // Re-assign instance of websocket
            this.ws = reconnectingSocket;
        }, this.timeout);
    }

    /**
     * Closes socket instance without any more attempts to reconnect
     * @this FetchSocket
     */
    forceClose() {
        this.ws.onclose = () => {
            console.log(`Connection to ${this.streamUrl} is closed without attempts to reconnect`);
            if (this.onSocketClose) {
                this.onSocketClose();
            }
        };

        if (this.nextReconnectTimeoutID) {
            clearTimeout(this.nextReconnectTimeoutID);
            delete this.nextReconnectTimeoutID;
        }

        this.ws.close();
    }
}

module.exports = FetchSocket;
