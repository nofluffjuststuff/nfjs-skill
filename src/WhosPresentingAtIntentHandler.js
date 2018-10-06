const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');

const WhosPresentingAtIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'WhosPresentingAtIntent';
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const eventQuery = slots['eventQuery'].value;
    return new Promise((resolve, reject) => {
      NFJSClient.getNFJSData('/show/upcoming/all').then((body) => {
        var futureShows = body.filter(show => {
          var lcEventQuery = eventQuery.toLowerCase();
          var lcMetroNoSpace = show.location.metroNoSpace.toLowerCase();
          var lcMetroArea = show.location.metroArea.toLowerCase();
          var lcShowName = show.name.toLowerCase();
          return !show.canceled && (lcMetroNoSpace===lcEventQuery || lcMetroArea===lcEventQuery || lcShowName===lcEventQuery);
        });
        if (futureShows.length == 0) {
          resolve(handlerInput.responseBuilder.speak("I don't know which event you are are asking about. Please ask again with the event's name or location.").getResponse());
        } else {
          var nextShow = futureShows[0];
          NFJSClient.getNFJSData('/show/' + nextShow.id + '/show_speaker').then((body) =>{
            var names = body.map(speaker => speaker.speaker.name);
            var whosAtResponse = [names.slice(0, -1).join(', '), names.slice(-1)[0]].join(names.length < 2 ? '' : ', and ');
            var speechOutput = "The following speakers are presenting at " + nextShow.name + ": " + whosAtResponse;
            resolve(handlerInput.responseBuilder
              .speak(speechOutput)
              .withSimpleCard('No Fluff Just Stuff', whosAtResponse)
              .withShouldEndSession(false)
              .getResponse());
          }).catch((error) => {
            console.log(error);
            resolve(handlerInput.responseBuilder.speak("I'm unable to get NFJS info right now. Ask again later.").getResponse());
          });
        }
      }).catch((error) => {
        console.log(error);
        resolve(handlerInput.responseBuilder.speak("I'm unable to get NFJS info right now. Ask again later.").getResponse());
      });
    });
  }
};

module.exports = WhosPresentingAtIntentHandler;
