'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

/* global jasmine */
const TestServer       = require('../../../../util/TestServer.js');
const FetchcoreClient  = require('../../../../src/FetchcoreClient.js');
const Task             = require('../../../../src/resources/tasks/Task.js');
const Robot            = require('../../../../src/resources/robots/Robot.js');
const NavigateAction   = require('../../../../src/resources/tasks/actions/NavigateAction.js');

// NOTE: Navigate requires Robot configuration MOBILE
describe('Action', () => {
    beforeAll((done) => {
        const client = FetchcoreClient.defaultClient();
        client.configure(TestServer.HOST(), TestServer.PORT());
        client.authenticate('fetch', 'robotics')
            .then(() => {
                const freight305 = new Robot({
                    name: 'freight305',
                    configurations: ['MOBILE']
                });
                freight305.save('robotics')
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

    describe('Navigate', () => {
        describe('Submitting task with actions to server', () => {
            const newNavigateAction = new NavigateAction({
                status: 'NEW',
                inputs: {
                    goalPose: {
                        x: 1,
                        y: 1,
                        theta: 0
                    },
                    monitored: false,
                    resultBased: false,
                    clearCostmaps: false,
                    limitVelocity: true,
                    maxVelocity: 1,
                    maxAngularVelocity: 1
                },
                preemptable: 'NONE'
            });

            const newNavigateTask = new Task({
                name: 'Navigate to infinity and beyond',
                robot: 'freight305',
                actions: [newNavigateAction],
                type: 'TEST'
            });

            describe('new NavigateAction.toJSON() should parse action object to JSON correctly', () => {
                const newNavigateActionJSON = newNavigateAction.toJSON();

                it('new NavigateAction JSON has goal pose in inputs', () => {
                    expect(newNavigateActionJSON.inputs.goal_pose.x).toBe(1);
                    expect(newNavigateActionJSON.inputs.goal_pose.y).toBe(1);
                    expect(newNavigateActionJSON.inputs.goal_pose.theta).toBe(0);
                });

                it('new NavigateAction JSON has monitored, result based, and clear costmaps boolean values', () => {
                    expect(newNavigateActionJSON.inputs.monitored).toBeFalsy();
                    expect(newNavigateActionJSON.inputs.result_based).toBeFalsy();
                    expect(newNavigateActionJSON.inputs.clear_costmaps).toBeFalsy();
                });

                it('new NavigateAction JSON has limited velocity in inputs', () => {
                    expect(newNavigateActionJSON.inputs.limit_velocity).toBeTruthy();
                    expect(newNavigateActionJSON.inputs.max_velocity).toBe(1);
                    expect(newNavigateActionJSON.inputs.max_angular_velocity).toBe(1);
                });

                it('new NavigateAction JSON has status', () => {
                    expect(newNavigateActionJSON.status).toBe('NEW');
                });

                it('new NavigateAction JSON has action definition', () => {
                    expect(newNavigateActionJSON.action_definition).toBe('NAVIGATE');
                });

                it('new NavigateAction has preemptable', () => {
                    expect(newNavigateActionJSON.preemptable).toBe('NONE');
                });
            });

            describe('Task.toJSON() should call actions toJSON', () => {
                const newNavigateTaskJSON = newNavigateTask.toJSON();

                it('Task JSON has task name', () => {
                    expect(newNavigateTaskJSON.name).toBe('Navigate to infinity and beyond');
                });

                it('Task JSON has task type', () => {
                    expect(newNavigateTaskJSON.type).toBe('TEST');
                });

                it('Task JSON has robot', () => {
                    expect(newNavigateTaskJSON.robot).toBe('freight305');
                });

                it('Task JSON has a list of actions', () => {
                    expect(newNavigateTaskJSON.actions.constructor.name).toBe('Array');
                    expect(newNavigateTaskJSON.actions[0].action_definition).toBe('NAVIGATE');
                });
            });

            let savedTask;
            let savedNavigateAction;
            describe('save()', () => {
                beforeAll((done) => {
                    newNavigateTask.save()
                        .then((task) => {
                            savedTask = task;
                            savedNavigateAction = task.actions[0];
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                describe('When task is saved, server response should be parsed', () => {
                    it('Parsed task has information we submitted', () => {
                        expect(savedTask.name).toBe('Navigate to infinity and beyond');
                        expect(savedTask.status).toBe('NEW');
                        expect(savedTask.robot).toBe('freight305');
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
                    it('Parsed NavigateAction has status', () => {
                        expect(savedNavigateAction.status).toBe('NEW');
                    });

                    it('Parsed NavigateAction has preemptable', () => {
                        expect(savedNavigateAction.preemptable).toBe('NONE');
                    });

                    it('Parsed NavigateAction has id', () => {
                        expect(savedNavigateAction.id).toEqual(jasmine.any(Number));
                    });

                    it('Parsed NavigateAction has actionDefinition', () => {
                        expect(savedNavigateAction.actionDefinition).toBe('NAVIGATE');
                    });

                    it('Parsed NavigateAction has created', () => {
                        expect(savedNavigateAction.created).toEqual(jasmine.any(String));
                    });

                    it('Parsed NavigateAction has modified', () => {
                        expect(savedNavigateAction.modified).toEqual(jasmine.any(String));
                    });

                    it('Parsed NavigateAction has task ID', () => {
                        expect(savedNavigateAction.task).toBe(savedTask.id);
                    });

                    it('Parsed NavigateAction has inputs', () => {
                        expect(savedNavigateAction.inputs.goalPose.x).toBe(1);
                        expect(savedNavigateAction.inputs.goalPose.y).toBe(1);
                        expect(savedNavigateAction.inputs.goalPose.theta).toBe(0);
                        expect(savedNavigateAction.inputs.monitored).toBeFalsy();
                        expect(savedNavigateAction.inputs.resultBased).toBeFalsy();
                        expect(savedNavigateAction.inputs.clearCostmaps).toBeFalsy();
                        expect(savedNavigateAction.inputs.limitVelocity).toBeTruthy();
                        expect(savedNavigateAction.inputs.maxVelocity).toBe(1);
                        expect(savedNavigateAction.inputs.maxAngularVelocity).toBe(1);
                    });

                    it('Parsed NavigateAction has outputs', () => {
                        expect(Object.keys(savedNavigateAction.outputs).includes('totalDuration')).toBeTruthy();
                        expect(Object.keys(savedNavigateAction.outputs).includes('recoveryDuration')).toBeTruthy();
                        expect(Object.keys(savedNavigateAction.outputs).includes('controllerDuration')).toBeTruthy();
                        expect(Object.keys(savedNavigateAction.outputs).includes('planningDuration')).toBeTruthy();
                        expect(Object.keys(savedNavigateAction.outputs).includes('message')).toBeTruthy();
                        expect(Object.keys(savedNavigateAction.outputs).includes('events')).toBeTruthy();
                    });
                });
            });

            let latestNavigateAction;
            describe('update()', () => {
                it('should have a status of NEW prior to invoking update()', () => {
                    expect(savedNavigateAction.status).toBe('NEW');
                });

                it('should update the action status to WORKING from NEW', (done) => {
                    savedNavigateAction.status = 'WORKING';
                    savedNavigateAction.update()
                        .then((updatedNavigateAction) => {
                            latestNavigateAction = updatedNavigateAction;
                            expect(updatedNavigateAction.status).toBe('WORKING');
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });
            });

            let actionFromStream;
            describe('subscribeTo', () => {
                describe('When action stream is subscribed to freight305', () => {
                    beforeAll((done) => {
                        const handleMessage = (navigateAction) => {
                            actionFromStream = navigateAction;
                            NavigateAction.unsubscribeTo('freight305', handleMessage);
                            done();
                        };

                        NavigateAction.subscribeTo('freight305', handleMessage);
                        latestNavigateAction.status = 'COMPLETE';
                        latestNavigateAction.update()
                            .catch((clientError) => {
                                done.fail(clientError.toString());
                            });
                    });

                    it('should receive updates regarding NavigateActions that were assigned to freight305', () => {
                        expect(actionFromStream).not.toBeUndefined();
                        expect(actionFromStream.actionDefinition).toBe('NAVIGATE');
                    });

                    it('should have the latest status of the action', () => {
                        expect(actionFromStream.status).toBe('COMPLETE');
                    });
                });
            });
        });
    });
});
