const Alexa = require('ask-sdk-core');
const request = require('request');

const NEXT_EVENT_MESSAGE = "The next No Fluff Just Stuff event is ";

const NFJS_DATA_BASE = 'https://nofluffjuststuff.com/n/data';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to No Fluff Just Stuff. Ask me about upcoming NFJS events.'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const NextEventIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'NextEventIntent';
  },
  handle(handlerInput) {
    return new Promise((resolve, reject) => {
      getNFJSData('/show/upcoming/all').then((body) => {
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

const WhenIsEventIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'WhenIsEventIntent';
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const eventQuery = slots['eventLoc'].value;
    return new Promise((resolve, reject) => {
      getNFJSData('/show/upcoming/all').then((body) => {
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
          var nextShowName = nextShow.name;
          var nextShowDates = nextShow.shortDates
          var nextShowLoc = nextShow.location.metroArea;
          var nextShowVenue = nextShow.location.description;
          var nextEventResponse = nextShowName + " will be held " + nextShowDates + ", in " + nextShowLoc + " at " + nextShowVenue + ".";
          var speechOutput = nextEventResponse;

          resolve(handlerInput.responseBuilder
            .speak(speechOutput)
            .withSimpleCard('No Fluff Just Stuff', nextEventResponse)
            .withShouldEndSession(false)
            .getResponse());
        }
      }).catch((error) => {
        console.log(error);
        resolve(handlerInput.responseBuilder.speak("I'm unable to get NFJS info right now. Ask again later.").getResponse());
      });
    });
  }
};

const WhosPresentingAtIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'WhosPresentingAtIntent';
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const eventQuery = slots['eventQuery'].value;
    return new Promise((resolve, reject) => {
      getNFJSData('/show/upcoming/all').then((body) => {
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
          getNFJSData('/show/' + nextShow.id + '/show_speaker').then((body) =>{
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

// helper function
function getNFJSData(path){
  return new Promise((resolve, reject)=>{
    request(NFJS_DATA_BASE + path, { json: true }, function (error, response, body) {
      if (error) throw new Error(error);
      return resolve(body);
    });
  });
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Ask me about upcoming events. For example, say "When is the next event?"';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('No Fluff Just Stuff', speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('No Fluff Just Stuff', speechText)
      .getResponse();
  }
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I don\'t understand your question. Please ask again.')
      .reprompt('Sorry, I don\'t understand your question. Please ask again.')
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    NextEventIntentHandler,
    WhosPresentingAtIntentHandler,
    WhenIsEventIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)
  .addErrorHandlers(ErrorHandler)
  .lambda();
