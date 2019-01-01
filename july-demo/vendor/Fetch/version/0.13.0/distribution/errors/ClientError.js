'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClientError = function () {

    /**
    * Creates an instance of ClientError object
    * @constructor
    * @param {JSON} errorResponse The error response from API server
    */
    function ClientError(errorResponse) {
        _classCallCheck(this, ClientError);

        if (errorResponse) {
            this.errorData = errorResponse.data;
            this.statusCode = errorResponse.status;
            this.statusText = errorResponse.statusText;
        }
    }

    /**
     * @type {Number}
     */


    _createClass(ClientError, [{
        key: 'toJSON',


        /**
         * Parses error messages into JSON format
         * @return {JSON} clientErrorJSON
         */
        value: function toJSON() {
            return {
                httpStatus: this.statusCode,
                statusText: this.statusText,
                detail: this.detail,
                data: this.errorData
            };
        }

        /**
         * Converts ClientError object into string representation
         * @return {String} errorString
         */

    }, {
        key: 'toString',
        value: function toString() {
            var errorString = 'HTTP ' + this.statusCode + ': ' + this.statusText + '\n';
            errorString += 'Detail: ' + this.detail;

            this.errorList.forEach(function (error) {
                errorString += '| ' + error + ' ';
            });

            return errorString;
        }
    }, {
        key: 'httpStatus',
        get: function get() {
            return this.statusCode;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'detail',
        get: function get() {
            if (this.errorData && this.errorData.detail) {
                return this.errorData.detail;
            }
            return 'No additional details';
        }

        /**
         * @type {Array.<String>}
         */

    }, {
        key: 'errorList',
        get: function get() {
            var _this = this;

            if (this.errorData) {
                return Object.keys(this.errorData).map(function (key) {
                    return _this.errorData[key];
                });
            }
            return [];
        }
    }]);

    return ClientError;
}();

module.exports = ClientError;