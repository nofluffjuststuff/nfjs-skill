const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');
const NEXT_EVENT_MESSAGE = "The next No Fluff Just Stuff event is ";

const NextEventIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'NextEventIntent';
  },
  handle(handlerInput) {
    return new Promise((resolve, reject) => {
      NFJSClient.getNFJSData('/show/upcoming/all').then((body) => {
        var futureShows = body.filter(show => !show.canceled);
        var nextShow = futureShows[0];
        var nextShowName = nextShow.name;
        var nextShowDates = nextShow.shortDates
        var nextShowLoc = nextShow.location.metroArea;
        var nextEventResponse = nextShowName + ", " + nextShowDates + ", in " + nextShowLoc + ".";
        var speechOutput = NEXT_EVENT_MESSAGE + nextEventResponse;

        resolve(handlerInput.responseBuilder
          .speak(speechOutput)
          .withSimpleCard('No Fluff Just Stuff', nextEventResponse)
          .withShouldEndSession(false)
          .getResponse());
      }).catch((error) => {
        resolve(handlerInput.responseBuilder.speak("I'm unable to get NFJS info right now. Ask again later.").getResponse());
      });
    });
  }
};

module.exports=NextEventIntentHandler;
