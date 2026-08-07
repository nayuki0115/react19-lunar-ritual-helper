import { describe, expect, it } from "vitest";
import {
  createDefaultFormState,
  toBirthInput,
  validateBirthForm,
  type FormState,
} from "@/utils/formSpec";
import { resolveBirthProfile } from "@/utils/lunar";

const NOW = new Date("2025-01-28T22:00:00+08:00");

const validSolarState = (): FormState => ({
  ...createDefaultFormState(),
  gender: "male",
  solar: {
    date: "1993-01-20",
    timeMode: "unknown",
    timeBranch: "",
    timeExact: "",
  },
});

describe("birth input validation", () => {
  it("reports required fields for an empty solar draft", () => {
    expect(validateBirthForm(createDefaultFormState(), NOW)).toEqual({
      gender: "請選擇性別",
      solarDate: "請選擇國曆出生日期",
    });
  });

  it("rejects a nonexistent or future solar date", () => {
    const invalid = validSolarState();
    invalid.solar.date = "2025-02-30";
    expect(validateBirthForm(invalid, NOW).solarDate).toBe("請輸入有效的國曆日期");

    invalid.solar.date = "2025-01-29";
    expect(validateBirthForm(invalid, NOW).solarDate).toBe("出生日期不得晚於今天");
  });

  it("requires the conditional time value", () => {
    const branch = validSolarState();
    branch.solar.timeMode = "branch";
    expect(validateBirthForm(branch, NOW).time).toContain("請選擇出生時辰");

    const exact = validSolarState();
    exact.solar.timeMode = "exact";
    expect(validateBirthForm(exact, NOW).time).toContain("請輸入出生時間");
  });

  it("validates direct lunar year, month and day ranges", () => {
    const state = validSolarState();
    state.birthMode = "lunar";
    state.lunar = {
      year: "2026", month: "13", day: "31",
      timeMode: "unknown", timeBranch: "", timeExact: "",
    };
    expect(validateBirthForm(state, NOW)).toMatchObject({
      lunarYear: "農曆出生年不得晚於目前農曆年",
      lunarMonth: "農曆月份必須介於 1 到 12",
      lunarDay: "農曆日期必須介於 1 到 30",
    });
  });

  it("creates only the active mode input", () => {
    const state = validSolarState();
    state.lunar = {
      year: "1992", month: "12", day: "8",
      timeMode: "branch", timeBranch: "chou", timeExact: "",
    };
    expect(toBirthInput(state)).toEqual({
      mode: "solar",
      date: "1993-01-20",
      time: { kind: "unknown" },
    });

    state.birthMode = "lunar";
    expect(toBirthInput(state)).toEqual({
      mode: "lunar",
      year: 1992,
      month: 12,
      day: 8,
      time: { kind: "branch", branch: "chou" },
    });
  });

  it.each([
    ["zi", undefined, "子時"],
    ["earlyZi", "early", "早子時"],
    ["lateZi", "late", "夜子時"],
  ] as const)("maps the %s selection to zi-period detail", (selection, ziPeriod, expectedText) => {
    const state = validSolarState();
    state.solar.timeMode = "branch";
    state.solar.timeBranch = selection;

    const input = toBirthInput(state);
    expect(input.time).toEqual({
      kind: "branch",
      branch: "zi",
      ...(ziPeriod ? { ziPeriod } : {}),
    });
    expect(resolveBirthProfile(input).shichenText).toBe(expectedText);
  });
});
