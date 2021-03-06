'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

function assignDefined(target, ...sources) {
    for (const source of sources) {
        for (const key of Object.keys(source)) {
            const val = source[key];
            if (val !== undefined) {
                target[key] = val;
            }
        }
    }
    return target;
}

module.exports = assignDefined;
