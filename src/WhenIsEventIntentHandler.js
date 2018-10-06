const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');
const supportsDisplay = require('./DisplayHelper.js');

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

          if (supportsDisplay(handlerInput)) {
            const hotelImage = new Alexa.ImageHelper()
              .addImageInstance('https://nofluffjuststuff.com' + nextShow.hotelImagePath)
              .getImage();

            const primaryText = new Alexa.RichTextContentHelper()
              .withPrimaryText(speechOutput)
              .getTextContent();

            handlerInput.responseBuilder.addRenderTemplateDirective({
              type: 'BodyTemplate1',
              token: 'string',
              backButton: 'HIDDEN',
              backgroundImage: hotelImage,
              image: hotelImage,
              title: "No Fluff Just Stuff",
              textContent: primaryText
            });
          }

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

module.exports = WhenIsEventIntentHandler;
