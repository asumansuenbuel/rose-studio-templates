'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const ActionDefinition = {
    ATTACH_CART: 'ATTACH_CART',
    DETACH_CART: 'DETACH_CART',
    BUILDMAP: 'BUILDMAP',
    LOCALIZE: 'LOCALIZE',
    DOCK: 'DOCK',
    UNDOCK: 'UNDOCK',
    HMI_BUTTONS: 'HMI_BUTTONS',
    NAVIGATE: 'NAVIGATE',
    SUBTASK: 'SUBTASK',
    UPDATE: 'UPDATE',
    URL: 'URL',
    WAITFOR: 'WAITFOR'
};

const TaskStatus = {
    WORKING: 'WORKING',
    IDLE: 'IDLE',
    NEW: 'NEW',
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED',
    CANCELED: 'CANELED'
};

module.exports = {
    TaskStatus,
    ActionDefinition
};
