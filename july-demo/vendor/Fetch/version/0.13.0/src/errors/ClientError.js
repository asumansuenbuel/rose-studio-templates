'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

class ClientError {

    /**
    * Creates an instance of ClientError object
    * @constructor
    * @param {JSON} errorResponse The error response from API server
    */
    constructor(errorResponse) {
        if (errorResponse) {
            this.name = errorResponse.name;
            this.errorData = errorResponse.error;
            this.statusCode = errorResponse.statusCode;
            this.statusText = errorResponse.message;
        }
    }

    /**
     * @type {Number}
     */
    get httpStatus() {
        return this.statusCode;
    }

    /**
     * @type {String}
     */
    get detail() {
        if (this.errorData && this.errorData.detail) {
            return this.errorData.detail;
        }
        return 'No additional details';
    }

    /**
     * @type {Array.<String>}
     */
    get errorList() {
        if (this.errorData) {
            return Object.keys(this.errorData).map((key) => this.errorData[key]);
        }
        return [];
    }

    /**
     * Parses error messages into JSON format
     * @return {JSON} clientErrorJSON
     */
    toJSON() {
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
    toString() {
        let errorString =  `HTTP ${this.statusCode}: ${this.statusText}\n`;
        errorString += `Detail: ${this.detail}`;

        this.errorList.forEach((error) => {
            errorString += `| ${error} `;
        });

        return errorString;
    }
}

module.exports = ClientError;
