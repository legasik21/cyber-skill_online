import { describe, it, expect } from "vitest";
import { priceMarkOfExcellence } from "../mark-of-excellence";

describe("priceMarkOfExcellence parity", () => {
  it("1 -> 95 easy => 90.15", () => {
    expect(
      priceMarkOfExcellence({
        fromProgress: 1,
        toProgress: 95,
        difficulty: "easy",
      }).total
    ).toBeCloseTo(90.15, 2);
  });

  it("1 -> 20 easy => 5.7", () => {
    expect(
      priceMarkOfExcellence({
        fromProgress: 1,
        toProgress: 20,
        difficulty: "easy",
      }).total
    ).toBeCloseTo(5.7, 2);
  });

  it("50 -> 85 hard + 10m silver => 94.61", () => {
    expect(
      priceMarkOfExcellence({
        fromProgress: 50,
        toProgress: 85,
        difficulty: "hard",
        silverOption: "10m",
      }).total
    ).toBeCloseTo(94.61, 2);
  });

  it("1 -> 65 black-rock => 32.7", () => {
    expect(
      priceMarkOfExcellence({
        fromProgress: 1,
        toProgress: 65,
        specialVehicle: "black-rock",
      }).total
    ).toBeCloseTo(32.7, 2);
  });
});
