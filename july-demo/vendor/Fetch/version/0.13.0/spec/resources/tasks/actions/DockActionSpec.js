'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

/* global jasmine */
const TestServer       = require('../../../../util/TestServer.js');
const FetchcoreClient  = require('../../../../src/FetchcoreClient.js');
const Task             = require('../../../../src/resources/tasks/Task.js');
const Robot            = require('../../../../src/resources/robots/Robot.js');
const DockAction   = require('../../../../src/resources/tasks/actions/DockAction.js');

// NOTE: Dock requires Robot configuration MOBILE
describe('Action', () => {
    beforeAll((done) => {
        const client = FetchcoreClient.defaultClient();
        client.configure(TestServer.HOST(), TestServer.PORT());
        client.authenticate('fetch', 'robotics')
            .then(() => {
                const freight302 = new Robot({
                    name: 'freight302',
                    configurations: ['MOBILE']
                });
                freight302.save('robotics')
                    .then(() => {
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
    });

    describe('Dock', () => {
        describe('Submitting task with actions to server', () => {
            const newDockAction = new DockAction({
                status: 'NEW',
                inputs: {
                    dockPoseQy: 1,
                    dockPoseQx: 1,
                    dockPoseQz: 1,
                    dockPoseY: 5,
                    dockPoseX: 5,
                    dockPoseQw: 1
                },
                preemptable: 'NONE'
            });

            const dockingTask = new Task({
                name: 'Dock the robot',
                robot: 'freight302',
                actions: [newDockAction],
                type: 'TEST'
            });

            describe('DockAction.toJSON() should parse action object to JSON correctly', () => {
                const dockActionJSON = newDockAction.toJSON();

                it('DockAction JSON has dock pose Qy inside inputs', () => {
                    expect(dockActionJSON.inputs.dock_pose_qy).toBe(1);
                });

                it('DockAction JSON has dock pose Qx inside inputs', () => {
                    expect(dockActionJSON.inputs.dock_pose_qx).toBe(1);
                });
                it('DockAction JSON has dock pose Qz inside inputs', () => {
                    expect(dockActionJSON.inputs.dock_pose_qz).toBe(1);
                });
                it('DockAction JSON has dock pose y inside inputs', () => {
                    expect(dockActionJSON.inputs.dock_pose_y).toBe(5);
                });

                it('DockAction JSON has dock pose x inside inputs', () => {
                    expect(dockActionJSON.inputs.dock_pose_x).toBe(5);
                });

                it('DockAction JSON has dock pose Qw inside inputs', () => {
                    expect(dockActionJSON.inputs.dock_pose_qw).toBe(1);
                });

                it('DockAction JSON has status', () => {
                    expect(dockActionJSON.status).toBe('NEW');
                });

                it('DockAction JSON has action definition', () => {
                    expect(dockActionJSON.action_definition).toBe('DOCK');
                });

                it('DockAction has preemptable', () => {
                    expect(dockActionJSON.preemptable).toBe('NONE');
                });
            });

            describe('Task.toJSON() should call actions toJSON', () => {
                const dockingTaskJSON = dockingTask.toJSON();

                it('Task JSON has task name', () => {
                    expect(dockingTaskJSON.name).toBe('Dock the robot');
                });

                it('Task JSON has task type', () => {
                    expect(dockingTaskJSON.type).toBe('TEST');
                });

                it('Task JSON has robot', () => {
                    expect(dockingTaskJSON.robot).toBe('freight302');
                });

                it('Task JSON has a list of actions', () => {
                    expect(dockingTaskJSON.actions.constructor.name).toBe('Array');
                    expect(dockingTaskJSON.actions[0].action_definition).toBe('DOCK');
                });
            });

            let savedTask;
            let savedDockAction;
            describe('save()', () => {
                beforeAll((done) => {
                    dockingTask.save()
                        .then((task) => {
                            savedTask = task;
                            savedDockAction = task.actions[0];
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                describe('When task is saved, server response should be parsed', () => {
                    it('Parsed task has information we submitted', () => {
                        expect(savedTask.name).toBe('Dock the robot');
                        expect(savedTask.status).toBe('NEW');
                        expect(savedTask.robot).toBe('freight302');
                        expect(savedTask.type).toBe('TEST');
                    });

                    it('Parsed task has id', () => {
                        expect(savedTask.id).toEqual(jasmine.any(Number));
                    });

                    it('Parsed task has created', () => {
                        expect(savedTask.created).toEqual(jasmine.any(String));
                    });

                    it('Parsed task has modified', () => {
                        expect(savedTask.modified).toEqual(jasmine.any(String));
                    });
                });

                describe('Actions nested inside Task should also be parsed', () => {
                    it('Parsed DockAction has status', () => {
                        expect(savedDockAction.status).toBe('NEW');
                    });

                    it('Parsed DockAction has preemptable', () => {
                        expect(savedDockAction.preemptable).toBe('NONE');
                    });

                    it('Parsed DockAction has id', () => {
                        expect(savedDockAction.id).toEqual(jasmine.any(Number));
                    });

                    it('Parsed DockAction has actionDefinition', () => {
                        expect(savedDockAction.actionDefinition).toBe('DOCK');
                    });

                    it('Parsed DockAction has created', () => {
                        expect(savedDockAction.created).toEqual(jasmine.any(String));
                    });

                    it('Parsed DockAction has modified', () => {
                        expect(savedDockAction.modified).toEqual(jasmine.any(String));
                    });

                    it('Parsed DockAction has inputs', () => {
                        expect(savedDockAction.inputs.dockPoseQy).toBe(1);
                        expect(savedDockAction.inputs.dockPoseQx).toBe(1);
                        expect(savedDockAction.inputs.dockPoseQz).toBe(1);
                        expect(savedDockAction.inputs.dockPoseY).toBe(5);
                        expect(savedDockAction.inputs.dockPoseX).toBe(5);
                        expect(savedDockAction.inputs.dockPoseQw).toBe(1);
                        expect(savedDockAction.inputs.dockId).toBe(null);
                    });

                    it('Parsed DockAction has task ID', () => {
                        expect(savedDockAction.task).toBe(savedTask.id);
                    });

                    it('Parsed DockAction has outputs', () => {
                        expect(Object.keys(savedDockAction.outputs).includes('dockId')).toBeTruthy();
                        expect(Object.keys(savedDockAction.outputs).includes('docked')).toBeTruthy();
                    });
                });
            });

            let latestDockAction;
            describe('update()', () => {
                it('should have a status of NEW prior to invoking update()', () => {
                    expect(savedDockAction.status).toBe('NEW');
                });

                it('should update the action status to WORKING from NEW', (done) => {
                    savedDockAction.status = 'WORKING';
                    savedDockAction.update()
                        .then((updatedDockAction) => {
                            latestDockAction = updatedDockAction;
                            expect(updatedDockAction.status).toBe('WORKING');
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });
            });

            let actionFromStream;
            describe('subscribeTo', () => {
                describe('When action stream is subscribed to freight302', () => {
                    beforeAll((done) => {
                        const handleMessage = (dockAction) => {
                            actionFromStream = dockAction;
                            DockAction.unsubscribeTo('freight302', handleMessage);
                            done();
                        };

                        DockAction.subscribeTo('freight302', handleMessage);
                        latestDockAction.status = 'COMPLETE';
                        latestDockAction.update()
                            .catch((clientError) => {
                                done.fail(clientError.toString());
                            });
                    });

                    it('should receive updates regarding DockActions that were assigned to freight302', () => {
                        expect(actionFromStream).not.toBeUndefined();
                        expect(actionFromStream.actionDefinition).toBe('DOCK');
                    });

                    it('should have the latest status of the action', () => {
                        expect(actionFromStream.status).toBe('COMPLETE');
                    });
                });
            });
        });
    });
});
