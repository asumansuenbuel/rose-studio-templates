'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Fetch imports
const FetchcoreClient = require('../../FetchcoreClient');

class Pose {
    /**
     * Returns the server endpoint for pose data
     * @return {String} POSE_ENDPOINT
     */
    static get ENDPOINT() {
        return 'api/v1/maps/annotations/poses/';
    }

    /**
     * Returns a list of Pose resource object
     * @param {JSON} responseData Data coming from server response
     * @return {Array} poseList
     */
    static createPoseList(responseData) {
        const poseList = [];
        responseData.results.forEach((data) => {
            poseList.push(new Pose(data));
        });
        return poseList;
    }

    /**
     * Returns a Pose resource object
     * @param {JSON} res Response of server
     * @return {Pose} pose
     */
    static handleResponse(res) {
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
    static handleError(clientError) {
        // We have the option to attach more attributes to this object before throwing it
        throw clientError;
    }

    /**
     * Gets pose from the server
     * @param {Number} poseId ID of an existing pose on the server
     * @return {Promise.<Pose>} When promise resolves, it will return a Pose resource object
     */
    static get(poseId) {
        const client = FetchcoreClient.defaultClient();
        if (poseId == null) {
            return;
        }
        return client
                .get(Pose.ENDPOINT, poseId)
                .then(Pose.handleResponse)
                .catch(Pose.handleError);
    }

    /**
     * Gets all poses from the server
     * @param {Number} pageNumber Page Number for the paginated list of poses
     * @return {Promise.<Array>} When promise resolves, it will return a list of Pose resource objects
     */
    static all(pageNumber) {
        const client = FetchcoreClient.defaultClient();
        const params = {
            page: pageNumber
        };
        return client
                .get(Pose.ENDPOINT, undefined, params)
                .then(Pose.handleResponse)
                .catch(Pose.handleError);
    }

    /**
     * creates an instace of Pose resource object
     *
     * @constructor
     * @param {JSON} props Properties of a new Pose
     */
    constructor(props) {
        this.persistedProps = props;
    }

    /**
     * @type {Number}
     */
    get map() {
        return this.persistedProps.map;
    }

    /**
     * @type {Array}
     */
    get modifiers() {
        return this.persistedProps.modifiers;
    }

    /**
     * @type {Number}
     */
    get group() {
        return this.persistedProps.group;
    }

    /**
     * @type {String}
     */
    get name() {
        return this.persistedProps.name;
    }

    /**
     * @type {String}
     */
    get modified() {
        return this.persistedProps.modified;
    }

    /**
     * @type {String}
     */
    get created() {
        return this.persistedProps.created;
    }

    /**
     * @type {Number}
     */
    get queue() {
        return this.persistedProps.queue;
    }

    /**
     * @type {Number}
     */
    get theta() {
        return this.persistedProps.theta;
    }

    /**
     * @type {Number}
     */
    get x() {
        return this.persistedProps.x;
    }

    /**
     * @type {Number}
     */
    get y() {
        return this.persistedProps.y;
    }

    /**
     * @type {Number}
     */
    get id() {
        return this.persistedProps.id;
    }
}

module.exports = Pose;
