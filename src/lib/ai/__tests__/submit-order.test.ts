// submit_order tool tests. The telegram module is mocked so no network call is
// made: the order "notification" is a vi.fn we can inspect and override. The
// authoritative price always comes from ctx.lastQuote (the module-computed quote),
// never from the model's `price` arg.

import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/telegram", () => ({
  sendChatOrderNotification: vi.fn(async () => true),
  sendEscalationNotification: vi.fn(async () => true),
}))

import { runTool } from "@/lib/ai/tools"
import { sendChatOrderNotification } from "@/lib/telegram"

const mockNotify = vi.mocked(sendChatOrderNotification)

beforeEach(() => {
  mockNotify.mockReset()
  mockNotify.mockResolvedValue(true)
})

describe("runTool — submit_order", () => {
  it("missing contactHandle => { error } and no notification sent", async () => {
    const result = (await runTool(
      "submit_order",
      {
        service: "Credit Farm",
        summary: "100M credits",
        contactPlatform: "discord",
      },
      { conversationId: "abc" },
    )) as { error?: string }

    expect(result).toHaveProperty("error")
    expect(typeof result.error).toBe("string")
    expect(mockNotify).not.toHaveBeenCalled()
  })

  it("valid order with ctx.lastQuote => { ok, submitted } and price from the quote", async () => {
    const result = (await runTool(
      "submit_order",
      {
        service: "Credit Farm",
        summary: "100M credits",
        contactPlatform: "discord",
        contactHandle: "tankace#1234",
      },
      {
        conversationId: "abc",
        lastQuote: { total: 468, currency: "USD", route: "/services/credit-farm" },
      },
    )) as { ok: boolean; submitted: boolean }

    expect(result.ok).toBe(true)
    expect(result.submitted).toBe(true)

    expect(mockNotify).toHaveBeenCalledTimes(1)
    const arg = mockNotify.mock.calls[0][0]
    expect(arg.price).toBe("$468")
    expect(arg.contactHandle).toBe("tankace#1234")
    expect(arg.contactPlatform).toBe("discord")
  })

  it("no ctx.lastQuote => captures the lead as a PRICE-TBD order (never dead-ends); price not invented", async () => {
    const result = (await runTool(
      "submit_order",
      {
        service: "Credit Farm",
        summary: "100M credits",
        contactPlatform: "discord",
        contactHandle: "tankace#1234",
        price: "$1", // a model-supplied price must be ignored — never trusted
      },
      { conversationId: "abc" }, // no lastQuote
    )) as { ok?: boolean; submitted?: boolean; needsPriceConfirmation?: boolean }

    // Lead-safety: with a handle in hand the order is STILL routed (for a manager to
    // price), instead of silently dead-ending. The price is never the model's "$1".
    expect(result.ok).toBe(true)
    expect(result.submitted).toBe(true)
    expect(result.needsPriceConfirmation).toBe(true)
    expect(mockNotify).toHaveBeenCalledTimes(1)
    const arg = mockNotify.mock.calls[0][0]
    expect(arg.needsPriceConfirmation).toBe(true)
    expect(arg.price).toBe("(manager to confirm)")
  })

  it("invalid contactPlatform => { error } and no notification (never coerced to discord)", async () => {
    const result = (await runTool(
      "submit_order",
      {
        service: "Credit Farm",
        summary: "100M credits",
        contactPlatform: "signal",
        contactHandle: "+15551234567",
      },
      {
        conversationId: "abc",
        lastQuote: { total: 468, currency: "USD", route: "/services/credit-farm" },
      },
    )) as { error?: string }

    expect(result).toHaveProperty("error")
    expect(typeof result.error).toBe("string")
    expect(mockNotify).not.toHaveBeenCalled()
  })

  it("notification returns false => runTool returns { error }", async () => {
    mockNotify.mockResolvedValueOnce(false)

    const result = (await runTool(
      "submit_order",
      {
        service: "Credit Farm",
        summary: "100M credits",
        contactPlatform: "discord",
        contactHandle: "tankace#1234",
      },
      {
        conversationId: "abc",
        lastQuote: { total: 468, currency: "USD", route: "/services/credit-farm" },
      },
    )) as { error?: string }

    expect(result).toHaveProperty("error")
    expect(typeof result.error).toBe("string")
  })
})
