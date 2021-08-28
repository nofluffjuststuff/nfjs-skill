const Alexa = require('ask-sdk-core');
const NextEventIntentHandler = require('./NextEventIntentHandler');
const WhenIsEventIntentHandler = require('./WhenIsEventIntentHandler');
const WhosPresentingAtIntentHandler = require('./WhosPresentingAtIntentHandler');
const StandardHandlers = require('./StandardHandlers');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    StandardHandlers.LaunchRequestHandler,
    NextEventIntentHandler,
    WhosPresentingAtIntentHandler,
    WhenIsEventIntentHandler,
    StandardHandlers.HelpIntentHandler,
    StandardHandlers.CancelAndStopIntentHandler,
    StandardHandlers.SessionEndedRequestHandler)
  .addErrorHandlers(StandardHandlers.ErrorHandler)
  .lambda();
