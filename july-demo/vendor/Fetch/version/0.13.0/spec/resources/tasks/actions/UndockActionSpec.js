'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

/* global jasmine */
const TestServer       = require('../../../../util/TestServer.js');
const FetchcoreClient  = require('../../../../src/FetchcoreClient.js');
const Task             = require('../../../../src/resources/tasks/Task.js');
const Robot            = require('../../../../src/resources/robots/Robot.js');
const UndockAction   = require('../../../../src/resources/tasks/actions/UndockAction.js');

// NOTE: Undock requires Robot configuration MOBILE
describe('Action', () => {
    beforeAll((done) => {
        const client = FetchcoreClient.defaultClient();
        client.configure(TestServer.HOST(), TestServer.PORT());
        client.authenticate('fetch', 'robotics')
            .then(() => {
                const freight306 = new Robot({
                    name: 'freight306',
                    configurations: ['MOBILE']
                });
                freight306.save('robotics')
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
            const newUndockAction = new UndockAction({
                status: 'NEW',
                inputs: {
                    rotateInPlace: true
                },
                preemptable: 'NONE'
            });

            const newUndockTask = new Task({
                name: 'Leave that dock',
                robot: 'freight306',
                actions: [newUndockAction],
                type: 'TEST'
            });

            describe('new NavigateAction.toJSON() should parse action object to JSON correctly', () => {
                const newUndockActionJSON = newUndockAction.toJSON();

                it('new NavigateAction JSON has rotate in place inside inputs', () => {
                    expect(newUndockActionJSON.inputs.rotate_in_place).toBeTruthy();
                });

                it('new NavigateAction JSON has status', () => {
                    expect(newUndockActionJSON.status).toBe('NEW');
                });

                it('new NavigateAction JSON has action definition', () => {
                    expect(newUndockActionJSON.action_definition).toBe('UNDOCK');
                });

                it('new NavigateAction has preemptable', () => {
                    expect(newUndockActionJSON.preemptable).toBe('NONE');
                });
            });

            describe('Task.toJSON() should call actions toJSON', () => {
                const newUndockTaskJSON = newUndockTask.toJSON();

                it('Task JSON has task name', () => {
                    expect(newUndockTaskJSON.name).toBe('Leave that dock');
                });

                it('Task JSON has task type', () => {
                    expect(newUndockTaskJSON.type).toBe('TEST');
                });

                it('Task JSON has robot', () => {
                    expect(newUndockTaskJSON.robot).toBe('freight306');
                });

                it('Task JSON has a list of actions', () => {
                    expect(newUndockTaskJSON.actions.constructor.name).toBe('Array');
                    expect(newUndockTaskJSON.actions[0].action_definition).toBe('UNDOCK');
                });
            });

            let savedTask;
            let savedUndockAction;
            describe('save()', () => {
                beforeAll((done) => {
                    newUndockTask.save()
                        .then((task) => {
                            savedTask = task;
                            savedUndockAction = task.actions[0];
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                describe('When task is saved, server response should be parsed', () => {
                    it('Parsed task has information we submitted', () => {
                        expect(savedTask.name).toBe('Leave that dock');
                        expect(savedTask.status).toBe('NEW');
                        expect(savedTask.robot).toBe('freight306');
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
                    it('Parsed UndockAction has status', () => {
                        expect(savedUndockAction.status).toBe('NEW');
                    });

                    it('Parsed UndockAction has preemptable', () => {
                        expect(savedUndockAction.preemptable).toBe('NONE');
                    });

                    it('Parsed UndockAction has id', () => {
                        expect(savedUndockAction.id).toEqual(jasmine.any(Number));
                    });

                    it('Parsed UndockAction has actionDefinition', () => {
                        expect(savedUndockAction.actionDefinition).toBe('UNDOCK');
                    });

                    it('Parsed UndockAction has created', () => {
                        expect(savedUndockAction.created).toEqual(jasmine.any(String));
                    });

                    it('Parsed UndockAction has modified', () => {
                        expect(savedUndockAction.modified).toEqual(jasmine.any(String));
                    });

                    it('Parsed UndockAction has task ID', () => {
                        expect(savedUndockAction.task).toBe(savedTask.id);
                    });

                    it('Parsed UndockAction has inputs', () => {
                        expect(savedUndockAction.inputs.rotateInPlace).toBeTruthy();
                    });
                });
            });

            let latestUndockAction;
            describe('update()', () => {
                it('should have a status of NEW prior to invoking update()', () => {
                    expect(savedUndockAction.status).toBe('NEW');
                });

                it('should update the action status to WORKING from NEW', (done) => {
                    savedUndockAction.status = 'WORKING';
                    savedUndockAction.update()
                        .then((updatedUndockAction) => {
                            latestUndockAction = updatedUndockAction;
                            expect(updatedUndockAction.status).toBe('WORKING');
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });
            });

            let actionFromStream;
            describe('subscribeTo', () => {
                describe('When action stream is subscribed to freight306', () => {
                    beforeAll((done) => {
                        const handleMessage = (undockAction) => {
                            actionFromStream = undockAction;
                            UndockAction.unsubscribeTo('freight306', handleMessage);
                            done();
                        };

                        UndockAction.subscribeTo('freight306', handleMessage);
                        latestUndockAction.status = 'COMPLETE';
                        latestUndockAction.update()
                            .catch((clientError) => {
                                done.fail(clientError.toString());
                            });
                    });

                    it('should receive updates regarding BuildMapActions that were assigned to freight306', () => {
                        expect(actionFromStream).not.toBeUndefined();
                        expect(actionFromStream.actionDefinition).toBe('UNDOCK');
                    });

                    it('should have the latest status of the action', () => {
                        expect(actionFromStream.status).toBe('COMPLETE');
                    });
                });
            });
        });
    });
});
