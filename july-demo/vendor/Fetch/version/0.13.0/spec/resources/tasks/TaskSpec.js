'use strict';

// Copyright 2017 Fetch Robotics, Inc.
// Author(s): Calvin Feng

const TestServer      = require('../../../util/TestServer.js');
const FetchcoreClient = require('../../../src/FetchcoreClient.js');
const Task            = require('../../../src/resources/tasks/Task.js');
const Robot           = require('../../../src/resources/robots/Robot.js');


describe('Task', () => {
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

    let taskId;
    describe('Instance methods', () => {
        beforeAll((done) => {
            const freight400 = new Robot({ name: 'freight400' });
            freight400.save('robotics')
                .then(() => {
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
        });

        const newTask = new Task();
        describe('constructor()', () => {
            it('should be a new task by default', () => {
                expect(newTask.status).toBe('NEW');
                expect(newTask.isNew()).toBeTruthy();
            });
        });

        newTask.robot = 'freight400';
        newTask.type = 'SIM';
        newTask.name = 'Fake Task';

        let savedTask;
        describe('save()', () => {
            it('should persist the Task resource object to database', (done) => {
                newTask.save()
                    .then((task) => {
                        expect(task.id).not.toBeUndefined();
                        savedTask = task;
                        taskId = task.id;
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });
        });

        describe('update()', () => {
            it('should submit a PATCH request and update task based on new props', (done) => {
                savedTask.status = 'WORKING';
                savedTask.update()
                    .then((updatedTask) => {
                        expect(updatedTask.status).toBe('WORKING');
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });
        });

        describe('getters and setters', () => {
            it('can get and set status()', () => {
                expect(savedTask.status).toBe('WORKING');
                savedTask.status = 'COMPLETE';
                expect(savedTask.status).toBe('COMPLETE');
            });

            it('can get modified()', () => {
                expect(savedTask.modified).not.toBeUndefined();
            });

            it('can get and set name()', () => {
                expect(savedTask.name).toBe('Fake Task');
                savedTask.name = 'Mock Task';
                expect(savedTask.name).toBe('Mock Task');
            });

            it('can get and set parent()', () => {
                expect(savedTask.parent).not.toBeUndefined();
                savedTask.parent = 'Maybe another task';
                expect(savedTask.parent).toBe('Maybe another task');
            });

            it('can get created()', () => {
                expect(savedTask.created).not.toBeUndefined();
            });

            it('can get and set taskTemplate()', () => {
                expect(savedTask.taskTemplate).not.toBeUndefined();
                savedTask.taskTemplate = 'Template';
                expect(savedTask.taskTemplate).toBe('Template');
            });

            it('can get and set schedule()', () => {
                expect(savedTask.schedule).not.toBeUndefined();
                savedTask.schedule = 'Schedule';
                expect(savedTask.schedule).toBe('Schedule');
            });

            it('can get and set robot()', () => {
                expect(savedTask.robot).toBe('freight400');
                savedTask.robot = 'freight401';
                expect(savedTask.robot).toBe('freight401');
            });

            it('can get and set actions()', () => {
                expect(savedTask.actions.constructor).toBe(Array);
                savedTask.actions = ['Hello', 'World'];
                expect(savedTask.actions[0]).toBe('Hello');
                expect(savedTask.actions[1]).toBe('World');
            });

            it('can get id()', () => {
                expect(savedTask.id).not.toBeUndefined();
            });

            it('can get and set requester()', () => {
                expect(savedTask.requester).not.toBeUndefined();
                savedTask.requester = 'Calvin';
                expect(savedTask.requester).toBe('Calvin');
            });

            it('can get and set type()', () => {
                expect(savedTask.type).toBe('SIM');
                savedTask.type = 'MIS';
                expect(savedTask.type).toBe('MIS');
            });

            it('can get and set children()', () => {
                expect(savedTask.children.constructor).toBe(Array);
                savedTask.children = ['Hello', 'World'];
                expect(savedTask.children[0]).toBe('Hello');
                expect(savedTask.children[1]).toBe('World');
            });
        });
    });

    describe('Static methods', () => {
        beforeAll((done) => {
            const freight401 = new Robot({ name: 'freight401' });
            freight401.save('robotics')
                .then(() => {
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
        });

        describe('get()', () => {
            it('should fetch task data from server and return a Task resource object', (done) => {
                Task.get(taskId)
                    .then((task) => {
                        expect(task.id).toBe(taskId);
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });
        });

        describe('all()', () => {
            it('should fetch task data from server and return a list of Task resource objects', (done) => {
                Task.all()
                    .then((taskList) => {
                        expect(taskList.constructor).toBe(Array);
                        expect(taskList[0].id).toBe(taskId);
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });
        });

        describe('allForRobot()', () => {
            it('should fetch tasks that are assigned to freight400', (done) => {
                Task.allForRobot('freight400')
                    .then((taskList) => {
                        expect(taskList.constructor).toBe(Array);
                        expect(taskList.length).toBe(1);
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });

            it('should not fetch any tasks for freight401 because there are not any assigned to it', (done) => {
                Task.allForRobot('freight401')
                    .then((taskList) => {
                        expect(taskList.constructor).toBe(Array);
                        expect(taskList.length).toBe(0);
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });
        });

        describe('getWorkingTaskForRobot', () => {
            it('should fetch an array of task with size one when we call it with freight400 as argument', (done) => {
                Task.getWorkingTaskForRobot('freight400')
                    .then((taskList) => {
                        expect(taskList.constructor).toBe(Array);
                        expect(taskList.length).toBe(1);
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });

            it('should fetch an array of task with size zero when we call it with freight401 as argument', (done) => {
                Task.getWorkingTaskForRobot('freight401')
                    .then((taskList) => {
                        expect(taskList.constructor).toBe(Array);
                        expect(taskList.length).toBe(0);
                        done();
                    })
                    .catch((clientError) => {
                        done.fail(clientError.toString());
                    });
            });
        });
    });

    describe('WebSocket Subscriptions', () => {
        beforeAll((done) => {
            const freight402 = new Robot({ name: 'freight402' });
            freight402.save('robotics')
                .then(() => {
                    done();
                })
                .catch((clientError) => {
                    done.fail(clientError.toString());
                });
        });

        describe('subscribeTo()', () => {
            describe('When task stream is subscribed to a specific robot, e.g. freight402', () => {
                let task;
                beforeAll((done) => {
                    const handleMessage = (taskFromStream) => {
                        task = taskFromStream;
                        done();
                        Task.unsubscribeTo('freight402', handleMessage);
                    };

                    Task.subscribeTo('freight402', handleMessage);

                    const newTaskForFreight402 = new Task();
                    newTaskForFreight402.robot = 'freight402';
                    newTaskForFreight402.type = 'SIM';
                    newTaskForFreight402.name = 'Task for freight402';
                    newTaskForFreight402.save()
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                it('should receive updates for that specific robot, i.e. freight402', () => {
                    expect(task.robot).toBe('freight402');
                });
            });

            describe('When task stream is subscribed to other robot, i.e. not freight402', () => {
                let task;
                beforeAll((done) => {
                    const handleMessage = (taskFromStream) => {
                        task = taskFromStream;
                        done.fail('This robot should not receive update from task stream');
                        Task.unsubscribeTo('freight400', handleMessage);
                    };

                    Task.subscribeTo('freight400', handleMessage);

                    const newTaskForFreight402 = new Task();
                    newTaskForFreight402.robot = 'freight402';
                    newTaskForFreight402.type = 'SIM';
                    newTaskForFreight402.name = 'Task for freight402';

                    newTaskForFreight402.save()
                        .then(() => {
                            done();
                            Task.unsubscribeTo('freight400', handleMessage);
                        })
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                it('should not receive updates for freight402', () => {
                    expect(task).toBeUndefined();
                });
            });
        });

        describe('subscribeToAll', () => {
            describe('When task stream is subscribed to all robots', () => {
                let task;
                beforeAll((done) => {
                    const handleMessage = (taskFromStream) => {
                        task = taskFromStream;
                        Task.unsubscribeToAll(handleMessage);
                        done();
                    };

                    Task.subscribeToAll(handleMessage);

                    const newTaskForFreight202 = new Task();
                    newTaskForFreight202.robot = 'freight202';
                    newTaskForFreight202.type = 'SIM';
                    newTaskForFreight202.name = 'Task for freight202';

                    newTaskForFreight202.save()
                        .catch((clientError) => {
                            done.fail(clientError.toString());
                        });
                });

                it('should receive updates for tasks from any robot', () => {
                    expect(task.robot).toBe('freight202');
                    expect(task.name).toBe('Task for freight202');
                });
            });
        });
    });
});
