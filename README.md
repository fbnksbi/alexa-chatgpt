# Alexa Skill with ChatGPT

This repository contains an example of how to use OpenAI's APIs to create an Alexa Skill powered by ChatGPT.

## How it works

This code connects to the OpenAI ChatGPT API and sends Alexa's questions to the model, which processes them and returns the answers. Then, these responses are transmitted back to Alexa and presented to the user.

## Configuration

You will need to obtain an API key from OpenAI to use the ChatGPT model. More information on how to do this can be found in the OpenAI API documentation.

Set your API key as an environment variable in Lambda: `OPENAI_API_KEY`. Do not hardcode secrets in source files.

## Running the example

This example was developed using Amazon's ASK CLI. To run it, you will need to install the ASK CLI and configure your Amazon Developer account.

Once configured, simply run the following commands in the terminal:

```
ask init
ask deploy
```

This will deploy your Skill to your Amazon Developer account and make it available for use with Alexa.

## Final considerations

This is just a basic example of how to use ChatGPT with Alexa. You can expand this implementation to create more complex and personalized skills. Enjoy!


## AI provider configuration

The skill now supports provider abstraction via `AI_PROVIDER`:

- `AI_PROVIDER=responses` (default): calls OpenAI Responses API directly with `OPENAI_API_KEY`.
- `AI_PROVIDER=realtime2`: routes requests through your Realtime 2 broker endpoint.

Environment variables:

- `OPENAI_API_KEY` (required for `responses`)
- `OPENAI_MODEL` (optional, default: `gpt-4o-mini`)
- `OPENAI_TIMEOUT_MS` (optional, default: `12000`)
- `AI_PROVIDER` (`responses` or `realtime2`)
- `REALTIME2_BROKER_URL` (required for `realtime2`)
- `REALTIME2_BROKER_API_KEY` (optional bearer token for broker auth)

This is the first implementation step of the Realtime 2 rollout plan: model access is now behind a provider abstraction so you can switch to broker-backed Realtime 2 without changing Alexa handlers.
