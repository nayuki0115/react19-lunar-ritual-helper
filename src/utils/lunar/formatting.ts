const MONTH_NAMES = [
  "", "正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二",
] as const;

const DAY_NAMES = [
  "", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
] as const;

export const assertIntegerInRange = (
  value: number,
  minimum: number,
  maximum: number,
  label: string,
) => {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} must be an integer from ${minimum} to ${maximum}.`);
  }
};

export const formatTraditionalLunarDate = (
  month: number,
  day: number,
  isLeapMonth = false,
): string => {
  assertIntegerInRange(month, 1, 12, "Lunar month");
  assertIntegerInRange(day, 1, 30, "Lunar day");
  return `${isLeapMonth ? "閏" : ""}${MONTH_NAMES[month]}月${DAY_NAMES[day]}`;
};
