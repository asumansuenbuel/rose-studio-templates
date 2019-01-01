'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

const TestServer  = require('../util/TestServer.js');
const Client      = require('../src/Client.js');
const FetchSocket = require('../src/FetchSocket.js');

const testClient = new Client();

describe('FetchSocket', () => {
    describe('Instance methods', () => {
        let token;
        beforeAll((done) => {
            testClient.configure(TestServer.HOST(), TestServer.PORT());
            testClient.authenticate('fetch', 'robotics')
            .then(() => {
                token = testClient.token;
                done();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
        });

        let ws;
        let streamData;
        describe('constructor()', () => {
            beforeAll((done) => {
                let streamUrl = `ws://${TestServer.HOST()}:${TestServer.PORT()}`;
                streamUrl += `/api/v1/streams/robots/?token=${token}`;

                const handleSocketMessage = (message) => {
                    streamData = message;
                    done();
                };

                ws = new FetchSocket(streamUrl, { onSocketMessage: handleSocketMessage });
                ws.connect();

                const robotData = {
                    password: 'robotics',
                    footprint: 'FREIGHT100',
                    configurations: ['MOBILE'],
                    name: 'freight5'
                };

                testClient.post('api/v1/robots/', robotData)
                    .then(() => {})
                    .catch((clientError) => {
                        done.fail('POST failed', clientError.toString());
                    });
            });

            afterAll((done) => {
                ws.forceClose();
                testClient.delete('api/v1/robots/', 'freight5')
                .then(() => {
                    done();
                })
                .catch((clientError) => {
                    done.fail('DELETE failed', clientError.toString());
                });
            });

            it('should open a websocket channel when it is initialized', () => {
                expect(ws).not.toBe(undefined);
            });

            it('should receive stream messages soon after it has been initialized', () => {
                expect(streamData).not.toBe(undefined);
                expect(streamData.type).toBe('message');
            });
        });
    });

    describe('Reconnect logic', () => {
        let token;
        beforeAll((done) => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
            testClient.configure(TestServer.HOST(), TestServer.PORT());
            testClient.authenticate('fetch', 'robotics')
            .then(() => {
                token = testClient.token;
                done();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
        });

        let ws;
        let connectAttemptCounter;
        let timeoutIntervals;
        describe('When it fails to connect to a stream', () => {
            beforeAll((done) => {
                connectAttemptCounter = 0;
                timeoutIntervals = [];
                const streamUrl = `ws://${TestServer.HOST()}:${1000}/api/v1/streams/robots/?token=${token}`;

                const handleSocketMessage = () => {
                    done.fail('It should not receive any message, somethng must have gone wrong');
                };

                const handleSocketOpen = () => {
                    done.fail('Socket should not open, something must have gone wrong');
                };

                const handleSocketError = (socketInstance) => {
                    timeoutIntervals.push(socketInstance.timeout);
                    connectAttemptCounter += 1;
                    if (connectAttemptCounter > 7) {
                        done();
                    }
                };

                ws = new FetchSocket(streamUrl, {
                    onSocketMessage: handleSocketMessage,
                    onSocketError: handleSocketError,
                    onSocketOpen: handleSocketOpen
                });

                ws.connect();
            });

            afterAll(() => {
                ws.forceClose();
            });

            it('should make at least 7 attempts to reconnect', () => {
                expect(connectAttemptCounter).toBeGreaterThan(7);
            });

            it('should maximize its wait interval for reconnect at 8 seconds', () => {
                expect(timeoutIntervals[timeoutIntervals.length - 1]).toBe(8000);
            });

            it('should begin with 500ms as first time out interval', () => {
                expect(timeoutIntervals[0]).toBe(500);
            });

            it('should proceed to 1000ms as the second time out interval', () => {
                expect(timeoutIntervals[1]).toBe(1000);
            });

            it('should proceed to 2000ms as the third time out interval', () => {
                expect(timeoutIntervals[2]).toBe(2000);
            });

            it('should proceed to 4000ms as the fourth time out interval', () => {
                expect(timeoutIntervals[3]).toBe(4000);
            });

            it('should proceed to 8000ms as the fifth time out interval', () => {
                expect(timeoutIntervals[4]).toBe(8000);
            });
        });
    });
});
