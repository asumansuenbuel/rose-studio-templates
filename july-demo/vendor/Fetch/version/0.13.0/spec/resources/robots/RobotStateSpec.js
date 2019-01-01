'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

const TestServer      = require('../../../util/TestServer.js');
const FetchcoreClient = require('../../../src/FetchcoreClient.js');
const RobotState      = require('../../../src/resources/robots/RobotState.js');
const Robot           = require('../../../src/resources/robots/Robot.js');
const FetchSocket     = require('../../../src/FetchSocket.js');


describe('RobotState', () => {
    const upstreamSocketInstances = [];

    let token;
    beforeAll((done) => {
        const client = FetchcoreClient.defaultClient();
        client.configure(TestServer.HOST(), TestServer.PORT());
        client.authenticate('fetch', 'robotics')
        .then(() => {
            token = client.token;
            done();
        })
        .catch((clientError) => {
            done.fail(clientError.toString());
        });
    });

    afterAll(() => {
        if (upstreamSocketInstances.length > 0) {
            upstreamSocketInstances.forEach((socketInstance) => {
                socketInstance.forceClose();
            });
        }
    });

    let fetchedRobotState;
    describe('Static methods', () => {
        beforeAll((done) => {
            const freight200 = new Robot({ name: 'freight200' });
            freight200.save('robotics');

            const freight201 = new Robot({ name: 'freight201' });
            freight201.save('robotics');

            const freight202 = new Robot({ name: 'freight202' });
            freight202.save('robotics')
            .then(() => {
                const upstreamMessage = {
                    payload: {
                        action: 'update',
                        data: {
                            battery_level: 0.50,
                            localization_weight: null,
                            robot: 'freight202',
                            current_pose: {
                                x: 1,
                                y: 1,
                                theta: 0
                            },
                            wifi_strength: 0.50,
                        }
                    },
                    stream: 'robot-states'
                };

                const host = `ws://${TestServer.HOST()}:${TestServer.PORT()}`;
                const endpoint = `/api/v1/streams/robots/?token=${token}`;

                const ws = new FetchSocket(host + endpoint, {
                    onSocketOpen: () => {
                        ws.send(JSON.stringify(upstreamMessage));
                        upstreamSocketInstances.push(ws);
                    },
                    onSocketMessage: () => {
                        done();
                    }
                });

                ws.connect();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
        });

        describe('all()', () => {
            it('should submit GET to server and receive all robot states', (done) => {
                RobotState.all()
                .then((robotStateList) => {
                    expect(robotStateList.constructor).toBe(Array);
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
            });
        });

        describe('get()', () => {
            it('should submit GET to server and receive robot state of a given robot', (done) => {
                RobotState.get('freight202')
                .then((robotState) => {
                    expect(robotState.robot).toBe('freight202');
                    fetchedRobotState = robotState;
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
            });
        });
    });

    describe('Instance methods', () => {
        describe('getters', () => {
            it('RobotState has battery level', () => {
                expect(fetchedRobotState.batteryLevel).not.toBeUndefined();
            });

            it('RobotState has localization weight', () => {
                expect(fetchedRobotState.localizationWeight).not.toBeUndefined();
            });

            it('RobotState has created time', () => {
                expect(fetchedRobotState.created).not.toBeUndefined();
            });

            it('RobotState has robot battery voltage', () => {
                expect(fetchedRobotState.robotBatteryVoltage).not.toBeUndefined();
            });

            it('RobotState has modified time', () => {
                expect(fetchedRobotState.modified).not.toBeUndefined();
            });

            it('RobotState has robot', () => {
                expect(fetchedRobotState.robot).not.toBeUndefined();
            });

            it('RobotState has current pose', () => {
                expect(fetchedRobotState.currentPose).not.toBeUndefined();
            });

            it('RobotState has wifi strength', () => {
                expect(fetchedRobotState.wifiStrength).not.toBeUndefined();
            });

            it('RobotState has last deep charge time', () => {
                expect(fetchedRobotState.lastDeepCharge).not.toBeUndefined();
            });

            it('RobotState has id', () => {
                expect(fetchedRobotState.id).not.toBeUndefined();
            });
        });
    });

    describe('WebSocket Subscriptions', () => {
        describe('subscribeTo()', () => {
            const upstreamMessage = {
                payload: {
                    action: 'update',
                    data: {
                        battery_level: 0.05,
                        localization_weight: null,
                        robot: 'freight200',
                        current_pose: {
                            x: 2,
                            y: 3,
                            theta: 0
                        },
                        wifi_strength: 0.55,
                    }
                },
                stream: 'robot-states'
            };

            describe('When it is subscribed to a specific robot, e.g. freight200', () => {
                let robotState;
                beforeAll((done) => {
                    const handleMessage = (newRobotState) => {
                        robotState = newRobotState;
                        done();
                        RobotState.unsubscribeTo('freight200', handleMessage);
                    };

                    RobotState.subscribeTo('freight200', handleMessage);

                    // Forcing socket to emit new messages to all susbcribed channels
                    const host = `ws://${TestServer.HOST()}:${TestServer.PORT()}`;
                    const endpoint = `/api/v1/streams/robots/?token=${token}`;

                    const ws = new FetchSocket(host + endpoint, {
                        onSocketOpen: () => {
                            ws.send(JSON.stringify(upstreamMessage));
                            upstreamSocketInstances.push(ws);
                        }
                    });
                    ws.connect();
                });

                it('should receive updates for that specific robot, i.e. freight200', () => {
                    expect(robotState.robot).toBe(upstreamMessage.payload.data.robot);
                });

                it('should have updated battery level', () => {
                    expect(robotState.batteryLevel).toBe(upstreamMessage.payload.data.battery_level);
                });

                it('should have updated current pose', () => {
                    expect(robotState.currentPose.x).toBe(upstreamMessage.payload.data.current_pose.x);
                    expect(robotState.currentPose.y).toBe(upstreamMessage.payload.data.current_pose.y);
                    expect(robotState.currentPose.theta).toBe(upstreamMessage.payload.data.current_pose.theta);
                });

                it('should have updated wifi strength', () => {
                    expect(robotState.wifiStrength).toBe(upstreamMessage.payload.data.wifi_strength);
                });
            });

            describe('When it is subscribed to other robot but not freight200', () => {
                let robotState;
                beforeAll((done) => {
                    const handleMessage = (newRobotState) => {
                        robotState = newRobotState;
                        done.fail('This callback should not be called');
                    };

                    RobotState.subscribeTo('freight202', handleMessage);

                    // Forcing socket to emit new messages to all susbcribed channels
                    let streamUrl = `ws://${TestServer.HOST()}:${TestServer.PORT()}`;
                    streamUrl += `/api/v1/streams/robots/?token=${token}`;

                    const ws = new FetchSocket(streamUrl, {
                        onSocketOpen: () => {
                            ws.send(JSON.stringify(upstreamMessage));
                            upstreamSocketInstances.push(ws);
                        },
                        onSocketMessage: () => {
                            RobotState.unsubscribeTo('freight202', handleMessage);
                            done();
                        }
                    });
                    ws.connect();
                });

                it('should not receive updates for freight200', () => {
                    expect(robotState).toBeUndefined();
                });
            });
        });

        describe('subscribeToAll()', () => {
            const upstreamMessage = {
                payload: {
                    action: 'update',
                    data: {
                        battery_level: 0.85,
                        localization_weight: null,
                        robot: 'freight202',
                        current_pose: {
                            x: 5,
                            y: 5,
                            theta: 0
                        },
                        wifi_strength: 0.75,
                    }
                },
                stream: 'robot-states'
            };

            describe('When it is subscribed to all, it will always receive message whenever there is update', () => {
                let robotState;
                beforeAll((done) => {
                    const handleMessage = (newRobotState) => {
                        robotState = newRobotState;
                        RobotState.unsubscribeToAll(handleMessage);
                        done();
                    };

                    RobotState.subscribeToAll(handleMessage);

                    // Forcing socket to emit new messages to all susbcribed channels
                    let streamUrl = `ws://${TestServer.HOST()}:${TestServer.PORT()}`;
                    streamUrl += `/api/v1/streams/robots/?token=${token}`;

                    const ws = new FetchSocket(streamUrl, {
                        onSocketOpen: () => {
                            ws.send(JSON.stringify(upstreamMessage));
                            upstreamSocketInstances.push(ws);
                        }
                    });
                    ws.connect();
                });

                it('should receive a new robot state for freight202', () => {
                    expect(robotState.robot).toBe('freight202');
                });

                it('should have updated battery level', () => {
                    expect(robotState.batteryLevel).toBe(upstreamMessage.payload.data.battery_level);
                });

                it('should have updated current pose', () => {
                    expect(robotState.currentPose.x).toBe(upstreamMessage.payload.data.current_pose.x);
                    expect(robotState.currentPose.y).toBe(upstreamMessage.payload.data.current_pose.y);
                    expect(robotState.currentPose.theta).toBe(upstreamMessage.payload.data.current_pose.theta);
                });

                it('should have updated wifi strength', () => {
                    expect(robotState.wifiStrength).toBe(upstreamMessage.payload.data.wifi_strength);
                });
            });
        });
    });
});
