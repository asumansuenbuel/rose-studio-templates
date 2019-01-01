'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

/* global jasmine */
const TestServer       = require('../../../../util/TestServer.js');
const FetchcoreClient  = require('../../../../src/FetchcoreClient.js');
const Task             = require('../../../../src/resources/tasks/Task.js');
const Robot            = require('../../../../src/resources/robots/Robot.js');
const WaitForAction    = require('../../../../src/resources/tasks/actions/WaitForAction.js');

// NOTE: WaitFor requires Robot configuration MOBILE
describe('Action', () => {
    beforeAll((done) => {
        const client = FetchcoreClient.defaultClient();
        client.configure(TestServer.HOST(), TestServer.PORT());
        client.authenticate('fetch', 'robotics')
            .then(() => {
                const freight307 = new Robot({
                    name: 'freight307',
                    configurations: ['MOBILE']
                });
                freight307.save('robotics')
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
            const newWaitForAction = new WaitForAction({
                status: 'NEW',
                inputs: {
                    duration: '01:15:30'
                },
                preemptable: 'NONE'
            });

            const newWaitForTask = new Task({
                name: 'Sit and wait there',
                robot: 'freight307',
                actions: [newWaitForAction],
                type: 'TEST'
            });

            describe('new WaitForAction.toJSON() should parse action object to JSON correctly', () => {
                const newWaitForActionJSON = newWaitForAction.toJSON();

                it('new WaitForAction JSON has rotate in place inside inputs', () => {
                    expect(newWaitForActionJSON.inputs.duration).toBe('01:15:30');
                });

                it('new WaitForAction JSON has status', () => {
                    expect(newWaitForActionJSON.status).toBe('NEW');
                });

                it('new WaitForAction JSON has action definition', () => {
                    expect(newWaitForActionJSON.action_definition).toBe('WAITFOR');
                });

                it('new WaitForAction has preemptable', () => {
                    expect(newWaitForActionJSON.preemptable).toBe('NONE');
                });
            });

            describe('Task.toJSON() should call actions toJSON', () => {
                const newWaitForTaskJSON = newWaitForTask.toJSON();

                it('Task JSON has task name', () => {
                    expect(newWaitForTaskJSON.name).toBe('Sit and wait there');
                });

                it('Task JSON has task type', () => {
                    expect(newWaitForTaskJSON.type).toBe('TEST');
                });

                it('Task JSON has robot', () => {
                    expect(newWaitForTaskJSON.robot).toBe('freight307');
                });

                it('Task JSON has a list of actions', () => {
                    expect(newWaitForTaskJSON.actions.constructor.name).toBe('Array');
                    expect(newWaitForTaskJSON.actions[0].action_definition).toBe('WAITFOR');
                });
            });

            let savedTask;
            let savedWaitForAction;
            describe('save()', () => {
                beforeAll((done) => {
                    newWaitForTask.save()
                        .then((task) => {
                            savedTask = task;
                            savedWaitForAction = task.actions[0];
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                describe('When task is saved, server response should be parsed', () => {
                    it('Parsed task has information we submitted', () => {
                        expect(savedTask.name).toBe('Sit and wait there');
                        expect(savedTask.status).toBe('NEW');
                        expect(savedTask.robot).toBe('freight307');
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
                    it('Parsed WaitForAction has status', () => {
                        expect(savedWaitForAction.status).toBe('NEW');
                    });

                    it('Parsed WaitForAction has preemptable', () => {
                        expect(savedWaitForAction.preemptable).toBe('NONE');
                    });

                    it('Parsed WaitForAction has id', () => {
                        expect(savedWaitForAction.id).toEqual(jasmine.any(Number));
                    });

                    it('Parsed WaitForAction has actionDefinition', () => {
                        expect(savedWaitForAction.actionDefinition).toBe('WAITFOR');
                    });

                    it('Parsed WaitForAction has created', () => {
                        expect(savedWaitForAction.created).toEqual(jasmine.any(String));
                    });

                    it('Parsed WaitForAction has modified', () => {
                        expect(savedWaitForAction.modified).toEqual(jasmine.any(String));
                    });

                    it('Parsed WaitForAction has task ID', () => {
                        expect(savedWaitForAction.task).toBe(savedTask.id);
                    });

                    it('Parsed WaitForAction has inputs', () => {
                        expect(savedWaitForAction.inputs.duration).toBe('01:15:30');
                    });
                });
            });

            let latestWaitForAction;
            describe('update()', () => {
                it('should have a status of NEW prior to invoking update()', () => {
                    expect(savedWaitForAction.status).toBe('NEW');
                });

                it('should update the action status to WORKING from NEW', (done) => {
                    savedWaitForAction.status = 'WORKING';
                    savedWaitForAction.update()
                        .then((updatedWaitForAction) => {
                            latestWaitForAction = updatedWaitForAction;
                            expect(updatedWaitForAction.status).toBe('WORKING');
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });
            });

            let actionFromStream;
            describe('subscribeTo', () => {
                describe('When action stream is subscribed to freight307', () => {
                    beforeAll((done) => {
                        const handleMessage = (waitForAction) => {
                            actionFromStream = waitForAction;
                            WaitForAction.unsubscribeTo('freight307', handleMessage);
                            done();
                        };

                        WaitForAction.subscribeTo('freight307', handleMessage);
                        latestWaitForAction.status = 'COMPLETE';
                        latestWaitForAction.update()
                            .catch((clientError) => {
                                done.fail(clientError.toString());
                            });
                    });

                    it('should receive updates regarding WaitForActions that were assigned to freight307', () => {
                        expect(actionFromStream).not.toBeUndefined();
                        expect(actionFromStream.actionDefinition).toBe('WAITFOR');
                    });

                    it('should have the latest status of the action', () => {
                        expect(actionFromStream.status).toBe('COMPLETE');
                    });
                });
            });
        });
    });
});
