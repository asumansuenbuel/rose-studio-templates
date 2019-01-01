/**
 * @copyright 2017 Fetch Robotics, Inc.
 * @author Nadir Muzaffar
 */

// Thirdparty
const randomstring = require('randomstring');
const os = require('os');

const TestServer = require('../../../util/TestServer');
const FetchcoreClient = require('../../../src/FetchcoreClient');
const HMISettings = require('../../../src/resources/settings/HMISettings');

describe('HMISettings', () => {
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

    it('should get default value already stored on server', (done) => {
        HMISettings.get()
            .then((hmiSettings) => {
                expect(hmiSettings.defaultURL).toBe('http://' + os.hostname() + ':8000/hmi/');
                done();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
    });

    it('should allow user to save HMISettings without loading it first', (done) => {
        const domain = randomstring.generate();
        const hmiSettings = new HMISettings({ defaultURL: `https://www.${domain}.com` });
        hmiSettings.save()
            .then((savedHMISettings) => {
                expect(savedHMISettings.defaultURL).toBe(`https://www.${domain}.com`);
                done();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
    });

    it('should allow user to update HMISettings without loading it first', (done) => {
        const domain = randomstring.generate();
        const hmiSettings = new HMISettings({ defaultURL: `https://www.${domain}.com` });
        hmiSettings.update()
            .then((savedHMISettings) => {
                expect(savedHMISettings.defaultURL).toBe(`https://www.${domain}.com`);
                done();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
    });

    it('should allow user to load then save HMISettings through props', (done) => {
        const domain = randomstring.generate();
        HMISettings.get()
            .then((hmiSettings) => {
                hmiSettings.defaultURL = `https://www.${domain}.com`;
                return hmiSettings.save();
            })
            .then((savedHMISettings) => {
                expect(savedHMISettings.defaultURL).toBe(`https://www.${domain}.com`);
                done();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
    });

    it('should allow user to load then update HMISettings through props', (done) => {
        const domain = randomstring.generate();
        HMISettings.get()
            .then((hmiSettings) => {
                hmiSettings.defaultURL = `https://www.${domain}.com`;
                return hmiSettings.update();
            })
            .then((savedHMISettings) => {
                expect(savedHMISettings.defaultURL).toBe(`https://www.${domain}.com`);
                done();
            })
            .catch((clientError) => {
                done.fail(clientError.toString());
            });
    });

    it('should fail when user to tries to update HMISettings with invalid url', (done) => {
        const hmiSettings = new HMISettings({ defaultURL: 'invalid_url' });
        hmiSettings.update()
            .then((savedHMISettings) => {
                done.fail(`Server did not give expected error when setting invalid_url ${savedHMISettings.defaultURL}`);
            })
            .catch(() => {
                done();
            });
    });
});
