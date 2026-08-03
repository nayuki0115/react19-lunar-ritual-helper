import { describe, expect, it } from "vitest";
import { toTraditionalChinese } from "@/utils/zh";

describe("toTraditionalChinese", () => {
  it("converts the simplified zodiac and yin-yang characters currently supported", () => {
    expect(toTraditionalChinese("鸡马龙猪阴阳")).toBe("雞馬龍豬陰陽");
  });

  it("normalizes lunar month aliases by default", () => {
    expect(toTraditionalChinese("腊月、臘月、冬月")).toBe("十二月、十二月、十一月");
  });

  it("normalizes lunar day aliases by default", () => {
    expect(toTraditionalChinese("廿一、卅")).toBe("二十一、三十");
  });

  it("can preserve lunar month and day aliases", () => {
    expect(
      toTraditionalChinese("臘月廿一", {
        normalizeLunarMonthAlias: false,
        normalizeLunarDayAlias: false,
      }),
    ).toBe("臘月廿一");
  });
});
