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

          // put show into session to give context to future intents
          handlerInput.attributesManager.setSessionAttributes(nextShow);

          var nextEventResponse = nextShow.name + " will be held " + nextShow.shortDates + ", in " + nextShow.location.metroArea + " at " + nextShow.location.description + ".";

          if (supportsDisplay(handlerInput)) {
            const nfjsImage = new Alexa.ImageHelper()
              .addImageInstance('http://www.habuma.com/nfjs/NFJS_Background.png')
              .getImage();

            const hotelImage = new Alexa.ImageHelper()
              .addImageInstance('https://nofluffjuststuff.com' + nextShow.hotelImagePath)
              .getImage();

            const displayTemplate = `
              <b>${nextShow.name}</b><br/>
              ${nextShow.mediumDates}<br/>
              ${nextShow.location.metroArea}<br/><br/>
              <font size="2">
              ${nextShow.location.description}<br/>
              ${nextShow.location.address1}<br/>
              ${nextShow.location.city}, ${nextShow.location.stateCodeDisplay} ${nextShow.location.zip}
              </font>
            `;

            const primaryText = new Alexa.RichTextContentHelper()
              .withPrimaryText(displayTemplate)
              .getTextContent();

            handlerInput.responseBuilder.addRenderTemplateDirective({
              type: 'BodyTemplate3',
              token: 'string',
              backButton: 'HIDDEN',
              backgroundImage: nfjsImage,
              image: hotelImage,
              title: nextShow.name,
              textContent: primaryText
            });
          }

          resolve(handlerInput.responseBuilder
            .speak(nextEventResponse)
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
