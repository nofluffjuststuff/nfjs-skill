const nock = require('nock');

module.exports = {
    onRequest: (test, requestEnvelope) => {
        nock('https://nofluffjuststuff.com')
            .get('/n/data/show/upcoming/all')
            .reply(500, {});
    }
};

