const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');
const supportsDisplay = require('./DisplayHelper.js');
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

        if (supportsDisplay(handlerInput)) {
          const nfjsImage = new Alexa.ImageHelper()
            .addImageInstance('https://nofluffjuststuff.com/styles/nfjs2018/nfjs_logo.svg')
            .getImage();

          const hotelImage = new Alexa.ImageHelper()
            .addImageInstance('https://nofluffjuststuff.com' + nextShow.hotelImagePath)
            .getImage();

          const primaryText = new Alexa.RichTextContentHelper()
            .withPrimaryText(speechOutput)
            .getTextContent();

          handlerInput.responseBuilder.addRenderTemplateDirective({
            type: 'BodyTemplate3',
            token: 'string',
            backButton: 'HIDDEN',
            backgroundImage: nfjsImage,
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
      }).catch((error) => {
        console.log(error);
        resolve(handlerInput.responseBuilder.speak("I'm unable to get NFJS info right now. Ask again later.").getResponse());
      });
    });
  }
};

module.exports=NextEventIntentHandler;
