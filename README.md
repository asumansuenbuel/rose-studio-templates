# Rose Studio templates

Name of the EWM system: $${ewmSystem.NAME}
Name of the connected robot system: $${robot.NAME}
This folder tree contains the code and instruction on how to connect an SAP EWM system with the $${robot.NAME} robot.
The robot's uuid is "$${robot.UUID}""


//! if (useDatabase) {
This scenario uses a Database.
//! }

There is $${demoSetup?"at least one":"no"} demo setup. There could also be more than one.
//! if (demoSetup && (typeof demoSetup.numberOfSteps === 'number')) {
//! let nos = demoSetup.numberOfSteps
//! let stepString = nos === 1 ? "step" : "steps"
//! let nosString = nos === 0 ? "no" : nos === 1 ? "one" : nos === 2 ? "two" : String(nos)
There will be $${nosString} $${stepString} in the demo.
//! for(let i = 0; i < nos; i++) {
    Step $${i}: Perform actions attached to step $${i}
//! }

//! }

