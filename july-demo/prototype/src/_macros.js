const getRobotName = robot => {
    switch(robot.shortName) {
        case 'Mir': return mirRobotName
        case 'Fetch': return fetchRobotName
    }
}
