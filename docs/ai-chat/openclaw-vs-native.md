# Decision Record: Native Claude integration vs. OpenClaw

**Status:** Decided — native Claude integration.
**Date:** 2026-06-17

## Decision

The CyberSkill WoT chat AI responder is built as a **native Claude integration**
using the official `@anthropic-ai/sdk` and Claude's tool-use (function calling)
over the website's own chat transport (Supabase + Ably). It is **off by default**,
gated by the `AI_CHAT_ENABLED` environment flag.

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

## Why native Claude (over OpenClaw)

- **Fit.** Claude tool-use maps directly onto our requirement: define the pricing
  and FAQ functions as tools, let the model gather missing params and call
  `calculate_price` / `answer_faq`, and run a short agentic loop server-side. The
  deterministic pricing functions are the single source of truth; the model is
  constrained to call them rather than invent numbers.
- **Transport.** We already own the chat transport (Supabase messages + Ably
  channels). We only need an LLM brain wired into the visitor-message POST seam —
  not an external messaging/automation runtime.
- **OpenClaw mismatch.** OpenClaw is oriented toward messaging-app / computer-use
  automation, and its auth/subscription model changed (now API-key based). It does
  not cleanly fit an in-app, tool-calling web responder embedded in our Next.js API
  routes. Adopting it would add an ill-fitting runtime for no functional gain.

The chosen path is the native fallback: in-app Claude tool-use via the official SDK.

## Model & gating

- **Default model:** `claude-sonnet-4-6` (brief-specified default).
- **Cost lever:** `claude-haiku-4-5` — set via `ANTHROPIC_MODEL` to trade some
  capability for lower cost.
- **Feature flag:** the entire responder is gated by `AI_CHAT_ENABLED` and is
  **off by default**. When the flag is off (or no `ANTHROPIC_API_KEY` is set), the
  chat behaves exactly as before — the responder is a no-op. The Anthropic client
  is constructed lazily at request time, so the build never requires the key.
