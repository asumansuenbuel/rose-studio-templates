'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Fetch imports
const FetchcoreClient = require('../../FetchcoreClient');

const ROBOT_STREAM_ENDPOINT = (robotName) => {
    if (robotName) {
        return `/api/v1/streams/robots/${robotName}/`;
    }
    return '/api/v1/streams/robots/';
};

const ROBOT_ON_MAP_STREAM_ENDPOINT = (mapId) => {
    return `/api/v1/streams/maps/${mapId}/robots/`;
};

class RobotState {

    /**
     * Returns the server endpoint for robot state data
     * @return {String} ROBOT_STATE_ENDPOINT
     */
    static get ENDPOINT() {
        return 'api/v1/robots/states/';
    }

    /**
     * Returns a list of RobotState resource object
     * @param {JSON} responseData Data coming from server response
     * @return {Array} robotStateList
     */
    static createRobotStateList(responseData) {
        const robotStateList = [];
        responseData.results.forEach((data) => {
            robotStateList.push(new RobotState(data));
        });
        return robotStateList;
    }

    /**
     * Subscribes to a robot with a callback and receives all the updates through data stream
     * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static subscribeTo(robotName, handleStreamMessage) {
        const client = FetchcoreClient.defaultClient();
        const endpoint = ROBOT_STREAM_ENDPOINT(robotName);
        client.subscribe(endpoint, handleStreamMessage, (message) => {
            const messageData = JSON.parse(message.data);
            if (messageData.payload.model === 'api.robotstate') {
                return new RobotState(messageData.payload.data);
            }
        });
    }

    /**
     * Unsubscribes to a robot through the callback that was previously submitted for subscription
     * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static unsubscribeTo(robotName, handleStreamMessage) {
        FetchcoreClient.defaultClient().unsubscribe(
            ROBOT_STREAM_ENDPOINT(robotName),
            handleStreamMessage
        );
    }

    /**
     * Subscribes to all robots with a callback and receives all the robot state updates through data stream
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static subscribeToAll(handleStreamMessage) {
        const client = FetchcoreClient.defaultClient();
        const endpoint = ROBOT_STREAM_ENDPOINT();
        client.subscribe(endpoint, handleStreamMessage, (message) => {
            const messageData = JSON.parse(message.data);
            if (messageData.payload.model === 'api.robotstate') {
                return new RobotState(messageData.payload.data);
            }
        });
    }

    /**
     * Unsubscribes to all robots through the callback that was previously submitted for subscription
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static unsubscribeToAll(handleStreamMessage) {
        FetchcoreClient.defaultClient().unsubscribe(
            ROBOT_STREAM_ENDPOINT(),
            handleStreamMessage
        );
    }

    /**
     * Subscribes to all robots on a given map with a callback and receives all the robot state updates through data stream
     * @param {Number} mapId
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static subscribeToAllOnMap(mapId, handleStreamMessage) {
        const client = FetchcoreClient.defaultClient();
        const endpoint = ROBOT_ON_MAP_STREAM_ENDPOINT(mapId);
        client.subscribe(endpoint, handleStreamMessage, (message) => {
            const messageData = JSON.parse(message.data);
            if (messageData.payload.model === 'api.robotstate') {
                return new RobotState(messageData.payload.data);
            }
        });
    }

    /**
     * Unsubscribes to all robots on a given map through the callback that was previously submitted for subscription
     * @param {Number} mapId
     * @param {Function} handleStreamMessage Callback for handling stream messages
     */
    static unsubscribeToAllOnMap(mapId, handleStreamMessage) {
        FetchcoreClient.defaultClient().unsubscribe(
            ROBOT_ON_MAP_STREAM_ENDPOINT(mapId),
            handleStreamMessage
        );
    }

    /**
     * Gets robot state from the server
     * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
     * @return {Promise.<Robot>} When promise resolves, it will return a RobotState resource object
     */
    static get(robotName) {
        const client = FetchcoreClient.defaultClient();
        if (robotName == null) {
            return;
        }
        return client
        .get(RobotState.ENDPOINT, robotName)
        .then(RobotState.handleResponse)
        .catch(RobotState.handleError);
    }

    /**
     * Gets all robot states from the server
     * @param {Number} pageNumber Page number for the paginated list of RobotStates
     * @return {Promise.<Array>} When promise resolves, it will return a list of RobotState resource objects
     */
    static all(pageNumber) {
        const client = FetchcoreClient.defaultClient();
        const params = {
            page: pageNumber
        };
        return client
        .get(RobotState.ENDPOINT, undefined, params)
        .then(RobotState.handleResponse)
        .catch(RobotState.handleError);
    }

    /**
     * Returns a RobotState resource object
     * @param {JSON} res HTTP response from server
     * @return {Robot} robot
     */
    static handleResponse(res) {
        if (res.data.count) {
            return RobotState.createRobotStateList(res.data);
        }
        return new RobotState(res.data);
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
     * Creates an instance of RobotState resource object
     * @constructor
     * @param {JSON} props Properties of a new RobotState
     */
    constructor(props) {
        // Consumers may not assign new value to props; they cannot save or update RobotStates
        this.props = props;
    }

    /**
     * @type {Number}
     */
    get batteryLevel() {
        return this.props.battery_level;
    }

    /**
     * @type {Number}
     */
    get localizationWeight() {
        return this.props.localization_weight;
    }

    /**
     * @type {String}
     */
    get created() {
        return this.props.created;
    }

    /**
     * @type {Number}
     */
    get robotBatteryVoltage() {
        return this.props.robot_battery_voltage;
    }

    /**
     * @type {String}
     */
    get modified() {
        return this.props.modified;
    }

    /**
     * @type {String}
     */
    get robot() {
        return this.props.robot;
    }

    /**
     * @type {JSON}
     */
    get currentPose() {
        return this.props.current_pose;
    }

    /**
     * @type {Number}
     */
    get wifiStrength() {
        return this.props.wifi_strength;
    }

    /**
     * @type {String}
     */
    get lastDeepCharge() {
        return this.props.last_deep_charge;
    }

    /**
     * @type {Number}
     */
    get id() {
        return this.props.id;
    }
}

module.exports = RobotState;
