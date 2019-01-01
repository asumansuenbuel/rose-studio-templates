'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

const Action           = require('../../../src/resources/tasks/Action.js');

/* global jasmine */
describe('Action', () => {
    describe('Action', () => {
        describe('Properties passed in through constructor', () => {
            // Using generic Action class to create a BuildMap action
            const newGenericAction = new Action({
                status: 'NEW',
                actionDefinition: 'BUILDMAP',
                preemptable: 'NONE',
                onComplete: []
            });

            describe('newGenericAction.toJSON() should parse action object to JSON correctly', () => {
                const actionJSON = newGenericAction.toJSON();

                it('Action JSON has status', () => {
                    expect(actionJSON.status).toBe('NEW');
                });

                it('Action JSON has action definition', () => {
                    expect(actionJSON.action_definition).toBe('BUILDMAP');
                });

                it('Action JSON has preemptable', () => {
                    expect(actionJSON.preemptable).toBe('NONE');
                });

                it('Action JSON has on complete', () => {
                    expect(actionJSON.on_complete.constructor.name).toBe('Array');
                });
            });
        });

        describe('Properties are passed in through parse() function', () => {
            const newGenericAction = new Action();
            newGenericAction.parse({
                status: 'NEW',
                action_definition: 'BUILDMAP',
                preemptable: 'NONE',
                task: 1,
                start: '2017-03-21',
                end: '2017-03-22',
                created: '2017-03-20',
                modified: '2017-03-22',
                id: 1,
                on_complete: []
            });

            it('Generic action has task', () => {
                expect(newGenericAction.task).toEqual(jasmine.any(Number));
            });

            it('Generic action has action definition', () => {
                expect(newGenericAction.actionDefinition).toBe('BUILDMAP');
            });

            it('Generic action has preemptable', () => {
                expect(newGenericAction.preemptable).toBe('NONE');
            });

            it('Generic action has task', () => {
                expect(newGenericAction.task).toEqual(jasmine.any(Number));
            });

            it('Generic action has start', () => {
                expect(newGenericAction.start).toEqual(jasmine.any(String));
            });

            it('Generic action has end', () => {
                expect(newGenericAction.end).toEqual(jasmine.any(String));
            });

            it('Generic action has created', () => {
                expect(newGenericAction.created).toEqual(jasmine.any(String));
            });

            it('Generic action has modified', () => {
                expect(newGenericAction.modified).toEqual(jasmine.any(String));
            });

            it('Generic action has id', () => {
                expect(newGenericAction.id).toEqual(jasmine.any(Number));
            });

            it('Generic action has on complete', () => {
                expect(newGenericAction.onComplete.constructor.name).toBe('Array');
            });
        });
    });
});
