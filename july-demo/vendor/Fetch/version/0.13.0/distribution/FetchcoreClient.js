'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Fetch imports

var Client = require('./Client');

// ES6 Singleton Pattern
var _defaultClient = void 0;

/**
 * @class FetchClient
 * @classdesc A singleton class that wraps around Client to provide a default client instance
 */
var FetchcoreClient = {
    defaultClient: function defaultClient() {
        if (_defaultClient == null) {
            _defaultClient = new Client();
        }
        return _defaultClient;
    }
};

module.exports = FetchcoreClient;