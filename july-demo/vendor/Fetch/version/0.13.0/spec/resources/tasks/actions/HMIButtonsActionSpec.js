'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

/* global jasmine */
const TestServer       = require('../../../../util/TestServer.js');
const FetchcoreClient  = require('../../../../src/FetchcoreClient.js');
const Task             = require('../../../../src/resources/tasks/Task.js');
const Robot            = require('../../../../src/resources/robots/Robot.js');
const HMIButtonsAction = require('../../../../src/resources/tasks/actions/HMIButtonsAction.js');

// NOTE: HMI Buttons requires Robot configuration HMI
describe('Action', () => {
    beforeAll((done) => {
        const client = FetchcoreClient.defaultClient();
        client.configure(TestServer.HOST(), TestServer.PORT());
        client.authenticate('fetch', 'robotics')
        .then(() => {
            const freight303 = new Robot({
                name: 'freight303',
                configurations: ['HMI']
            });
            freight303.save('robotics')
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

    describe('HMI Buttons', () => {
        describe('Submitting task with actions to server', () => {
            const newButtonsAction = new HMIButtonsAction({
                status: 'NEW',
                inputs: {
                    buttonNames: ['Take red pill', 'Take blue pill'],
                    buttonData: [
                        'You stay in Wonderland and I show you how deep the rabbit hole goes',
                        'The story ends, you wake up in your bed and believe whatever you want to believe'
                    ],
                    buttonsPerRow: 2
                },
                preemptable: 'NONE'
            });

            const newHMIButtonsTask = new Task({
                name: 'Morpheus',
                robot: 'freight303',
                actions: [newButtonsAction],
                type: 'TEST'
            });

            describe('new ButtonsAction.toJSON() should parse action object to JSON correctly', () => {
                const newButtonsActionJSON = newButtonsAction.toJSON();

                it('new ButtonsAction JSON has button names inside inputs', () => {
                    expect(newButtonsActionJSON.inputs.button_names[0]).toBe('Take red pill');
                    expect(newButtonsActionJSON.inputs.button_names[1]).toBe('Take blue pill');
                });

                it('new ButtonsAction JSON has button data inside inputs', () => {
                    expect(newButtonsActionJSON.inputs.button_data[0]).toBe(
                        'You stay in Wonderland and I show you how deep the rabbit hole goes'
                    );
                    expect(newButtonsActionJSON.inputs.button_data[1]).toBe(
                        'The story ends, you wake up in your bed and believe whatever you want to believe'
                    );
                });

                it('new ButtonsAction JSON has buttons per row inside inputs', () => {
                    expect(newButtonsActionJSON.inputs.buttons_per_row).toBe(2);
                });

                it('new ButtonsAction JSON has status', () => {
                    expect(newButtonsActionJSON.status).toBe('NEW');
                });

                it('new ButtonsAction JSON has action definition', () => {
                    expect(newButtonsActionJSON.action_definition).toBe('HMI_BUTTONS');
                });

                it('newButtonsAction has preemptable', () => {
                    expect(newButtonsActionJSON.preemptable).toBe('NONE');
                });
            });

            describe('Task.toJSON() should call actions toJSON', () => {
                const newHMIButtonsTaskJSON = newHMIButtonsTask.toJSON();

                it('Task JSON has task name', () => {
                    expect(newHMIButtonsTaskJSON.name).toBe('Morpheus');
                });

                it('Task JSON has task type', () => {
                    expect(newHMIButtonsTaskJSON.type).toBe('TEST');
                });

                it('Task JSON has robot', () => {
                    expect(newHMIButtonsTaskJSON.robot).toBe('freight303');
                });

                it('Task JSON has a list of actions', () => {
                    expect(newHMIButtonsTaskJSON.actions.constructor.name).toBe('Array');
                    expect(newHMIButtonsTaskJSON.actions[0].action_definition).toBe('HMI_BUTTONS');
                });
            });

            let savedTask;
            let savedHMIButtonsAction;
            describe('save()', () => {
                beforeAll((done) => {
                    newHMIButtonsTask.save()
                    .then((task) => {
                        savedTask = task;
                        savedHMIButtonsAction = task.actions[0];
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
                });

                describe('When task is saved, server response should be parsed', () => {
                    it('Parsed task has information we submitted', () => {
                        expect(savedTask.name).toBe('Morpheus');
                        expect(savedTask.status).toBe('NEW');
                        expect(savedTask.robot).toBe('freight303');
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
                    it('Parsed HMIButtonsAction has status', () => {
                        expect(savedHMIButtonsAction.status).toBe('NEW');
                    });

                    it('Parsed HMIButtonsAction has preemptable', () => {
                        expect(savedHMIButtonsAction.preemptable).toBe('NONE');
                    });

                    it('Parsed HMIButtonsAction has id', () => {
                        expect(savedHMIButtonsAction.id).toEqual(jasmine.any(Number));
                    });

                    it('Parsed HMIButtonsAction has actionDefinition', () => {
                        expect(savedHMIButtonsAction.actionDefinition).toBe('HMI_BUTTONS');
                    });

                    it('Parsed HMIButtonsAction has created', () => {
                        expect(savedHMIButtonsAction.created).toEqual(jasmine.any(String));
                    });

                    it('Parsed HMIButtonsAction has modified', () => {
                        expect(savedHMIButtonsAction.modified).toEqual(jasmine.any(String));
                    });

                    it('Parsed HMIButtonsAction has task ID', () => {
                        expect(savedHMIButtonsAction.task).toBe(savedTask.id);
                    });

                    it('Parsed HMIButtonsAction has inputs', () => {
                        expect(savedHMIButtonsAction.inputs.buttonNames[0]).toBe('Take red pill');
                        expect(savedHMIButtonsAction.inputs.buttonNames[1]).toBe('Take blue pill');
                        expect(savedHMIButtonsAction.inputs.buttonData[0]).toBe(
                            'You stay in Wonderland and I show you how deep the rabbit hole goes'
                        );
                        expect(savedHMIButtonsAction.inputs.buttonData[1]).toBe(
                            'The story ends, you wake up in your bed and believe whatever you want to believe'
                        );
                    });

                    it('Parsed HMIButtonsAction has outputs', () => {
                        expect(Object.keys(savedHMIButtonsAction.outputs).includes('buttonReturn')).toBeTruthy();
                    });
                });
            });

            let latestHMIButtonsAction;
            describe('update()', () => {
                it('should have a status of NEW prior to invoking update()', () => {
                    expect(savedHMIButtonsAction.status).toBe('NEW');
                });

                it('should update the action status to WORKING from NEW', (done) => {
                    savedHMIButtonsAction.status = 'WORKING';
                    savedHMIButtonsAction.update()
                    .then((updatedHMIButtonsAction) => {
                        latestHMIButtonsAction = updatedHMIButtonsAction;
                        expect(updatedHMIButtonsAction.status).toBe('WORKING');
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
                });
            });

            let actionFromStream;
            describe('subscribeTo', () => {
                describe('When action stream is subscribed to freight303', () => {
                    beforeAll((done) => {
                        const handleMessage = (hmiButtonsAction) => {
                            actionFromStream = hmiButtonsAction;
                            HMIButtonsAction.unsubscribeTo('freight303', handleMessage);
                            done();
                        };

                        HMIButtonsAction.subscribeTo('freight303', handleMessage);
                        latestHMIButtonsAction.status = 'COMPLETE';
                        latestHMIButtonsAction.update()
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                    });

                    it('should receive updates regarding HMIButtonsAction that were assigned to freight303', () => {
                        expect(actionFromStream).not.toBeUndefined();
                        expect(actionFromStream.actionDefinition).toBe('HMI_BUTTONS');
                    });

                    it('should have the latest status of the action', () => {
                        expect(actionFromStream.status).toBe('COMPLETE');
                    });
                });
            });
        });
    });
});
