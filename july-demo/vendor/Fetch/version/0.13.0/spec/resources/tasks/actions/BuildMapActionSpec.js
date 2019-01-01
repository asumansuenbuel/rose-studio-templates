'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

/* global jasmine */
const TestServer       = require('../../../../util/TestServer.js');
const FetchcoreClient  = require('../../../../src/FetchcoreClient.js');
const Task             = require('../../../../src/resources/tasks/Task.js');
const Robot            = require('../../../../src/resources/robots/Robot.js');
const BuildMapAction   = require('../../../../src/resources/tasks/actions/BuildMapAction.js');

// NOTE: BuildMap requires Robot configuration MOBILE
describe('Action', () => {
    beforeAll((done) => {
        const client = FetchcoreClient.defaultClient();
        client.configure(TestServer.HOST(), TestServer.PORT());
        client.authenticate('fetch', 'robotics')
            .then(() => {
                const freight301 = new Robot({
                    name: 'freight301',
                    configurations: ['MOBILE']
                });
                freight301.save('robotics')
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

    describe('BuildMap', () => {
        describe('Submitting task with actions to server', () => {
            const newBuildMap = new BuildMapAction({
                status: 'NEW',
                inputs: {
                    mapName: 'Fetch Robotics Office Map'
                },
                preemptable: 'NONE'
            });

            const newBuildMapTask = new Task({
                name: 'Send robot to build map',
                robot: 'freight301',
                actions: [newBuildMap],
                type: 'TEST'
            });

            describe('BuildMapAction.toJSON() should parse action object to JSON correctly', () => {
                const buildMapActionJSON = newBuildMap.toJSON();

                it('BuildMapAction JSON has map name inside inputs', () => {
                    expect(buildMapActionJSON.inputs.mapname).toBe('Fetch Robotics Office Map');
                });

                it('BuildMapAction JSON has status', () => {
                    expect(buildMapActionJSON.status).toBe('NEW');
                });

                it('BuildMapAction JSON has action definition', () => {
                    expect(buildMapActionJSON.action_definition).toBe('BUILDMAP');
                });

                it('BuildMapAction has preemptable', () => {
                    expect(buildMapActionJSON.preemptable).toBe('NONE');
                });
            });

            describe('Task.toJSON() should call actions toJSON', () => {
                const buildMapTaskJSON = newBuildMapTask.toJSON();

                it('Task JSON has task name', () => {
                    expect(buildMapTaskJSON.name).toBe('Send robot to build map');
                });

                it('Task JSON has task type', () => {
                    expect(buildMapTaskJSON.type).toBe('TEST');
                });

                it('Task JSON has robot', () => {
                    expect(buildMapTaskJSON.robot).toBe('freight301');
                });

                it('Task JSON has a list of actions', () => {
                    expect(buildMapTaskJSON.actions.constructor.name).toBe('Array');
                    expect(buildMapTaskJSON.actions[0].action_definition).toBe('BUILDMAP');
                });
            });

            let savedTask;
            let savedBuildMapAction;
            describe('save()', () => {
                beforeAll((done) => {
                    newBuildMapTask.save()
                        .then((task) => {
                            savedTask = task;
                            savedBuildMapAction = task.actions[0];
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                describe('When task is saved, server response should be parsed', () => {
                    it('Parsed task has information we submitted', () => {
                        expect(savedTask.name).toBe('Send robot to build map');
                        expect(savedTask.status).toBe('NEW');
                        expect(savedTask.robot).toBe('freight301');
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
                    it('Parsed BuildMapAction has status', () => {
                        expect(savedBuildMapAction.status).toBe('NEW');
                    });

                    it('Parsed BuildMapAction has preemptable', () => {
                        expect(savedBuildMapAction.preemptable).toBe('NONE');
                    });

                    it('Parsed BuildMapAction has id', () => {
                        expect(savedBuildMapAction.id).toEqual(jasmine.any(Number));
                    });

                    it('Parsed BuildMapAction has actionDefinition', () => {
                        expect(savedBuildMapAction.actionDefinition).toBe('BUILDMAP');
                    });

                    it('Parsed BuildMapAction has created', () => {
                        expect(savedBuildMapAction.created).toEqual(jasmine.any(String));
                    });

                    it('Parsed BuildMapAction has modified', () => {
                        expect(savedBuildMapAction.modified).toEqual(jasmine.any(String));
                    });

                    it('Parsed BuildMapAction has inputs', () => {
                        expect(savedBuildMapAction.inputs.mapName).toBe('Fetch Robotics Office Map');
                    });

                    it('Parsed BuildMapAction has task ID', () => {
                        expect(savedBuildMapAction.task).toBe(savedTask.id);
                    });
                });
            });

            let latestBuildMapAction;
            describe('update()', () => {
                it('should have a status of NEW prior to invoking update()', () => {
                    expect(savedBuildMapAction.status).toBe('NEW');
                });

                it('should update the action status to WORKING from NEW', (done) => {
                    savedBuildMapAction.status = 'WORKING';
                    savedBuildMapAction.update()
                        .then((updatedBuildMapAction) => {
                            latestBuildMapAction = updatedBuildMapAction;
                            expect(updatedBuildMapAction.status).toBe('WORKING');
                            done();
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });
            });

            let actionFromStream;
            describe('subscribeTo', () => {
                describe('When action stream is subscribed to freight301', () => {
                    beforeAll((done) => {
                        const handleMessage = (buildMapAction) => {
                            actionFromStream = buildMapAction;
                            BuildMapAction.unsubscribeTo('freight301', handleMessage);
                            done();
                        };

                        BuildMapAction.subscribeTo('freight301', handleMessage);
                        latestBuildMapAction.status = 'COMPLETE';
                        latestBuildMapAction.update()
                            .catch((clientError) => {
                                done.fail(clientError.toString());
                            });
                    });

                    it('should receive updates regarding BuildMapActions that were assigned to freight301', () => {
                        expect(actionFromStream).not.toBeUndefined();
                        expect(actionFromStream.actionDefinition).toBe('BUILDMAP');
                    });

                    it('should have the latest status of the action', () => {
                        expect(actionFromStream.status).toBe('COMPLETE');
                    });
                });
            });
        });
    });
});
