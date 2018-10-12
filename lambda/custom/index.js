const Alexa = require('ask-sdk-core');
const NextEventIntentHandler = require('./NextEventIntentHandler');
const WhenIsEventIntentHandler = require('./WhenIsEventIntentHandler');
const WhosPresentingAtIntentHandler = require('./WhosPresentingAtIntentHandler');
const WhoIsPresentingIntentHandler = require('./WhoIsPresentingIntentHandler');
const StandardHandlers = require('./StandardHandlers');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    StandardHandlers.LaunchRequestHandler,
    NextEventIntentHandler,
    WhosPresentingAtIntentHandler,
    WhenIsEventIntentHandler,
    WhoIsPresentingIntentHandler,
    StandardHandlers.HelpIntentHandler,
    StandardHandlers.CancelAndStopIntentHandler,
    StandardHandlers.SessionEndedRequestHandler)
  .addErrorHandlers(StandardHandlers.ErrorHandler)
  .lambda();
