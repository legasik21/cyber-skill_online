// Deterministic topic-guard tests. classifyTopicQuick is synchronous and pure —
// it only runs the keyword/heuristic pass and never hits the network (the LLM
// tie-breaker classifyTopicLLM / classifyTopic are NOT exercised here).

import { describe, it, expect } from "vitest"
import { classifyTopicQuick } from "@/lib/ai/topic"

describe("classifyTopicQuick — on-topic (WoT / commerce vocabulary)", () => {
  it.each([
    "How much for Object 260 missions HT-15?",
    "I want a credit farm boost",
    "what's the price for wn8 boost",
    "do you do marks of excellence?",
  ])("%s => on", (text) => {
    expect(classifyTopicQuick(text)).toBe("on")
  })
})

describe("classifyTopicQuick — conversational glue / short", () => {
  it.each(["hi", "ok thanks", "yes please", "hello"])("%s => on", (text) => {
    expect(classifyTopicQuick(text)).toBe("on")
  })
})

describe("classifyTopicQuick — clearly off-topic (other-domain markers)", () => {
  it.each([
    "what's the weather today",
    "can you write me python code",
    "who won the football match",
    "give me a lasagna recipe",
  ])("%s => off", (text) => {
    expect(classifyTopicQuick(text)).toBe("off")
  })
})

describe("classifyTopicQuick — ambiguous no-signal sentence", () => {
  it("longer message with no WoT/commerce term and no off-marker => unknown", () => {
    expect(
      classifyTopicQuick("could you explain that thing again for me please"),
    ).toBe("unknown")
  })
})
