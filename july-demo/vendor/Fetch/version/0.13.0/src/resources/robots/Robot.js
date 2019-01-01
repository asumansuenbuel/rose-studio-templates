'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

// Fetch imports
const FetchcoreClient = require('../../FetchcoreClient');
const ClientError     = require('../../errors/ClientError');
const assignDefined = require('../../utilities/assignDefined');

class Robot {
    /**
     * Returns the server endpoint for robot data
     * @return {String} ROBOT_ENDPOINT
     */
    static get ENDPOINT() {
        return 'api/v1/robots/';
    }

    /**
     * Returns a list of Robot resource object
     * @param {JSON} responseData Data coming from server response
     * @return {Array} robotList
     */
    static createRobotList(responseData) {
        const robotList = [];
        responseData.results.forEach((data) => {
            robotList.push(new Robot(data));
        });
        return robotList;
    }

    /**
     * Returns a Robot resource object
     * @param {JSON} res Response of server
     * @return {Robot|Array} robot
     */
    static handleResponse(res) {
        if (res.count) {
            return Robot.createRobotList(res);
        }
        return new Robot(res);
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
     * Gets robot from the server
     * @param {String} robotName Name of a robot, usually goes by freight1, freight2, and etc...
     * @return {Promise.<Robot>} serverResponse When promise resolves, it will return a Robot resource object
     */
    static get(robotName) {
        const client = FetchcoreClient.defaultClient();
        if (robotName == null) {
            return;
        }
        return client
                .get(Robot.ENDPOINT, robotName)
                .then(Robot.handleResponse)
                .catch(Robot.handleError);
    }

    /**
     * Gets all robots from the server
     * @param {Number} pageNumber Page number for the paginated list of robots
     * @return {Promise.<Array>} When promise resolves, it will return a list of Robot resource objects
     */
    static all(pageNumber) {
        const client = FetchcoreClient.defaultClient();
        const params = {
            page: pageNumber
        };
        return client
                .get(Robot.ENDPOINT, undefined, params)
                .then(Robot.handleResponse)
                .catch(Robot.handleError);
    }

    /**
     * Creates an instace of Robot resource object
     * @constructor
     * @param {JSON} props Properties of a new Robot
     */
    constructor(props) {
        const defaultProps = {
            footprint: 'FREIGHT100',
            configurations: ['MOBILE']
        };

        this.props = assignDefined(Object.create(null), defaultProps, props);
        this.updatedProps = Object.create(null);
    }

    parse(resourceJSON = {}) {
        this.props =  {
            status: resourceJSON.status,
            modified: resourceJSON.modified,
            name: resourceJSON.name,
            map: resourceJSON.map,
            created: resourceJSON.created,
            lastCharge: resourceJSON.last_charge,
            ip: resourceJSON.ip,
            lastConnectiontime: resourceJSON.last_connectiontime,
            apSsid: resourceJSON.ap_ssid,
            lastStatusChange: resourceJSON.last_status_change,
            lastBoot: resourceJSON.last_boot,
            footprint: resourceJSON.footprint,
            chargingState: resourceJSON.charging_state,
            id: resourceJSON.id,
            installedActions: resourceJSON.installed_actions,
            apMacAddress: resourceJSON.ap_mac_address,
            localized: resourceJSON.localized,
            configurations: resourceJSON.configurations
        };

        this.updatedProps = Object.create(null);
    }

    toJSON(isPatch = false) {
        let JSON;
        if (isPatch) {
            JSON = {
                name: this.updatedProps.name,
                map: this.updatedProps.map,
                footprint: this.updatedProps.footprint,
                installed_actions: this.updatedProps.installedActions,
                configurations: this.updatedProps.configurations,
            };
        } else {
            const props = assignDefined(this.props, this.updatedProps);
            JSON = {
                name: props.name,
                map: props.map,
                footprint: props.footprint,
                installed_actions: props.installedActions,
                configurations: props.configurations,
            };
        }

        return assignDefined(Object.create(null), JSON);
    }

    /**
     * Saves robot to the server
     * @param {String} password Password which is needed for saving robot to server
     * @this Robot
     * @return {Promise.<Robot>} When promise resolves, it will return a Robot resource object
     */
    save(password) {
        const client = FetchcoreClient.defaultClient();
        const data = assignDefined(Object.create(null), { password }, this.toJSON());

        if (this.isNew()) {
            return client.post(Robot.ENDPOINT, data)
                    .then(Robot.handleResponse)
                    .catch(Robot.handleError);
        }

        return client.put(Robot.ENDPOINT, this.name, data)
                .then(Robot.handleResponse)
                .catch(Robot.handleError);
    }

    /**
     * Updates attributes of robot on the server
     * @this Robot
     * @return {Promise.<Robot>} When promise resolves, it will return an updated Robot resource object
     */
    update() {
        const client = FetchcoreClient.defaultClient();
        const data = this.toJSON(true);
        return client.patch(Robot.ENDPOINT, this.name, data)
                .then(Robot.handleResponse)
                .catch(Robot.handleError);
    }

    /**
     * Deletes robot from the server
     * @this Robot
     * @return {Promise.<Robot>} When promise resolves, it will return a Robot resource object
     */
    delete() {
        const client = FetchcoreClient.defaultClient();
        if (this.isNew()) {
            throw new ClientError({
                data: {
                    detail: 'This robot does not exist on server'
                }
            });
        }
        return client
            .delete(Robot.ENDPOINT, this.name)
            .then(() => {
                this.isDeleted = true;
                return this;
            })
            .catch(Robot.handleError);
    }

    /**
     * Checks if a Robot instance is new
     * @this Robot
     * @return {Boolean} isNew
     */
    isNew() {
        return this.id == null;
    }

    /**
     * Checks if a Robot instance is deleted
     * @this Robot
     * @return {Boolean} isDeleted
     */
    isDeleted() {
        if (this.isDeleted == null) {
            return false;
        }
        return this.isDeleted;
    }

    /**
     * @type {String}
     */
    get name() {
        if (this.updatedProps.name) {
            return this.updatedProps.name;
        }
        return this.props.name;
    }

    set name(value) {
        this.updatedProps.name = value;
    }

    /**
     * @type {String}
     */
    get status() {
        return this.props.status;
    }

    /**
     * @type {Number}
     */
    get map() {
        if (this.updatedProps.map) {
            return this.updatedProps.map;
        }
        return this.props.map;
    }

    set map(value) {
        this.updatedProps.map = value;
    }

    /**
     * @type {String}
     */
    get created() {
        return this.props.created;
    }

    /**
     * @type {String}
     */
    get lastCharge() {
        return this.props.last_charge;
    }

    /**
     * @type {String}
     */
    get ip() {
        return this.props.ip;
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
    get lastConnectiontime() {
        return this.props.last_connection_time;
    }

    /**
     * @type {String}
     */
    get apSsid() {
        return this.props.ap_ssid;
    }

    /**
     * @type {String}
     */
    get lastStatusChange() {
        return this.props.last_status_change;
    }

    /**
     * @type {String}
     */
    get lastBoot() {
        return this.props.last_boot;
    }

    /**
     * @type {String}
     */
    get footprint() {
        if (this.updatedProps.footprint) {
            return this.updatedProps.footprint;
        }
        return this.props.footprint;
    }

    set footprint(value) {
        this.updatedProps.footprint = value;
    }

    /**
     * @type {Boolean}
     */
    get chargingState() {
        return this.props.charging_state;
    }

    /**
     * @type {Array}
     */
    get installedActions() {
        if (this.updatedProps.installed_actions) {
            return this.updatedProps.installed_actions;
        }
        return this.props.installed_actions;
    }

    set installedActions(value) {
        this.updatedProps.installed_actions = value;
    }

    /**
     * @type {String}
     */
    get apMacAddress() {
        return this.props.ap_mac_address;
    }

    /**
     * @type {Number}
     */
    get id() {
        return this.props.id;
    }

    /**
     * @type {Boolean}
     */
    get localized() {
        return this.props.localized;
    }

    /**
     * @type {Array}
     */
    get configurations() {
        if (this.updatedProps.configurations) {
            return this.updatedProps.configurations;
        }
        return this.props.configurations;
    }

    set configurations(value) {
        this.updatedProps.configurations = value;
    }

}

module.exports = Robot;
