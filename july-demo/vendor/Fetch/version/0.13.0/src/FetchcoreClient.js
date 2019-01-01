'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Fetch imports
const Client = require('./Client');

// ES6 Singleton Pattern
let defaultClient;

/**
 * @class FetchClient
 * @classdesc A singleton class that wraps around Client to provide a default client instance
 */
const FetchcoreClient = {
    defaultClient: () => {
        if (defaultClient == null) {
            defaultClient = new Client();
        }
        return defaultClient;
    }
};

module.exports = FetchcoreClient;
