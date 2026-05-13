# Codebase Review (May 13, 2026)

## 1) What must be fixed for the app to reliably work

1. **No resilience around OpenAI API errors/timeouts** (`index.js`)
   - The current flow does not handle provider errors inside the GPT request function itself.
   - Any transient API/network failure falls through to the global error handler and ends up with a generic message.
   - **Fix**: add timeout + defensive parsing + controlled fallback text.

2. **Potential invalid Alexa `speak()` output** (`index.js`)
   - If model output is empty, Alexa may receive an empty speech string.
   - **Fix**: guarantee a non-empty final response for all code paths.

3. **Hard-coded/legacy assistant wording and docs drift** (`index.js`, `README.md`)
   - Launch/help text still references GPT-3 while code targets newer API styles.
   - README asks users to insert API keys into source code, while runtime already expects `OPENAI_API_KEY` environment variable.
   - **Fix**: align copy and setup docs with environment-based secret management.

4. **No local validation path** (`package.json`)
   - `npm test` always fails by design (`exit 1`), reducing deploy confidence.
   - **Fix**: provide a non-failing check script (lint/syntax check).

## 2) What can be improved

1. **Introduce intent-level prompt shaping and guardrails**
   - Add system instructions per intent (tone, brevity, safe content boundaries).

2. **Add session memory strategy**
   - Persist short conversation context in attributes/session for better multi-turn replies.

3. **Observability**
   - Structured logs with request IDs, latency, and OpenAI status for production debugging.

4. **Security hardening**
   - Enforce request length limits and input sanitization before model calls.

5. **Dependency and runtime modernization**
   - Review old SDK versions and pin supported Node/AWS Lambda runtime targets.

## Realtime 2 API plan (newly released this week)

Given Alexa Custom Skills are request/response Lambda invocations, **Realtime 2** should be integrated through a bridge pattern rather than direct long-lived browser-style sessions.

### Recommended architecture

1. **Primary path (today):** keep `responses` API for synchronous question/answer Alexa turns.
2. **Realtime 2 augmentation:**
   - Deploy a lightweight session broker service that manages Realtime 2 sessions.
   - Lambda posts normalized user utterances + context to broker.
   - Broker returns concise text output optimized for TTS and short-turn latency.
3. **Future voice streaming path:** if you move beyond classic Alexa custom-skill constraints, attach realtime audio streams directly in channels that support full duplex transport.

### Rollout phases

1. **Phase A:** wrap current model access in a provider abstraction (`aiClient.ask()`), no behavior change.
2. **Phase B:** add broker-backed Realtime 2 provider behind a feature flag.
3. **Phase C:** A/B compare latency, quality, and failure rates.
4. **Phase D:** default to Realtime 2; keep `responses` fallback for resiliency.
