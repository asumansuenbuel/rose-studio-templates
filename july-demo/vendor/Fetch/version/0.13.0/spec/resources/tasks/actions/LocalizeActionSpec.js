'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

/* global jasmine */
const TestServer       = require('../../../../util/TestServer.js');
const FetchcoreClient  = require('../../../../src/FetchcoreClient.js');
const Task             = require('../../../../src/resources/tasks/Task.js');
const Robot            = require('../../../../src/resources/robots/Robot.js');
const LocalizeAction   = require('../../../../src/resources/tasks/actions/LocalizeAction.js');

// NOTE: Localize requires Robot configuration MOBILE
describe('Action', () => {
    beforeAll((done) => {
        const client = FetchcoreClient.defaultClient();
        client.configure(TestServer.HOST(), TestServer.PORT());
        client.authenticate('fetch', 'robotics')
            .then(() => {
                const freight304 = new Robot({
                    name: 'freight304',
                    configurations: ['MOBILE']
                });
                freight304.save('robotics')
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

    describe('Localize', () => {
        describe('Submitting task with actions to server', () => {
            const newLocalizeAction = new LocalizeAction({
                status: 'NEW',
                inputs: {
                    poseEstimate: {
                        x: 1,
                        y: 1,
                        theta: 0
                    }
                },
                preemptable: 'NONE'
            });

            const newLocalizeTask = new Task({
                name: 'Localize that robot',
                robot: 'freight304',
                actions: [newLocalizeAction],
                type: 'TEST'
            });

            describe('new LocalizeAction.toJSON() should parse action object to JSON correctly', () => {
                const newLocalizeActionJSON = newLocalizeAction.toJSON();

                it('new LocalizeAction JSON has pose estimate inside inputs', () => {
                    expect(newLocalizeActionJSON.inputs.pose_estimate.x).toBe(1);
                    expect(newLocalizeActionJSON.inputs.pose_estimate.y).toBe(1);
                    expect(newLocalizeActionJSON.inputs.pose_estimate.theta).toBe(0);
                });

                it('new LocalizeAction JSON has status', () => {
                    expect(newLocalizeActionJSON.status).toBe('NEW');
                });

                it('new LocalizeAction JSON has action definition', () => {
                    expect(newLocalizeActionJSON.action_definition).toBe('LOCALIZE');
                });

                it('new LocalizeAction has preemptable', () => {
                    expect(newLocalizeActionJSON.preemptable).toBe('NONE');
                });
            });

            describe('Task.toJSON() should call actions toJSON', () => {
                const newLocalizeTaskJSON = newLocalizeTask.toJSON();

                it('Task JSON has task name', () => {
                    expect(newLocalizeTaskJSON.name).toBe('Localize that robot');
                });

                it('Task JSON has task type', () => {
                    expect(newLocalizeTaskJSON.type).toBe('TEST');
                });

                it('Task JSON has robot', () => {
                    expect(newLocalizeTaskJSON.robot).toBe('freight304');
                });

                it('Task JSON has a list of actions', () => {
                    expect(newLocalizeTaskJSON.actions.constructor.name).toBe('Array');
                    expect(newLocalizeTaskJSON.actions[0].action_definition).toBe('LOCALIZE');
                });
            });

            let savedTask;
            let savedLocalizeAction;
            describe('save()', () => {
                beforeAll((done) => {
                    newLocalizeTask.save()
                        .then((task) => {
                            savedTask = task;
                            savedLocalizeAction = task.actions[0];
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                describe('When task is saved, server response should be parsed', () => {
                    it('Parsed task has information we submitted', () => {
                        expect(savedTask.name).toBe('Localize that robot');
                        expect(savedTask.status).toBe('NEW');
                        expect(savedTask.robot).toBe('freight304');
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
                    it('Parsed LocalizeAction has status', () => {
                        expect(savedLocalizeAction.status).toBe('NEW');
                    });

                    it('Parsed LocalizeAction has preemptable', () => {
                        expect(savedLocalizeAction.preemptable).toBe('NONE');
                    });

                    it('Parsed LocalizeAction has id', () => {
                        expect(savedLocalizeAction.id).toEqual(jasmine.any(Number));
                    });

                    it('Parsed LocalizeAction has actionDefinition', () => {
                        expect(savedLocalizeAction.actionDefinition).toBe('LOCALIZE');
                    });

                    it('Parsed LocalizeAction has created', () => {
                        expect(savedLocalizeAction.created).toEqual(jasmine.any(String));
                    });

                    it('Parsed LocalizeAction has modified', () => {
                        expect(savedLocalizeAction.modified).toEqual(jasmine.any(String));
                    });

                    it('Parsed LocalizeAction has task ID', () => {
                        expect(savedLocalizeAction.task).toBe(savedTask.id);
                    });

                    it('Parsed LocalizeAction has inputs', () => {
                        expect(savedLocalizeAction.inputs.poseEstimate.x).toBe(1);
                        expect(savedLocalizeAction.inputs.poseEstimate.y).toBe(1);
                        expect(savedLocalizeAction.inputs.poseEstimate.theta).toBe(0);
                    });
                });
            });

            let latestLocalizeAction;
            describe('update()', () => {
                it('should have a status of NEW prior to invoking update()', () => {
                    expect(savedLocalizeAction.status).toBe('NEW');
                });

                it('should update the action status to WORKING from NEW', (done) => {
                    savedLocalizeAction.status = 'WORKING';
                    savedLocalizeAction.update()
                        .then((updatedLocalizedAction) => {
                            latestLocalizeAction = updatedLocalizedAction;
                            expect(updatedLocalizedAction.status).toBe('WORKING');
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });
            });

            let actionFromStream;
            describe('subscribeTo', () => {
                describe('When action stream is subscribed to freight304', () => {
                    beforeAll((done) => {
                        const handleMessage = (localizeAction) => {
                            actionFromStream = localizeAction;
                            LocalizeAction.unsubscribeTo('freight304', handleMessage);
                            done();
                        };

                        LocalizeAction.subscribeTo('freight304', handleMessage);
                        latestLocalizeAction.status = 'COMPLETE';
                        latestLocalizeAction.update()
                            .catch((clientError) => {
                                done.fail(clientError.toString());
                            });
                    });

                    it('should receive updates regarding LocalizeActions that were assigned to freight304', () => {
                        expect(actionFromStream).not.toBeUndefined();
                        expect(actionFromStream.actionDefinition).toBe('LOCALIZE');
                    });

                    it('should have the latest status of the action', () => {
                        expect(actionFromStream.status).toBe('COMPLETE');
                    });
                });
            });
        });
    });
});
