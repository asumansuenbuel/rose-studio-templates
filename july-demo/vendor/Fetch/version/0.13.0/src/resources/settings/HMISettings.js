'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc.
 * @author Nadir Muzaffar
 */

// Fetch imports
const FetchcoreClient = require('../../FetchcoreClient');
const assignDefined = require('../../utilities/assignDefined');

// TODO: create a parent Resource object
class HMISettings {
    /**
     * Returns the server endpoint for HMISettings data
     * @return {String}
     */
    static get ENDPOINT() {
        return 'api/v1/system/settings/hmi/';
    }

    /**
     * Returns a HMISettings resource object
     * @param {JSON} res Response of server
     * @return {HMISettings}
     */
    static handleResponse(res) {
        const hmiSettings = new HMISettings();
        hmiSettings.parse(res.data);
        return hmiSettings;
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
     * Gets HMISettings from the server
     * @return {Promise.<HMISettings>} When promise resolves, it will return a HMISettings resource object
     */
    static get() {
        const client = FetchcoreClient.defaultClient();

        return client
            .get(HMISettings.ENDPOINT)
            .then(HMISettings.handleResponse)
            .catch(HMISettings.handleError);
    }

    static get defaultProps() {
        return {
            defaultURL: 'http://www.fetchrobotics.com'
        };
    }

    /**
     * Creates an instance of HMISettings resource object
     *
     * @constructor
     * @param {JSON} [newProps] Properties of a new HMISettings
     * @param {String} [newProps.defaultURL] The default url that HMI screen should load.
     */
    constructor(newProps = Object.create(null)) {
        this.props = Object.create(null);
        this.updatedProps = assignDefined(Object.create(null), HMISettings.defaultProps, newProps);
    }

    toJSON(isPatch = false) {
        let JSON;

        if (isPatch) {
            JSON = {
                default_url: this.updatedProps.defaultURL
            };
        } else {
            const props = assignDefined(this.props, this.updatedProps);
            JSON = {
                default_url: props.defaultURL
            };
        }

        Object.keys(JSON).forEach((key) => {
            if (JSON[key] === undefined) {
                delete JSON[key];
            }
        });

        return JSON;
    }

    parse(resourceJSON = {}) {
        this.props =  {
            modified: resourceJSON.modified,
            created: resourceJSON.created,
            id: resourceJSON.id,
            defaultURL: resourceJSON.default_url
        };

        this.updatedProps = Object.create(null);
    }

    /**
     * Saves HMISettings to server to the server
     * @this HMISettings
     * @return {Promise.<HMISettings>} When promise resolves, it will return a HMISettings resource object
     */
    save() {
        const client = FetchcoreClient.defaultClient();
        const data = this.toJSON();

        return client
            .put(HMISettings.ENDPOINT, null, data)
            .then(HMISettings.handleResponse)
            .catch(HMISettings.handleError);
    }

    /**
     * Updates attributes of HMISettings on server
     * @this HMISettings
     * @return {Promise.<HMISettings>} When promise resolves, it will return an updated HMISettings resource object
     */
    update() {
        const client = FetchcoreClient.defaultClient();
        const data = this.toJSON(true);

        return client.patch(HMISettings.ENDPOINT, null, data)
            .then(HMISettings.handleResponse)
            .catch(HMISettings.handleError);
    }

    /**
     * @type {String}
     */
    get defaultURL() {
        if (this.updatedProps.defaultURL) {
            return this.updatedProps.defaultURL;
        }

        return this.props.defaultURL;
    }

    set defaultURL(url) {
        this.updatedProps.defaultURL = url;
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
    get created() {
        return this.props.created;
    }

    /**
     * @type {String}
     */
    get id() {
        return this.props.id;
    }
}

module.exports = HMISettings;
