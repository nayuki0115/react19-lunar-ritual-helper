import { describe, expect, it } from "vitest";
import { getDayBoundaryDelay, getNextDayBoundary } from "@/utils/dayBoundary";
import { calculateSuiAge, resolveTodayProfile } from "@/utils/lunar";
import { createRitualResultViewModel } from "@/utils/ritualResults";

describe("next Taipei day boundary", () => {
  it("schedules folk mode for 23:00 on the same civil day", () => {
    const now = new Date("2025-01-28T22:59:00+08:00");
    expect(getNextDayBoundary(now, "folk").toISOString()).toBe("2025-01-28T15:00:00.000Z");
    expect(getDayBoundaryDelay(now, "folk")).toBe(60_000);
  });

  it("schedules the next folk boundary after 23:00 has arrived", () => {
    const now = new Date("2025-01-28T23:00:00+08:00");
    expect(getNextDayBoundary(now, "folk").toISOString()).toBe("2025-01-29T15:00:00.000Z");
  });

  it("schedules civil mode for the next midnight", () => {
    const now = new Date("2025-01-28T23:30:00+08:00");
    expect(getNextDayBoundary(now, "civil").toISOString()).toBe("2025-01-28T16:00:00.000Z");
    expect(getDayBoundaryDelay(now, "civil")).toBe(30 * 60_000);
  });

  it("handles month and year rollovers", () => {
    expect(
      getNextDayBoundary(new Date("2025-12-31T23:59:59+08:00"), "civil").toISOString(),
    ).toBe("2025-12-31T16:00:00.000Z");
    expect(
      getNextDayBoundary(new Date("2025-12-31T23:00:00+08:00"), "folk").toISOString(),
    ).toBe("2026-01-01T15:00:00.000Z");
  });
});

describe("folk and civil current-year results", () => {
  const newYearEve = new Date("2025-01-28T23:30:00+08:00");

  it("updates lunar date, Ganzhi year and current zodiac by mode", () => {
    const folk = resolveTodayProfile(newYearEve, "folk");
    const civil = resolveTodayProfile(newYearEve, "civil");

    expect(folk).toMatchObject({
      lunarDateText: "正月初一",
      ganzhiYear: "乙巳",
      zodiac: "蛇",
    });
    expect(civil).toMatchObject({
      lunarDateText: "十二月廿九",
      ganzhiYear: "甲辰",
      zodiac: "龍",
    });
  });

  it("updates sui age with the effective current lunar year", () => {
    const folkYear = resolveTodayProfile(newYearEve, "folk").lunarDate.year;
    const civilYear = resolveTodayProfile(newYearEve, "civil").lunarDate.year;
    expect(calculateSuiAge(folkYear, 1992)).toBe(34);
    expect(calculateSuiAge(civilYear, 1992)).toBe(33);
  });

  it("keeps birth results unchanged when only the day-boundary mode changes", () => {
    const input = {
      mode: "lunar" as const,
      year: 1992,
      month: 12,
      day: 8,
      time: { kind: "branch" as const, branch: "chou" as const },
    };
    const folk = createRitualResultViewModel(input, "male", newYearEve, "folk");
    const civil = createRitualResultViewModel(input, "male", newYearEve, "civil");

    expect(folk.birthText).toBe(civil.birthText);
    expect(folk.birthZodiac).toBe(civil.birthZodiac);
    expect(folk.originalBirthInput).toBe(civil.originalBirthInput);
    expect(folk.suiAge).toBe(civil.suiAge + 1);
  });

  it("changes folk exactly at 23:00 and civil exactly at midnight", () => {
    const beforeFolk = resolveTodayProfile(new Date("2025-01-28T22:59:59+08:00"), "folk");
    const atFolk = resolveTodayProfile(new Date("2025-01-28T23:00:00+08:00"), "folk");
    const beforeCivil = resolveTodayProfile(new Date("2025-01-28T23:59:59+08:00"), "civil");
    const atCivil = resolveTodayProfile(new Date("2025-01-29T00:00:00+08:00"), "civil");

    expect(beforeFolk.lunarDateText).toBe("十二月廿九");
    expect(atFolk.lunarDateText).toBe("正月初一");
    expect(beforeCivil.lunarDateText).toBe("十二月廿九");
    expect(atCivil.lunarDateText).toBe("正月初一");
  });
});
