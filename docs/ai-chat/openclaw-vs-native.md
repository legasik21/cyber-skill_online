# Decision Record: Native in-app integration vs. OpenClaw

**Status:** Decided — native in-app integration. Provider: **Google Gemini** (owner directive).
**Date:** 2026-06-17 (provider switched to Google Gemini 2026-06-18, per owner directive)

## Decision

The CyberSkill WoT chat AI responder is built as a **native in-app integration**
using the official Google Gemini SDK (`@google/genai`) and Gemini's function
calling over the website's own chat transport (Supabase + Ably). It is **off by
default**, gated by the `AI_CHAT_ENABLED` environment flag.

The provider was originally Anthropic Claude; per owner directive it is now
**Google Gemini**. The integration shape is unchanged — it is still a native,
in-app, tool-calling responder. Only the model "brain" was swapped; the
deterministic pricing engine, the system-prompt content, and the `runTool`
executor are intact.

## Context

The responder must:
- Answer sales questions by quoting **exact, deterministic prices** — every number
  must come from the in-app pricing functions in `src/lib/pricing/*`
  (`calculatePrice` in `catalog.ts`), never from the model's own arithmetic.
- Answer policy/support questions only from the grounded FAQ in `src/data/faq.ts`.
- Post replies back through the existing chat transport (insert `sender_type='agent'`
  + `publishToChannel`), exactly as a human agent does via the admin route.

These are **in-app tools the LLM must call**, over our own web chat — not a
messaging-app or desktop surface.

## Why native in-app tool-calling (over OpenClaw)

- **Fit.** Provider function calling maps directly onto our requirement: define the
  pricing and FAQ functions as tool declarations, let the model gather missing
  params and call `calculate_price` / `answer_faq`, and run a short agentic loop
  server-side. The deterministic pricing functions are the single source of truth;
  the model is constrained to call them rather than invent numbers. This holds for
  Gemini exactly as it did for Claude — the loop and tools are provider-agnostic.
- **Transport.** We already own the chat transport (Supabase messages + Ably
  channels). We only need an LLM brain wired into the visitor-message POST seam —
  not an external messaging/automation runtime.
- **OpenClaw mismatch (still rejected, same reasons).** OpenClaw is oriented toward
  messaging-app / computer-use automation, and its auth/subscription model changed
  (now API-key based). It does not cleanly fit an in-app, tool-calling web responder
  embedded in our Next.js API routes. Adopting it would add an ill-fitting runtime
  for no functional gain. Switching the model provider to Gemini does not change
  this — OpenClaw remains the wrong shape for this surface.

The chosen path is the native in-app integration: provider function calling via the
official SDK (now Google Gemini's `@google/genai`).

## Model & gating

- **Provider:** Google Gemini (owner directive).
- **Default model:** `gemini-2.5-flash` — cheap and fully capable of the tool-calling
  flow. Override via `GEMINI_MODEL`.
- **Fallback model:** `gemini-3.5-flash` (owner-named) — set via `GEMINI_FALLBACK_MODEL`.
  Used **only** when a `generateContent` call fails with a model-not-found /
  availability error, not on ordinary refusals.
- **Feature flag:** the entire responder is gated by `AI_CHAT_ENABLED` and is
  **off by default**. When the flag is off (or no `GEMINI_API_KEY` is set), the
  chat behaves exactly as before — the responder is a no-op. The Gemini client is
  constructed lazily at request time, so the build never requires the key.

## Tool-calling shape (Gemini specifics)

- Tools are passed as `tools: [{ functionDeclarations: [...] }]` with
  `toolConfig.functionCallingConfig.mode = AUTO`.
- Gemini schemas are the strict OpenAPI subset (`Type.OBJECT/STRING/NUMBER/
  BOOLEAN/ARRAY`, `enum` on strings) and do not cleanly support a free-form object
  property. So `calculate_price` declares `paramsJson` as a **STRING** the model
  fills with a JSON object (e.g. `{"serviceType":"credits",...}`); the assistant
  loop `JSON.parse`s it before calling `runTool`. `runTool`'s `{ serviceId, params }`
  contract is unchanged (its unit tests stay green).
