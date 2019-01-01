'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Thirparty imports
const axios       = require('axios');
const rp          = require('request-promise');
// Fetch imports
const ClientError = require('./errors/ClientError');
const FetchSocket = require('./FetchSocket');

/**
 * @class Client
 * @classdesc Client provides wrapper for HTTP requests to server
 */
class Client {
    constructor(hostname, port, enableSSL, proxy) {
        this._token = undefined;
        this.configure(hostname, port, enableSSL, proxy);
    }

    /**
     * Returns the server endpoint for submitting authentication credentials
     * @return {String} AUTH_ENDPOINT
     */
    static get AUTH_ENDPOINT() {
        return 'api/v1/auth/login';
    }

    /**
     * Returns a parsed URL
     * @return {String} parsedUrl
     */
    static parseURL(endpoint, id) {
        if (id == null) {
            return `${endpoint}`;
        }
        return `${endpoint}${id}/`;
    }

    /**
     * Throws a custom error object called ClientError
     * @throws {ClientError} clientError
     */
    static handleError(res) {
        if (res.error) {
            throw new ClientError(res);
        }
        throw res;
    }

    /**
     * Fills in the required information for connection to server
     * @this Client
     * @param {String} hostname The hostname for fetchcore server
     * @param {Number} port The port number for fetchcore server
     */
    configure(hostname, port, enableSSL, proxy) {
        this.hostname = hostname;
        this.port = port;
        this.enableSSL = enableSSL;
        this.proxy = proxy;

        if (this.enableSSL) {
            this.baseURL = `https://${this.hostname}:${this.port}/`;
        } else {
            this.baseURL = `http://${this.hostname}:${this.port}/`;
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
    authenticate(username, password) {
        const resourceUrl = Client.parseURL(Client.AUTH_ENDPOINT);
        return this.request
            .post(resourceUrl, { username, password })
            .then((httpResObj) => {
                this.token = httpResObj;
                // Re-instantiate axios instance with the new token
                this.request = axios.create({
                    baseURL: this.baseURL,
                    headers: {
                        AUTHORIZATION: `Token ${this.token}`
                    }
                });
            })
            .catch(Client.handleError);
    }

    SAPAuthenticate(username, password) {
        const resourceURL = Client.parseURL(Client.AUTH_ENDPOINT);
        const requestOptions = {
            method: 'POST',
            proxy: this.proxy,
            uri: `https://${this.hostname}/${resourceURL}`,
            port: this.port,
            form: {
                username,
                password
            }
        };

        return rp(requestOptions)
            .then((res) => {
                this.token = JSON.parse(res);
            })
            .catch(Client.handleError);
    }

    /**
     * @this Client
     * @return {Boolean}
     */
    get isAuthenticated() {
        return !(this._token === undefined);
    }

    /**
     * Returns auth token
     * @this Client
     * @return {String} token
     */
    get token() {
        return this._token;
    }

    /**
     * Sets auth token
     * @this Client
     * @param {JSON} httpResponseObject The HTTP response from server
     */
    set token(httpResponseObject) {
        // const authData = httpResponseObject.data;
        this._token = httpResponseObject.token;
        this._currentUserId = httpResponseObject.user;
    }

    /**
     * Subscribes a callback to a specific WebSocket channel
     * @this Client
     * @param {String} endpoint The endpoint to WebSocket stream
     * @param {Function} onMessageCallback The callback that is subscribed to the WebSocket stream
     * @param {Function} parseMessage The function that parses stream message into a resource object
     */
    subscribe(endpoint, onMessageCallback, parseMessage) {
        const streamUrl = this.getStreamUrl(endpoint);

        // If stream is already connected, add the onMessageCallback to the FetchSocket instance
        if (this.connectedStreams[streamUrl] && this.connectedStreams[streamUrl].socket) {
            const socket = this.connectedStreams[streamUrl].socket;

            let doesCallbackExist = false;
            this.connectedStreams[streamUrl].messageHandlers.forEach((handler) => {
                if (handler.callback === onMessageCallback) {
                    doesCallbackExist = true;
                }
            });

            if (doesCallbackExist) {
                return;
            }

            this.connectedStreams[streamUrl].messageHandlers.push(
                {
                    callback: onMessageCallback,
                    parseFunction: parseMessage
                }
            );

            socket.updateOnSocketMessage((message) => {
                this.connectedStreams[streamUrl].messageHandlers.forEach((handler) => {
                    const { callback, parseFunction } = handler;
                    // If parseMessage does not return an object, onMessage will not be called
                    const resourceObject = parseFunction(message);
                    if (resourceObject) {
                        callback(resourceObject);
                    }
                });
            });
        } else {
            const handleSocketClose = () => {
                delete this.connectedStreams[streamUrl];
            };

            const handleSocketMessage = (message) => {
                this.connectedStreams[streamUrl].messageHandlers.forEach((handler) => {
                    const { callback, parseFunction } = handler;
                    const resourceObject = parseFunction(message);
                    if (resourceObject) {
                        callback(resourceObject);
                    }
                });
            };

            // Store instance of the websocket in Client
            const newSocketInstance = new FetchSocket(streamUrl, {
                onSocketMessage: handleSocketMessage,
                onSocketClose: handleSocketClose
            });
            newSocketInstance.connect();
            this.connectedStreams[streamUrl] = {
                socket: newSocketInstance
            };

            this.connectedStreams[streamUrl].messageHandlers = [
                {
                    callback: onMessageCallback,
                    parseFunction: parseMessage
                }
            ];
        }
    }

    /**
     * Unsubscribes a callback from a specific WebSocket channel
     * @this Client
     * @param {String} endpoint The endpoint to WebSocket stream
     * @param {Function} onMessageCallback The callback that is going to be unsubscribed from the WebSocket stream
     */
    unsubscribe(endpoint, onMessageCallback) {
        const streamUrl = this.getStreamUrl(endpoint);

        if (
            this.connectedStreams[streamUrl] == null
            || this.connectedStreams[streamUrl].socket == null
        ) {
            return;
        }

        const socketInstance = this.connectedStreams[streamUrl].socket;
        if (this.connectedStreams[streamUrl].messageHandlers) {
            const handlers = this.connectedStreams[streamUrl].messageHandlers;
            let foundCallbackAtIndex;
            for (let i = 0; i < handlers.length; i += 1) {
                if (handlers[i].callback === onMessageCallback) {
                    foundCallbackAtIndex = i;
                }
            }
            if (foundCallbackAtIndex != null) {
                this.connectedStreams[streamUrl].messageHandlers.splice(foundCallbackAtIndex, 1);
            }

            const numberOfHandlers = this.connectedStreams[streamUrl].messageHandlers.length;
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
    getStreamUrl(endpoint) {
        if (this.enableSSL) {
            return `wss://${this.hostname}:${this.port}${endpoint}?token=${this.token}`;
        }
        return `ws://${this.hostname}:${this.port}${endpoint}?token=${this.token}`;
    }

    /**
     * Dispatches a GET request to an endpoint of a resource on the server
     * @this Client
     * @param {String} endpoint The endpoint of a resource on the server
     * @param {String} resourceId The ID of a resource
     * @param {JSON} params The query parameters for a GET request
     */
    get(endpoint, resourceId, params) {
        const resourceUrl = Client.parseURL(endpoint, resourceId);
        const requestOptions = {
            method: 'GET',
            uri: `https://${this.hostname}/${resourceUrl}`,
            proxy: this.proxy,
            port: this.port,
            qs: params,
            json: true,
            headers: {
                AUTHORIZATION: `Token ${this.token}`
            }
        };

        return rp(requestOptions).catch(Client.handleError);
    }

    /**
     * Dispatches a POST request to an endpoint of a resource on the server
     * @this Client
     * @param {String} endpoint The endpoint of a resource on the server
     * @param {JSON} data The data which are to be saved on the server
     */
    post(endpoint, data) {
        const resourceUrl = Client.parseURL(endpoint);
        const requestOptions = {
            method: 'POST',
            uri: `https://${this.hostname}/${resourceUrl}`,
            port: this.port,
            proxy: this.proxy,
            body: data,
            json: true,
            headers: {
                AUTHORIZATION: `Token ${this.token}`
            }
        };

        return rp(requestOptions).catch(Client.handleError);
    }

    /**
     * Dispatches a DELETE request to an endpoint of a resource on the server
     * @this Client
     * @param {String} endpoint The endpoint of a resource on the server
     * @param {String} resourceId The ID of a resource
     */
    delete(endpoint, resourceId) {
        const resourceUrl = Client.parseURL(endpoint, resourceId);
        return this.request
            .delete(resourceUrl)
            .catch(Client.handleError);
    }

    /**
     * Dispatches a PUT request to an endpoint of a resource on the server
     * @this Client
     * @param {String} endpoint The endpoint of a resource on the server
     * @param {String} resourceId The ID of a resource
     * @param {JSON} data The data which are to be saved on the server
     */
    put(endpoint, resourceId, data) {
        const resourceUrl = Client.parseURL(endpoint, resourceId);

        return this.request
            .put(resourceUrl, data)
            .catch(Client.handleError);
    }

    /**
     * Dispatches a PATCH request to an endpoint of a resource on the server
     * @this Client
     * @param {String} endpoint The endpoint of a resource on the server
     * @param {String|Number} resourceId The ID of a resource
     * @param {JSON} data The data which are to be saved on the server
     */
    patch(endpoint, resourceId, data) {
        const resourceUrl = Client.parseURL(endpoint, resourceId);

        return this.request
            .patch(resourceUrl, data)
            .catch(Client.handleError);
    }

}

module.exports = Client;
