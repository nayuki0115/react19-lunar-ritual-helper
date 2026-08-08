import { describe, expect, it } from "vitest";
import { createRitualResultViewModel } from "@/utils/ritualResults";

const NOW = new Date("2025-01-28T23:30:00+08:00");

describe("ritual result view model", () => {
  it("builds ritual fields, current-year information and the sui-age formula", () => {
    const result = createRitualResultViewModel(
      { mode: "solar", date: "1993-01-20", time: { kind: "exact", time: "02:30" } },
      "male",
      NOW,
    );

    expect(result).toMatchObject({
      todayGanzhiYear: "乙巳年",
      todayLunarDate: "正月初一",
      currentZodiac: "屬蛇",
      handprint: "左手印",
      source: "solar",
      sourceLabel: "由國曆出生日期自動換算",
      originalBirthInput: "國曆 1993-01-20",
      originalTimeInput: "02:30（換算為丑時）",
      suiAge: 34,
      suiAgeFormula: "2025 - 1992 + 1 = 34",
    });
  });

  it("marks a directly supplied lunar date and keeps its original input", () => {
    const result = createRitualResultViewModel(
      {
        mode: "lunar",
        year: 1992,
        month: 12,
        day: 8,
        time: { kind: "branch", branch: "zi", ziPeriod: "late" },
      },
      "female",
      NOW,
    );

    expect(result).toMatchObject({
      source: "lunar",
      sourceLabel: "使用者直接提供農曆資料",
      originalBirthInput: "農曆 1992 年 12 月 8 日",
      originalTimeInput: "夜子時",
      birthText: "壬申年 十二月初八 夜子時",
      birthZodiac: "屬猴",
      handprint: "右手印",
    });
  });
});
