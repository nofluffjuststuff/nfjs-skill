const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');
const NEXT_EVENT_MESSAGE = "The next No Fluff Just Stuff event is ";
const AplUtils = require('./AplUtils');
const EventScreen = require('./apl/nfjsEvent.json');

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
        var nextEventResponse = NEXT_EVENT_MESSAGE + nextShow.name + ", " + nextShow.shortDates + ", in " + nextShow.location.metroArea + ".";

        if (AplUtils.supportsAPL(handlerInput)) {
          handlerInput.responseBuilder.addDirective({
            "type": "Alexa.Presentation.APL.RenderDocument",
            "token": "nfjsEvent",
            "document": EventScreen,
            "datasources": {
                event: {
                  backgroundImage: 'https://nofluffjuststuff.com/styles/nfjs2020/bg_nfjs_tour_1600.jpg',
                  eventName: nextShow.name,
                  venueImage: nextShow.hotelImageURL,
                  eventDate: nextShow.mediumDates,
                  venueAddress: `${nextShow.location.description}<br/>
                  ${nextShow.location.address1}<br/>
                  ${nextShow.location.city}, ${nextShow.location.stateCodeDisplay} ${nextShow.location.zip}`
                }
            }
          });
        }

        resolve(handlerInput.responseBuilder
          .speak(nextEventResponse)
          .withSimpleCard('No Fluff Just Stuff', nextEventResponse)
          .getResponse());
      }).catch((error) => {
        console.log(error);
        resolve(handlerInput.responseBuilder.speak("I'm unable to get NFJS info right now. Ask again later.").getResponse());
      });
    })
  }
};

module.exports=NextEventIntentHandler;
