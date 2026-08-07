import { describe, expect, it } from "vitest";
import {
  calculateSuiAge,
  formatBirthTime,
  formatTraditionalLunarDate,
  getEffectiveSolarDate,
  mapClockToShichen,
  resolveBirthProfile,
  resolveTodayProfile,
  type BirthInput,
} from "@/utils/lunar";

describe("unified BirthInput", () => {
  it("converts a solar birthday using its civil date only", () => {
    const input: BirthInput = {
      mode: "solar",
      date: "2025-01-28",
      time: { kind: "exact", time: "23:30" },
    };

    expect(resolveBirthProfile(input)).toMatchObject({
      source: "solar",
      lunarDate: { year: 2024, month: 12, day: 29, isLeapMonth: false },
      ganzhiYear: "甲辰",
      zodiac: "龍",
      lunarDateText: "十二月廿九",
      shichenText: "夜子時",
      birthText: "甲辰年 十二月廿九 夜子時",
      userProvidedLunarDate: false,
    });
  });

  it("does not let a late zi hour advance the birth date", () => {
    const lateZi = resolveBirthProfile({
      mode: "solar",
      date: "2025-01-28",
      time: { kind: "exact", time: "23:59" },
    });
    const unknown = resolveBirthProfile({
      mode: "solar",
      date: "2025-01-28",
      time: { kind: "unknown" },
    });

    expect(lateZi.lunarDate).toEqual(unknown.lunarDate);
    expect(lateZi.lunarDate.year).toBe(2024);
  });

  it("uses the new lunar year from civil midnight", () => {
    const profile = resolveBirthProfile({
      mode: "solar",
      date: "2025-01-29",
      time: { kind: "exact", time: "00:30" },
    });

    expect(profile).toMatchObject({
      lunarDate: { year: 2025, month: 1, day: 1, isLeapMonth: false },
      ganzhiYear: "乙巳",
      zodiac: "蛇",
      lunarDateText: "正月初一",
      shichenText: "早子時",
    });
  });

  it("keeps a directly supplied lunar month and day without reconversion", () => {
    const profile = resolveBirthProfile({
      mode: "lunar",
      year: 1992,
      month: 12,
      day: 8,
      time: { kind: "branch", branch: "chou" },
    });

    expect(profile).toMatchObject({
      source: "lunar",
      lunarDate: { year: 1992, month: 12, day: 8, isLeapMonth: false },
      ganzhiYear: "壬申",
      zodiac: "猴",
      lunarDateText: "十二月初八",
      shichenText: "丑時",
      birthText: "壬申年 十二月初八 丑時",
      userProvidedLunarDate: true,
    });
  });

  it.each([
    [{ mode: "lunar", year: 1992, month: 0, day: 8, time: { kind: "unknown" } }, "Lunar month"],
    [{ mode: "lunar", year: 1992, month: 13, day: 8, time: { kind: "unknown" } }, "Lunar month"],
    [{ mode: "lunar", year: 1992, month: 12, day: 0, time: { kind: "unknown" } }, "Lunar day"],
    [{ mode: "lunar", year: 1992, month: 12, day: 31, time: { kind: "unknown" } }, "Lunar day"],
  ])("rejects an invalid direct lunar input", (input, message) => {
    expect(() => resolveBirthProfile(input as BirthInput)).toThrow(message as string);
  });
});

describe("traditional lunar date formatting", () => {
  it.each([
    [1, 1, false, "正月初一"],
    [1, 10, false, "正月初十"],
    [11, 19, false, "十一月十九"],
    [12, 20, false, "十二月二十"],
    [2, 21, false, "二月廿一"],
    [2, 29, false, "二月廿九"],
    [2, 30, false, "二月三十"],
    [2, 8, true, "閏二月初八"],
  ])("formats month %i day %i", (month, day, leap, expected) => {
    expect(formatTraditionalLunarDate(month, day, leap)).toBe(expected);
  });

  it("preserves a leap month produced by solar conversion", () => {
    const profile = resolveBirthProfile({
      mode: "solar",
      date: "2023-03-22",
      time: { kind: "branch", branch: "wu" },
    });

    expect(profile.lunarDate).toEqual({
      year: 2023,
      month: 2,
      day: 1,
      isLeapMonth: true,
    });
    expect(profile.lunarDateText).toBe("閏二月初一");
    expect(profile.birthText).toBe("癸卯年 閏二月初一 午時");
  });
});

describe("shichen", () => {
  it.each([
    ["00:00", "zi"],
    ["00:59", "zi"],
    ["01:00", "chou"],
    ["02:59", "chou"],
    ["03:00", "yin"],
    ["04:59", "yin"],
    ["05:00", "mao"],
    ["06:59", "mao"],
    ["07:00", "chen"],
    ["08:59", "chen"],
    ["09:00", "si"],
    ["10:59", "si"],
    ["11:00", "wu"],
    ["12:59", "wu"],
    ["13:00", "wei"],
    ["14:59", "wei"],
    ["15:00", "shen"],
    ["16:59", "shen"],
    ["17:00", "you"],
    ["18:59", "you"],
    ["19:00", "xu"],
    ["20:59", "xu"],
    ["21:00", "hai"],
    ["22:59", "hai"],
    ["23:00", "zi"],
    ["23:59", "zi"],
  ])("maps %s to %s", (time, expected) => {
    expect(mapClockToShichen(time)).toBe(expected);
  });

  it.each(["", "0:00", "24:00", "12:60", "text"])("rejects %s", (time) => {
    expect(mapClockToShichen(time)).toBeNull();
  });

  it("distinguishes early zi, late zi, selected branch and unknown time", () => {
    expect(formatBirthTime({ kind: "exact", time: "00:30" })).toBe("早子時");
    expect(formatBirthTime({ kind: "exact", time: "23:30" })).toBe("夜子時");
    expect(formatBirthTime({ kind: "branch", branch: "zi" })).toBe("子時");
    expect(formatBirthTime({ kind: "unknown" })).toBe("吉時");
  });

  it("supports early, late and unspecified zi selections without an exact time", () => {
    expect(formatBirthTime({ kind: "branch", branch: "zi" })).toBe("子時");
    expect(formatBirthTime({ kind: "branch", branch: "zi", ziPeriod: "early" })).toBe("早子時");
    expect(formatBirthTime({ kind: "branch", branch: "zi", ziPeriod: "late" })).toBe("夜子時");
  });
});

describe("folk and civil today", () => {
  const newYearEveAt2259 = new Date("2025-01-28T22:59:00+08:00");
  const newYearEveAt2300 = new Date("2025-01-28T23:00:00+08:00");

  it("keeps both modes on the civil day before 23:00", () => {
    expect(getEffectiveSolarDate(newYearEveAt2259, "folk")).toEqual({
      year: 2025,
      month: 1,
      day: 28,
    });
    expect(getEffectiveSolarDate(newYearEveAt2259, "civil")).toEqual({
      year: 2025,
      month: 1,
      day: 28,
    });
  });

  it("advances folk at 23:00 while civil remains on the civil day", () => {
    const folk = resolveTodayProfile(newYearEveAt2300, "folk");
    const civil = resolveTodayProfile(newYearEveAt2300, "civil");

    expect(folk).toMatchObject({
      solarDate: { year: 2025, month: 1, day: 29 },
      lunarDate: { year: 2025, month: 1, day: 1 },
      lunarDateText: "正月初一",
      ganzhiYear: "乙巳",
      zodiac: "蛇",
    });
    expect(civil).toMatchObject({
      solarDate: { year: 2025, month: 1, day: 28 },
      lunarDate: { year: 2024, month: 12, day: 29 },
      lunarDateText: "十二月廿九",
      ganzhiYear: "甲辰",
      zodiac: "龍",
    });
  });

  it("handles a folk rollover across a solar month and year", () => {
    expect(getEffectiveSolarDate(new Date("2025-12-31T23:30:00+08:00"), "folk")).toEqual({
      year: 2026,
      month: 1,
      day: 1,
    });
  });
});

describe("sui age", () => {
  it("starts at one and increases by lunar year difference", () => {
    expect(calculateSuiAge(2025, 2025)).toBe(1);
    expect(calculateSuiAge(2025, 1992)).toBe(34);
  });

  it("changes with the effective lunar year at the folk/civil boundary", () => {
    const now = new Date("2025-01-28T23:30:00+08:00");
    const folkYear = resolveTodayProfile(now, "folk").lunarDate.year;
    const civilYear = resolveTodayProfile(now, "civil").lunarDate.year;

    expect(calculateSuiAge(folkYear, 1992)).toBe(34);
    expect(calculateSuiAge(civilYear, 1992)).toBe(33);
  });

  it("rejects a future lunar birth year", () => {
    expect(() => calculateSuiAge(2025, 2026)).toThrow(
      "Birth lunar year cannot be later than the current lunar year.",
    );
  });
});
