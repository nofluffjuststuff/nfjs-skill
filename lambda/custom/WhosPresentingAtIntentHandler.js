const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');
const supportsDisplay = require('./DisplayHelper.js');

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
          resolve(handlerInput.responseBuilder.speak("I don't know which event you are asking about. Please ask again with the event's name or location.").getResponse());
        } else {
          var nextShow = futureShows[0];
          NFJSClient.getNFJSData('/show/' + nextShow.id + '/show_speaker').then((body) =>{
            var names = body.map(speaker => speaker.speaker.name);
            var whosAtResponse = [names.slice(0, -1).join(', '), names.slice(-1)[0]].join(names.length < 2 ? '' : ', and ');
            var speechOutput = "The following speakers are presenting at " + nextShow.name + ": " + whosAtResponse;

            if (supportsDisplay(handlerInput)) {
              const nfjsImage = new Alexa.ImageHelper()
                .addImageInstance('http://www.habuma.com/nfjs/NFJS_Background.png')
                .getImage();

              const hotelImage = new Alexa.ImageHelper()
                .addImageInstance('https://nofluffjuststuff.com' + nextShow.hotelImagePath)
                .getImage();

              const primaryText = new Alexa.RichTextContentHelper()
                .withPrimaryText(speechOutput)
                .getTextContent();

              var speakerListItems = body.map(speaker => {
                console.log("SPEAKER: ", speaker)
                var speakerImage = new Alexa.ImageHelper()
                  .addImageInstance('https://nofluffjuststuff.com' + speaker.speaker.mediumImageSq)
                  .getImage();
                var speakerName = new Alexa.RichTextContentHelper()
                  .withPrimaryText(speaker.speaker.name)
                  .getTextContent();
                return {
                  "token":"string",
                  "image":speakerImage,
                  "textContent":speakerName
                };
              });

              console.log("SPEAKERS:", speakerListItems);

              var templateDirective = {
                type: 'ListTemplate1',
                token: 'string',
                backButton: 'HIDDEN',
                backgroundImage: nfjsImage,
                title: "Speaking at " + nextShow.name,
                listItems: speakerListItems
              };

              handlerInput.responseBuilder.addRenderTemplateDirective(templateDirective);
            }

            resolve(handlerInput.responseBuilder
              .speak(speechOutput)
              .withSimpleCard('No Fluff Just Stuff', whosAtResponse)
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
