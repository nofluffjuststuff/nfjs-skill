const Alexa = require('ask-sdk-core');
const AplUtils = require('./AplUtils');
const HomeScreen = require('./apl/nfjsHome.json');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to No Fluff Just Stuff. Ask me about upcoming NFJS events. What do you want to know?'

    if (AplUtils.supportsAPL(handlerInput)) {
      handlerInput.responseBuilder.addDirective({
        "type": "Alexa.Presentation.APL.RenderDocument",
        "token": "nfjsHome",
        "document": HomeScreen,
        "datasources": {
            home: {
              textBlurb: 'WORLD-CLASS TRAINING FOR SOFTWARE DEVELOPERS & ARCHITECTS',
              backgroundImage: 'https://nofluffjuststuff.com/styles/nfjs2020/bg_nfjs_tour_1600.jpg'
            }
        }
      });
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('No Fluff Just Stuff', speechText)
      .addHintDirective("When is the next event?")
      .withShouldEndSession(false)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Ask me about upcoming events. For example, you can ask "When is the next event?", "Who is speaking in Boston?" or "When is the Reston show?"';

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
    const cardText = 'Thanks for asking about NFJS! Goodbye!';
    const speechText = `
    <speak>Thanks for asking about NFJS! <say-as interpret-as="interjection">Goodbye</say-as>!</speak>
    `;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('No Fluff Just Stuff', cardText)
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

module.exports={
  LaunchRequestHandler:LaunchRequestHandler,
  HelpIntentHandler:HelpIntentHandler,
  CancelAndStopIntentHandler:CancelAndStopIntentHandler,
  SessionEndedRequestHandler:SessionEndedRequestHandler,
  ErrorHandler:ErrorHandler
};
