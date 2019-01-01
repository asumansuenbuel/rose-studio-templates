'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc.
 * @author Calvin Feng
 * @author Nadir Muzaffar
 */

const FetchcoreClient  = require('./FetchcoreClient');
const Client           = require('./Client');

// Resources
const RobotState       = require('./resources/robots/RobotState');
const Robot            = require('./resources/robots/Robot');
const Pose             = require('./resources/annotations/Pose');
const Task             = require('./resources/tasks/Task');
const HMISettings      = require('./resources/settings/HMISettings');

// Actions
const Action           = require('./resources/tasks/Action');
const BuildMapAction   = require('./resources/tasks/actions/BuildMapAction');
const DockAction       = require('./resources/tasks/actions/DockAction');
const HMIButtonsAction = require('./resources/tasks/actions/HMIButtonsAction');
const LocalizeAction   = require('./resources/tasks/actions/LocalizeAction');
const NavigateAction   = require('./resources/tasks/actions/NavigateAction');
const UndockAction     = require('./resources/tasks/actions/UndockAction');
const WaitForAction    = require('./resources/tasks/actions/WaitForAction');
const URLAction        = require('./resources/tasks/actions/URLAction');

module.exports = {
    FetchcoreClient,
    Client,
    RobotState,
    Robot,
    Pose,
    Task,
    HMISettings,
    Action,
    BuildMapAction,
    DockAction,
    HMIButtonsAction,
    LocalizeAction,
    NavigateAction,
    UndockAction,
    WaitForAction,
    URLAction
};
