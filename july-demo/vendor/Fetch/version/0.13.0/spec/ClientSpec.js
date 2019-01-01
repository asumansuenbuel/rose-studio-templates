'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

const TestServer = require('../util/TestServer.js');
const Client     = require('../src/Client.js');

const testClient = new Client();

describe('Synchronous', () => {
    describe('Client', () => {
        describe('Instance methods', () => {
            beforeAll(() => {
                testClient.configure(TestServer.HOST(), TestServer.PORT());
            });

            describe('configure()', () => {
                it('should point to localhost as test server', () => {
                    expect(testClient.hostname).toBe('localhost');
                });


                it('should point to 8888 for test server port number', () => {
                    expect(testClient.port).toBe(8888);
                });
            });
        });

        describe('Static methods', () => {
            describe('AUTH_ENDPOINT()', () => {
                it('should return the API endpoint for authentication', () => {
                    expect(Client.AUTH_ENDPOINT).toBe('api/v1/auth/login');
                });
            });

            describe('parseURL()', () => {
                it('should parse URL into proper format', () => {
                    expect(Client.parseURL('/robots/', 'freight5')).toBe('/robots/freight5/');
                    expect(Client.parseURL('/robots/')).toBe('/robots/');
                });
            });
        });
    });
});

describe('Asynchronous', () => {
    describe('Client', () => {
        describe('Instance methods', () => {
            beforeAll((done) => {
                testClient.configure(TestServer.HOST(), TestServer.PORT());
                testClient.authenticate('fetch', 'robotics')
                .then(() => {
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
            });

            describe('authenticate()', () => {
                it('should receive an auth token after successful authentication', () => {
                    expect(testClient.token).not.toBe(undefined);
                    expect(typeof testClient.token).toBe('string');
                });

                it('should show if is authenticated', () => {
                    expect(testClient.isAuthenticated).not.toBe(undefined);
                    expect(typeof testClient.isAuthenticated).toBe('boolean');
                });

                const endpoint = '/api/v1/streams/robots/';
                it('should be able to parse stream url correctly upon receiving token', () => {
                    expect(testClient.getStreamUrl(endpoint))
                    .toBe(`ws://localhost:8888/api/v1/streams/robots/?token=${testClient.token}`);
                });
            });

            describe('get()', () => {
                let results;
                beforeAll((done) => {
                    testClient.get('api/v1/robots/')
                    .then((res) => {
                        results = res.data.results;
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
                });

                it('should submit a GET request to server and receive results in response', () => {
                    expect(results).not.toBe(undefined);
                    expect(typeof results).toBe('object');
                });
            });

            describe('post()', () => {
                let footprint;
                let isPostSuccessful = false;

                const robotData = {
                    password: 'robotics',
                    footprint: 'FREIGHT100',
                    configurations: ['MOBILE'],
                    name: 'freight1'
                };

                beforeAll((done) => {
                    testClient.post('api/v1/robots/', robotData)
                    .then((res) => {
                        isPostSuccessful = true;
                        footprint = res.data.footprint;
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
                });

                it('should submit a POST request to server', () => {
                    expect(isPostSuccessful).toBeTruthy();
                    expect(footprint).toBe('FREIGHT100');
                });
            });

            describe('put()', () => {
                let footprint;
                let isPutSuccessful = false;

                const newRobotData = {
                    footprint: 'HMI15',
                    configurations: ['MOBILE', 'HMI']
                };

                beforeAll((done) => {
                    testClient.put('api/v1/robots/', 'freight1', newRobotData)
                    .then((res) => {
                        isPutSuccessful = true;
                        footprint = res.data.footprint;
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
                });

                it('should submit a PUT request to server and update data', () => {
                    expect(isPutSuccessful).toBeTruthy();
                    expect(footprint).not.toBe(undefined);
                    expect(footprint).toBe('HMI15');
                });
            });

            describe('delete()', () => {
                let isDeleteSuccessful = false;

                const robotName = 'freight1';

                beforeAll((done) => {
                    testClient.delete('api/v1/robots/', robotName)
                    .then(() => {
                        isDeleteSuccessful = true;
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
                });

                it('should submit a DELETE request to server', () => {
                    expect(isDeleteSuccessful).toBeTruthy();
                });
            });
        });
    });
});
