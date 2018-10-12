const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');
const supportsDisplay = require('./DisplayHelper.js');

const WhosPresentingIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'WhosPresentingIntent';
  },
  handle(handlerInput) {
    return new Promise((resolve, reject) => {
        var nextShow = handlerInput.attributesManager.getSessionAttributes();
        if (nextShow == null) {
            resolve(handlerInput.responseBuilder.speak("I don't know which event you are are asking about. Please ask again with the event's name or location.").getResponse());
        } else {
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

                    handlerInput.responseBuilder.addRenderTemplateDirective({
                        type: 'ListTemplate1',
                        token: 'string',
                        backButton: 'HIDDEN',
                        backgroundImage: nfjsImage,
                        title: "Speaking at " + nextShow.name,
                        listItems: speakerListItems
                    });
                }

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
    });
  }
};

module.exports = WhosPresentingIntentHandler;
