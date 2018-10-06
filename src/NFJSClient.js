const request = require('request');
const NFJS_DATA_BASE = 'https://nofluffjuststuff.com/n/data';

const NFJSClient = {
  getNFJSData(path) {
    return new Promise((resolve, reject)=>{
      request(NFJS_DATA_BASE + path, { json: true }, function (error, response, body) {
        if (error) throw new Error(error);
        return resolve(body);
      });
    });
  }
}

module.exports = NFJSClient;
