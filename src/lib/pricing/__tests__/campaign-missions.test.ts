import { describe, it, expect } from "vitest";
import { priceCampaignMissions } from "../campaign-missions";

const full = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

describe("priceCampaignMissions parity", () => {
  it("1.0 stug-iv lt [1,8,15] => 11", () => {
    expect(
      priceCampaignMissions("1.0", { "stug-iv": { lt: [1, 8, 15] } }).total
    ).toBeCloseTo(11, 2);
  });

  it("1.0 stug-iv lt full => 25", () => {
    expect(
      priceCampaignMissions("1.0", { "stug-iv": { lt: full } }).total
    ).toBeCloseTo(25, 2);
  });

  it("1.0 object-260 td [8] => 12", () => {
    expect(
      priceCampaignMissions("1.0", { "object-260": { td: [8] } }).total
    ).toBeCloseTo(12, 2);
  });

  it("1.0 stug-iv full tank => 110", () => {
    expect(
      priceCampaignMissions("1.0", {
        "stug-iv": { lt: full, mt: full, ht: full, td: full, spg: full },
      }).total
    ).toBeCloseTo(110, 2);
  });

  it("2.0 excalibur union [1,2,3] => 12", () => {
    expect(
      priceCampaignMissions("2.0", { excalibur: { union: [1, 2, 3] } }).total
    ).toBeCloseTo(12, 2);
  });

  it("2.0 chimera bloc full => 95", () => {
    expect(
      priceCampaignMissions("2.0", { chimera: { bloc: full } }).total
    ).toBeCloseTo(95, 2);
  });

  it("2.0 excalibur coalition [1..5] => 16", () => {
    expect(
      priceCampaignMissions("2.0", { excalibur: { coalition: [1, 2, 3, 4, 5] } })
        .total
    ).toBeCloseTo(16, 2);
  });

  it("2.0 excalibur full tank => 206", () => {
    expect(
      priceCampaignMissions("2.0", {
        excalibur: { union: full, bloc: full, alliance: full, coalition: full },
      }).total
    ).toBeCloseTo(206, 2);
  });

  it("3.0 black-rock vanguard [1] => 12", () => {
    expect(
      priceCampaignMissions("3.0", { "black-rock": { vanguard: [1] } }).total
    ).toBeCloseTo(12, 2);
  });

  it("3.0 windhund vanguard [1,2,3] => 12", () => {
    expect(
      priceCampaignMissions("3.0", { windhund: { vanguard: [1, 2, 3] } }).total
    ).toBeCloseTo(12, 2);
  });

  it("3.0 black-rock vanguard full => 146", () => {
    expect(
      priceCampaignMissions("3.0", { "black-rock": { vanguard: full } }).total
    ).toBeCloseTo(146, 2);
  });

  it("3.0 windhund full tank => 158", () => {
    expect(
      priceCampaignMissions("3.0", {
        windhund: { vanguard: full, ambush: full, assistance: full },
      }).total
    ).toBeCloseTo(158, 2);
  });
});
