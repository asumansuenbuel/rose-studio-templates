// 'use strict';
//
// // Copyright 2017 Fetch Robotics, Inc.
// // Author(s): Calvin Feng
//
// const TestServer = require('../../../util/TestServer.js');
//
// const FetchcoreClient = require('../../../src/FetchcoreClient.js');
// const Pose = require('../../../src/resources/annotations/Pose.js');
//
// describe('Pose', () => {
//     describe('Static methods', () => {
//         beforeAll((done) => {
//             const client = FetchcoreClient.defaultClient();
//             client.configure(TestServer.HOST(), TestServer.PORT());
//             client.authenticate('fetch', 'robotics')
//             .then(() => {
//                 done();
//             })
//             .catch((clientError) => {
//                 done.fail(clientError.toString());
//             });
//         });
//
//         describe('Static method', () => {
//             it('should do something silly', () => {
//                 expect(1).toBe(1);
//             });
//         });
//
//         describe('Instance methods', () => {
//             describe('constructor()', () => {
//                 const mockProps = {
//                     x: 1,
//                     y: 1,
//                     theta: 0
//                 };
//                 const newPose = new Pose(mockProps);
//
//                 it('should initialize default properties for a pose', () => {
//                     expect(newPose.persistedProps).not.toBe(undefined);
//                 });
//             });
//
//             describe('getters', () => {
//
//             });
//         });
//     });
// });
