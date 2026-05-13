const axios = require("axios");

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 12000);

function getProvider() {
  return (process.env.AI_PROVIDER || "responses").toLowerCase();
}

async function askWithResponses(prompt) {
  const response = await axios.post(
    OPENAI_RESPONSES_URL,
    {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: prompt,
      max_output_tokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 150),
      temperature: Number(process.env.OPENAI_TEMPERATURE || 0.5),
    },
    {
      timeout: OPENAI_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  const output = response.data.output || [];
  const outputText = output
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text" && content.text)
    .map((content) => content.text)
    .join(" ")
    .trim();

  if (outputText) return outputText;
  return response.data.choices?.[0]?.text || "";
}

async function askWithRealtime2Broker(prompt, context = {}) {
  const brokerUrl = process.env.REALTIME2_BROKER_URL;
  if (!brokerUrl) {
    throw new Error("AI_PROVIDER=realtime2 requires REALTIME2_BROKER_URL");
  }

  const response = await axios.post(
    brokerUrl,
    {
      input_text: prompt,
      session: {
        session_id: context.sessionId,
        user_id: context.userId,
        locale: context.locale,
      },
      metadata: {
        source: "alexa-skill",
      },
    },
    {
      timeout: OPENAI_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        ...(process.env.REALTIME2_BROKER_API_KEY
          ? { Authorization: `Bearer ${process.env.REALTIME2_BROKER_API_KEY}` }
          : {}),
      },
    }
  );

  const text =
    response.data?.output_text ||
    response.data?.text ||
    response.data?.response?.text ||
    "";

  return String(text).trim();
}

async function ask(prompt, context = {}) {
  if (!prompt || !prompt.trim()) {
    return "Não entendi sua pergunta. Pode repetir de outro jeito?";
  }

  const provider = getProvider();

  if (provider === "realtime2") {
    return askWithRealtime2Broker(prompt, context);
  }

  return askWithResponses(prompt);
}

module.exports = {
  ask,
  getProvider,
};
