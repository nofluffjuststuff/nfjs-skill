const Alexa = require('ask-sdk-core');
const NFJSClient = require('./NFJSClient');
const AplUtils = require('./AplUtils');
const EventSpeakers = require('./apl/eventSpeakers.json');

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
          var lcMetroNoSpace = show.location.metro.toLowerCase();
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
            if (AplUtils.supportsAPL(handlerInput)) {
              var speakerListItems = body.map(speaker => {
                const speakerImage = speaker.speaker.images[0].mediumImageURL;
                const speakerName = speaker.speaker.name;
                return {
                  "primaryText":speakerName,
                  "imageSource":speakerImage
                };
              });

              handlerInput.responseBuilder.addDirective({
                "type": "Alexa.Presentation.APL.RenderDocument",
                "token": "eventSpeakers",
                "document": EventSpeakers,
                "datasources": {
                    speakers: {
                      backgroundImage: 'https://nofluffjuststuff.com/styles/nfjs2020/bg_nfjs_tour_1600.jpg',
                      eventName: nextShow.name,
                      speakerList: speakerListItems
                    }
                }
              });
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
