const Alexa = require("ask-sdk-core");
const { ask, getProvider } = require("./aiClient");


function formatString(text) {
  return text.replace(/\n+/g, " ");
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  async handle(handlerInput) {
    const response =
      'Bem-vindo ao ChatGPT. Você pode perguntar algo como "chat qual a capital da França?"';

    return handlerInput.responseBuilder.speak(response).getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AskToGPTIntent"
    );
  },
  async handle(handlerInput) {
    const question = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "question"
    );

    try {
      const responseFromGPT = await ask(question, {
        sessionId: handlerInput.requestEnvelope.session?.sessionId,
        locale: handlerInput.requestEnvelope.request?.locale,
        userId: handlerInput.requestEnvelope.context?.System?.user?.userId,
      });
      const formattedResponse = formatString(responseFromGPT);

      return handlerInput.responseBuilder
        .speak(formattedResponse || "Desculpe, estou sem resposta no momento.")
        .getResponse();
    } catch (error) {
      console.error("AI provider request failed", error?.response?.data || error?.message || error);

      return handlerInput.responseBuilder
        .speak("Desculpe, não consegui responder agora. Tente novamente em instantes.")
        .getResponse();
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Você pode perguntar algo como 'chat ideia de nome para bebes'";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Até mais!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Desculpe, não tenho conhecimento sobre isso. Por favor, tente novamente.";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = `Que tal me perguntar algo como 'quanto está o dólar hoje?'`;

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const speakOutput =
      "Desculpe, parece que tivemos um problema aqui! Acesse github.com/joao208/alexa-chatgpt para mais informações.";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
