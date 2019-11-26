const nock = require('nock');
const nfjsEventResponse = require('./nfjsEventResponse');

module.exports = {
    onRequest: (test, requestEnvelope) => {
        nock('https://nofluffjuststuff.com')
            .get('/n/data/show/upcoming/all')
            .reply(200, nfjsEventResponse);

        nock('https://nofluffjuststuff.com')
            .get('/n/data/show/490/show_speaker')
            .reply(500, {});
    }
};
