'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

const TestServer      = require('../../../util/TestServer.js');
const FetchcoreClient = require('../../../src/FetchcoreClient.js');
const Robot           = require('../../../src/resources/robots/Robot.js');

describe('Robot', () => {
    describe('Instance methods', () => {
        let newRobot;
        beforeAll((done) => {
            const client = FetchcoreClient.defaultClient();
            client.configure(TestServer.HOST(), TestServer.PORT());
            client.authenticate('fetch', 'robotics')
            .then(() => {
                done();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
        });

        describe('constructor()', () => {
            newRobot = new Robot({ name: 'freight100' });

            it('should initialize default properties for a robot', () => {
                expect(newRobot.props).not.toBe(undefined);
                expect(newRobot.props.footprint).toBe('FREIGHT100');
                expect(newRobot.props.configurations[0]).toBe('MOBILE');
            });

            it('should be indicated as a new robot', () => {
                expect(newRobot.isNew()).toBeTruthy();
            });
        });

        let savedRobot;
        describe('save()', () => {
            beforeAll((done) => {
                newRobot.save('robotics')
                .then((robot) => {
                    savedRobot = robot;
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
            });

            it('should turn a new robot into an old robot before it has been saved', () => {
                expect(savedRobot.isNew()).toBeFalsy();
            });

            it('should give robot an id from database', () => {
                expect(savedRobot.id).not.toBeUndefined();
            });
        });

        describe('update()', () => {
            it('should submit a PATCH request and update robot based on new props', (done) => {
                savedRobot.footprint = 'HMI25';
                savedRobot.update()
                    .then((robot) => {
                        expect(robot.footprint).toBe('HMI25');
                        expect(robot.name).toBe('freight100');
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });
        });

        describe('setters and getters', () => {
            it('can get and set name', () => {
                expect(savedRobot.name).not.toBeUndefined();
                expect(savedRobot.name).toBe('freight100');
                savedRobot.name = 'freight101';
                expect(savedRobot.name).toBe('freight101');
            });

            it('can get status', () => {
                expect(savedRobot.status).not.toBeUndefined();
                expect(typeof savedRobot.status).toBe('string');
            });

            it('can get and set map', () => {
                expect(savedRobot.map).not.toBeUndefined();
                expect(savedRobot.map).toBe(null);
                savedRobot.map = 1;
                expect(savedRobot.map).toBe(1);
            });

            it('can get created time', () => {
                expect(savedRobot.created).not.toBeUndefined();
                expect(typeof savedRobot.created).toBe('string');
            });

            it('can get last charging time', () => {
                expect(savedRobot.lastCharge).not.toBeUndefined();
                expect(typeof savedRobot.lastCharge).toBe('string');
            });

            it('can get IP address', () => {
                expect(savedRobot.ip).not.toBeUndefined();
                expect(savedRobot.ip).toBe(null);
            });

            it('can get modified time', () => {
                expect(savedRobot.modified).not.toBeUndefined();
                expect(typeof savedRobot.modified).toBe('string');
            });

            it('can get last connection time', () => {
                expect(savedRobot.modified).not.toBeUndefined();
                expect(typeof savedRobot.modified).toBe('string');
            });

            it('can get AP SSID', () => {
                expect(savedRobot.apSsid).not.toBeUndefined();
                expect(savedRobot.apSsid).toBe(null);
            });

            it('can get last status change', () => {
                expect(savedRobot.lastStatusChange).not.toBeUndefined();
                expect(typeof savedRobot.lastStatusChange).toBe('string');
            });

            it('can get last boot', () => {
                expect(savedRobot.lastBoot).not.toBeUndefined();
                expect(savedRobot.lastBoot).toBe(null);
            });

            it('can get and set footprint', () => {
                expect(savedRobot.footprint).not.toBeUndefined();
                expect(savedRobot.footprint).toMatch(/HMI|FREIGHT/);
                savedRobot.footprint = 'HMI25';
                expect(savedRobot.footprint).toBe('HMI25');
            });

            it('can get charging state', () => {
                expect(savedRobot.chargingState).not.toBeUndefined();
                expect(typeof savedRobot.chargingState).toBe('boolean');
            });

            it('can get and set installed actions', () => {
                expect(savedRobot.installedActions).not.toBeUndefined();
                expect(savedRobot.installedActions.length).toBeGreaterThan(-1);
            });

            it('can get and set AP Mac Address', () => {
                expect(savedRobot.apMacAddress).not.toBeUndefined();
                expect(savedRobot.apMacAddress).toBe(null);
            });

            it('can get id', () => {
                expect(savedRobot.id).not.toBeUndefined();
                expect(typeof savedRobot.id).toBe('number');
            });

            it('can get localized state', () => {
                expect(savedRobot.localized).not.toBeUndefined();
                expect(typeof savedRobot.localized).toBe('boolean');
            });

            it('Robot has configurations', () => {
                expect(savedRobot.configurations).not.toBeUndefined();
                expect(savedRobot.configurations.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Static methods', () => {
        let fetchedRobot;
        describe('get()', () => {
            it('should fetch robot from server and return a Robot resource object', (done) => {
                Robot.get('freight100')
                .then((robot) => {
                    expect(robot.name).toBe('freight100');
                    fetchedRobot = robot;
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
            });
        });

        describe('all()', () => {
            it('should fetch all robots and return a list of Robot resource objects', (done) => {
                Robot.all()
                .then((robotList) => {
                    expect(robotList.length).toEqual(1);
                    expect(robotList[0].name).toEqual('freight100');
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
            });
        });

        describe('delete()', () => {
            it('should flag the robot as deleted after DELETE request is a success', (done) => {
                fetchedRobot.delete()
                .then(() => {
                    expect(fetchedRobot.isDeleted).toBeTruthy();
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
            });

            describe('After deletion', () => {
                it('should return 404 when resource is not found because it was deleted', (done) => {
                    Robot.get('freight100')
                    .then(() => {
                        done.fail('Delete did not remove robot from database');
                    })
                    .catch((clientError) => {
                        expect(clientError.httpStatus).toBe(404);
                        done();
                    });
                });
            });
        });
    });
});
