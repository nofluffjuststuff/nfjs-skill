const Alexa = require('ask-sdk-core');
const supportsDisplay = require('./DisplayHelper.js');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to No Fluff Just Stuff. Ask me about upcoming NFJS events.'

    if (supportsDisplay(handlerInput)) {
      const nfjsImage = new Alexa.ImageHelper()
        .addImageInstance('http://www.habuma.com/nfjs/NFJS_Title.png')
        .getImage();

      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText("No Fluff Just Stuff")
        .getTextContent();

      handlerInput.responseBuilder.addRenderTemplateDirective({
        type: 'BodyTemplate6',
        token: 'string',
        backButton: 'HIDDEN',
        backgroundImage: nfjsImage,
        textContent: primaryText
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
    const speechText = `
    <speak>Thanks for asking about NFJS! <say-as interpret-as="interjection">Goodbye</say-as>!</speak>
    `;

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

module.exports={
  LaunchRequestHandler:LaunchRequestHandler,
  HelpIntentHandler:HelpIntentHandler,
  CancelAndStopIntentHandler:CancelAndStopIntentHandler,
  SessionEndedRequestHandler:SessionEndedRequestHandler,
  ErrorHandler:ErrorHandler
};
