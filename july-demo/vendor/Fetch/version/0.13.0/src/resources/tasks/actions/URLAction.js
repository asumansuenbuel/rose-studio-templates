'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc.
 * @author Nadir Muzaffar
 */

const assignDefined = require('../../../utilities/assignDefined.js');
const ActionDefinition = require('../../../utilities/enums.js').ActionDefinition;

const Action = require('../Action.js');

class URLAction extends Action {
    /**
     * Creates an instance of WaitFor Action resource object
     * @constructor
     * @param {JSON} [newProps] New properties of a new WaitFor Action, refer to Action superclass for shared properties
     * @param {JSON} [newProps.inputs] Inputs needed for wait-for
     * @param {String} [newProps.inputs.url] The URL that the application should load
     */
    constructor(newProps) {
        super(newProps);
        this.updatedProps.actionDefinition = ActionDefinition.URL;
    }

    parse(JSONData) {
        super.parse(JSONData);
        if (JSONData.inputs) {
            this.props.inputs = {
                url: JSONData.inputs.url
            };
        } else {
            this.props.inputs = {};
        }

        if (JSONData.outputs) {
            this.props.outputs = {
                responseCode: JSONData.outputs.response_code
            };
        } else {
            this.props.outputs = {};
        }
    }

    toJSON() {
        let propsInputs;

        // Check if props has inputs, if object was initialized by user, it should have an empty props
        if (this.props && this.props.inputs) {
            propsInputs = assignDefined(this.props.inputs, this.updatedProps.inputs);
        } else {
            propsInputs = assignDefined(Object.create(null), this.updatedProps.inputs);
        }

        const inputs = {
            url: propsInputs.url,
        };

        return assignDefined(Object.create(null), super.toJSON(), { inputs });
    }
}

module.exports = URLAction;
