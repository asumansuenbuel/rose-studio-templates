'use strict';

/**
 * @copyright 2017 Fetch Robotics, Inc
 * @author Calvin Feng
 */

const spawn = require('child_process').spawn;
const path = require('path');

/*  eslint no-console: 0*/

/**
 * @class TestServer
 * @classdesc TestServer spawns child process to execute Django test server startup
 */
class TestServer {

    static PATH() {
        return path.join(path.dirname(__filename), '..', '..', '..', 'server');
    }

    static PORT() {
        return 8888;
    }

    static HOST() {
        return 'localhost';
    }

    constructor() {
        this.args = [
            'manage.py',
            'testserver',
            'empty',
            '--noinput',
            '--addrport',
            TestServer.PORT()
        ];
        this.isReady = false;
    }

    start(onServerStart) {
        this.childProcess = spawn('python', this.args, { cwd: TestServer.PATH() });

        // NOTE: Node seems to identify Django output as stderr messages
        // TODO: childProcess.stdout.on('data') may have some use but as of now, no.

        this.childProcess.stderr.on('data', (data) => {
            if (data.includes('Listening on endpoint')) {
                this.isReady = true;
                const readyString = 'Test server has started, and is listening on endpoint:';
                const endpoint = `${TestServer.HOST()}:${TestServer.PORT()}`;
                console.log(readyString, endpoint);
                onServerStart();
            } else if (data.includes('ImportError')) {
                console.error(`Error: ${data}`);
                console.error('Cannot start TestServer!');
                console.error('Did you install all the dependencies for the Django server?! \n');
            }
        });

        this.childProcess.on('close', this.onClose);
        this.childProcess.on('error', this.onError);
    }

    kill() {
        this.childProcess.kill();
    }

    onClose(code) {
        this.isReady = false;
        const processExit = `Child process exited with ${code} code:`;
        const serverShutdown = `Test server ${TestServer.HOST()}:${TestServer.PORT()} is shutting down`;
        console.log(processExit, serverShutdown);
    }

    onError(error) {
        this.isReady = false;
        console.log('Error:', error);
    }
}

module.exports = TestServer;
