'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Fetch imports

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FetchcoreClient = require('../../FetchcoreClient');

var Pose = function () {
    _createClass(Pose, null, [{
        key: 'createPoseList',


        /**
         * Returns a list of Pose resource object
         * @param {JSON} responseData Data coming from server response
         * @return {Array} poseList
         */
        value: function createPoseList(responseData) {
            var poseList = [];
            responseData.results.forEach(function (data) {
                poseList.push(new Pose(data));
            });
            return poseList;
        }

        /**
         * Returns a Pose resource object
         * @param {JSON} res Response of server
         * @return {Pose} pose
         */

    }, {
        key: 'handleResponse',
        value: function handleResponse(res) {
            if (res.data.count) {
                return Pose.createPoseList(res.data);
            }
            return new Pose(res.data);
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
         * Gets pose from the server
         * @param {Number} poseId ID of an existing pose on the server
         * @return {Promise.<Pose>} When promise resolves, it will return a Pose resource object
         */

    }, {
        key: 'get',
        value: function get(poseId) {
            var client = FetchcoreClient.defaultClient();
            if (poseId == null) {
                return;
            }
            return client.get(Pose.ENDPOINT, poseId).then(Pose.handleResponse).catch(Pose.handleError);
        }

        /**
         * Gets all poses from the server
         * @param {Number} pageNumber Page Number for the paginated list of poses
         * @return {Promise.<Array>} When promise resolves, it will return a list of Pose resource objects
         */

    }, {
        key: 'all',
        value: function all(pageNumber) {
            var client = FetchcoreClient.defaultClient();
            var params = {
                page: pageNumber
            };
            return client.get(Pose.ENDPOINT, undefined, params).then(Pose.handleResponse).catch(Pose.handleError);
        }

        /**
         * creates an instace of Pose resource object
         *
         * @constructor
         * @param {JSON} props Properties of a new Pose
         */

    }, {
        key: 'ENDPOINT',

        /**
         * Returns the server endpoint for pose data
         * @return {String} POSE_ENDPOINT
         */
        get: function get() {
            return 'api/v1/maps/annotations/poses/';
        }
    }]);

    function Pose(props) {
        _classCallCheck(this, Pose);

        this.persistedProps = props;
    }

    /**
     * @type {Number}
     */


    _createClass(Pose, [{
        key: 'map',
        get: function get() {
            return this.persistedProps.map;
        }

        /**
         * @type {Array}
         */

    }, {
        key: 'modifiers',
        get: function get() {
            return this.persistedProps.modifiers;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'group',
        get: function get() {
            return this.persistedProps.group;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'name',
        get: function get() {
            return this.persistedProps.name;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'modified',
        get: function get() {
            return this.persistedProps.modified;
        }

        /**
         * @type {String}
         */

    }, {
        key: 'created',
        get: function get() {
            return this.persistedProps.created;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'queue',
        get: function get() {
            return this.persistedProps.queue;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'theta',
        get: function get() {
            return this.persistedProps.theta;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'x',
        get: function get() {
            return this.persistedProps.x;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'y',
        get: function get() {
            return this.persistedProps.y;
        }

        /**
         * @type {Number}
         */

    }, {
        key: 'id',
        get: function get() {
            return this.persistedProps.id;
        }
    }]);

    return Pose;
}();

module.exports = Pose;