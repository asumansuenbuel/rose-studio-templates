'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc.
 * @author Calvin Feng
 * @author Nadir Muzaffar
 */

var FetchcoreClient = require('./FetchcoreClient');
var Client = require('./Client');

// Resources
var RobotState = require('./resources/robots/RobotState');
var Robot = require('./resources/robots/Robot');
var Pose = require('./resources/annotations/Pose');
var Task = require('./resources/tasks/Task');
var HMISettings = require('./resources/settings/HMISettings');

// Actions
var Action = require('./resources/tasks/Action');
var BuildMapAction = require('./resources/tasks/actions/BuildMapAction');
var DockAction = require('./resources/tasks/actions/DockAction');
var HMIButtonsAction = require('./resources/tasks/actions/HMIButtonsAction');
var LocalizeAction = require('./resources/tasks/actions/LocalizeAction');
var NavigateAction = require('./resources/tasks/actions/NavigateAction');
var UndockAction = require('./resources/tasks/actions/UndockAction');
var WaitForAction = require('./resources/tasks/actions/WaitForAction');
var URLAction = require('./resources/tasks/actions/URLAction');

module.exports = {
    FetchcoreClient: FetchcoreClient,
    Client: Client,
    RobotState: RobotState,
    Robot: Robot,
    Pose: Pose,
    Task: Task,
    HMISettings: HMISettings,
    Action: Action,
    BuildMapAction: BuildMapAction,
    DockAction: DockAction,
    HMIButtonsAction: HMIButtonsAction,
    LocalizeAction: LocalizeAction,
    NavigateAction: NavigateAction,
    UndockAction: UndockAction,
    WaitForAction: WaitForAction,
    URLAction: URLAction
};