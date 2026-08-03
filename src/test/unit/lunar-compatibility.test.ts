import { describe, expect, it } from "vitest";
import { setTaipeiSystemTime, TAIPEI_TIME_ZONE } from "@/test/helpers/fixedTime";
import {
  formatLunarBirthday,
  getEffectiveToday,
  getLunarYearGanzhi,
  getZodiac,
  mapClockToShichen,
  mapToShichenLabel,
  parseBirthDateTz,
} from "@/utils/lunar";

describe("parseBirthDateTz", () => {
  it("parses a valid civil date at noon in Taipei", () => {
    expect(parseBirthDateTz("2025-01-29").toISOString()).toBe("2025-01-29T04:00:00.000Z");
  });

  it.each(["2025/01/29", "2025-1-29", "not-a-date"])(
    "rejects an invalid date format: %s",
    (value) => {
      expect(() => parseBirthDateTz(value)).toThrow(
        "Invalid date string format. Expected YYYY-MM-DD.",
      );
    },
  );

  it.each(["2025-02-29", "2025-02-30", "2025-13-01"])(
    "rejects a calendar date that does not exist: %s",
    (value) => {
      expect(() => parseBirthDateTz(value)).toThrow("Invalid solar date value.");
    },
  );
});

describe("lunar birth conversion compatibility", () => {
  it("converts Lunar New Year 2025 to traditional ritual wording", () => {
    const birthDate = parseBirthDateTz("2025-01-29");

    expect(getLunarYearGanzhi(birthDate)).toBe("乙巳");
    expect(getZodiac(birthDate)).toBe("蛇");
    expect(formatLunarBirthday(birthDate)).toBe("正月初一");
  });

  it("keeps Lunar New Year's Eve 2025 in the previous lunar year", () => {
    const birthDate = parseBirthDateTz("2025-01-28");

    expect(getLunarYearGanzhi(birthDate)).toBe("甲辰");
    expect(getZodiac(birthDate)).toBe("龍");
    expect(formatLunarBirthday(birthDate)).toBe("十二月廿九");
  });
});

describe("mapClockToShichen", () => {
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
  ])("maps %s to %s", (clockTime, expected) => {
    expect(mapClockToShichen(clockTime)).toBe(expected);
  });

  it.each(["", "0:00", "24:00", "12:60", "not-a-time"])(
    "returns an empty value for invalid time: %s",
    (clockTime) => {
    expect(mapClockToShichen(clockTime)).toBeNull();
    },
  );
});

describe("mapToShichenLabel", () => {
  it("uses 吉時 when the birth time is unknown", () => {
    expect(mapToShichenLabel("unknown")).toBe("吉時");
  });

  it("formats a selected traditional branch", () => {
    expect(mapToShichenLabel("shichen", "chou")).toBe("丑時");
  });

  it("distinguishes early and late zi hours for exact clock input", () => {
    expect(mapToShichenLabel("clock", undefined, "00:30")).toBe("早子時");
    expect(mapToShichenLabel("clock", undefined, "23:30")).toBe("夜子時");
  });

  it("uses 未知 for incomplete or invalid input", () => {
    expect(mapToShichenLabel("shichen")).toBe("未知");
    expect(mapToShichenLabel("clock", undefined, "25:00")).toBe("未知");
  });
});

describe("getEffectiveToday", () => {
  it("uses the current Taipei civil day before the 23:00 boundary", () => {
    // Test time: 2025-01-28 22:59 Asia/Taipei; boundary: 23:00.
    setTaipeiSystemTime("2025-01-28T22:59:00+08:00");

    expect(getEffectiveToday(23, TAIPEI_TIME_ZONE).toISOString()).toBe(
      "2025-01-28T00:00:00.000Z",
    );
  });

  it("uses the next effective day at the 23:00 boundary", () => {
    // Test time: 2025-01-28 23:00 Asia/Taipei; boundary: 23:00.
    setTaipeiSystemTime("2025-01-28T23:00:00+08:00");

    expect(getEffectiveToday(23, TAIPEI_TIME_ZONE).toISOString()).toBe(
      "2025-01-29T00:00:00.000Z",
    );
  });
});
