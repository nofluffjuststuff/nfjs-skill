const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');
const AplUtils = require('./AplUtils');
const EventScreen = require('./apl/nfjsEvent.json');

const WhenIsEventIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'WhenIsEventIntent';
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const eventQuery = slots['eventLoc'].value;
    return new Promise((resolve, reject) => {
      NFJSClient.getNFJSData('/show/upcoming/all').then((body) => {
        var futureShows = body.filter(show => {
          var lcEventQuery = eventQuery.toLowerCase();
          var lcMetroNoSpace = show.location.metro.toLowerCase();
          var lcMetroArea = show.location.metroArea.toLowerCase();
          var lcShowName = show.name.toLowerCase();
          return !show.canceled && (lcMetroNoSpace===lcEventQuery || lcMetroArea===lcEventQuery || lcShowName===lcEventQuery);
        });
        if (futureShows.length == 0) {
          resolve(handlerInput.responseBuilder.speak("I don't know which event you are asking about. Please ask again with the event's name or location.").getResponse());
        } else {
          var nextShow = futureShows[0];
          var nextEventResponse = nextShow.name + " will be held " + nextShow.shortDates + ", in " + nextShow.location.metroArea + " at " + nextShow.location.description + ".";

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
        }
      }).catch((error) => {
        console.log(error);
        resolve(handlerInput.responseBuilder.speak("I'm unable to get NFJS info right now. Ask again later.").getResponse());
      });
    });
  }
};

module.exports = WhenIsEventIntentHandler;
