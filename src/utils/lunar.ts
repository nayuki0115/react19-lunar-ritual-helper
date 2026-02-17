import { Lunar, Solar } from "lunar-javascript";
import { toTraditionalChinese } from "./zh";

export type ShichenCode =
  | "zi"
  | "chou"
  | "yin"
  | "mao"
  | "chen"
  | "si"
  | "wu"
  | "wei"
  | "shen"
  | "you"
  | "xu"
  | "hai";

export type BirthTimeKind = "shichen" | "clock" | "unknown";

const SHICHEN_LABEL: Record<ShichenCode, string> = {
  zi: "子",
  chou: "丑",
  yin: "寅",
  mao: "卯",
  chen: "辰",
  si: "巳",
  wu: "午",
  wei: "未",
  shen: "申",
  you: "酉",
  xu: "戌",
  hai: "亥",
};

const toInt = (value: string): number => Number.parseInt(value, 10);

const getTaipeiYmd = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  return {
    year: toInt(map.year ?? "0"),
    month: toInt(map.month ?? "1"),
    day: toInt(map.day ?? "1"),
  };
};

const toSolar = (date: Date) => {
  const ymd = getTaipeiYmd(date);
  return Solar.fromYmd(ymd.year, ymd.month, ymd.day);
};

const parseClock = (clockTime?: string): { hour: number; minute: number } | null => {
  if (!clockTime) return null;

  const matched = /^(\d{2}):(\d{2})$/.exec(clockTime);
  if (!matched) return null;

  const hour = Number.parseInt(matched[1], 10);
  const minute = Number.parseInt(matched[2], 10);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
};

export const parseBirthDateTz = (dateStr: string): Date => {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!matched) {
    throw new Error("Invalid date string format. Expected YYYY-MM-DD.");
  }

  const year = Number.parseInt(matched[1], 10);
  const month = Number.parseInt(matched[2], 10);
  const day = Number.parseInt(matched[3], 10);

  const date = new Date(`${dateStr}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid solar date value.");
  }

  const ymd = getTaipeiYmd(date);
  if (ymd.year !== year || ymd.month !== month || ymd.day !== day) {
    throw new Error("Invalid solar date value.");
  }

  return date;
};

export const solarDateStringToDate = (value: string): Date => parseBirthDateTz(value);

export const getLunarYearGanzhi = (date: Date): string => {
  const lunar = toSolar(date).getLunar();
  return toTraditionalChinese(lunar.getYearInGanZhi());
};

export const getRocYearFromLunarYear = (date: Date): number => {
  const lunar = toSolar(date).getLunar();
  return lunar.getYear() - 1911;
};

export const getRocYear = (date: Date): number => date.getFullYear() - 1911;

export const formatLunarBirthday = (date: Date): string => {
  const lunar = toSolar(date).getLunar();
  const month = lunar.getMonth();
  const day = lunar.getDay();

  const monthAbs = Math.abs(month);
  const monthTextMap = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
  const monthText = `${month < 0 ? "閏" : ""}${monthTextMap[monthAbs] ?? monthAbs}月`;

  const dayDigitMap = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  let dayText = "";
  if (day <= 10) {
    dayText = day === 10 ? "十" : dayDigitMap[day];
  } else if (day < 20) {
    dayText = `十${dayDigitMap[day - 10]}`;
  } else if (day === 20) {
    dayText = "二十";
  } else if (day < 30) {
    dayText = `二十${dayDigitMap[day - 20]}`;
  } else {
    dayText = "三十";
  }

  return toTraditionalChinese(`${monthText}${dayText}日`);
};

export const mapClockToShichen = (clockTime: string): ShichenCode | "" => {
  const parsed = parseClock(clockTime);
  if (!parsed) return "";

  const totalMinute = parsed.hour * 60 + parsed.minute;

  if (totalMinute >= 23 * 60 || totalMinute < 1 * 60) return "zi";
  if (totalMinute < 3 * 60) return "chou";
  if (totalMinute < 5 * 60) return "yin";
  if (totalMinute < 7 * 60) return "mao";
  if (totalMinute < 9 * 60) return "chen";
  if (totalMinute < 11 * 60) return "si";
  if (totalMinute < 13 * 60) return "wu";
  if (totalMinute < 15 * 60) return "wei";
  if (totalMinute < 17 * 60) return "shen";
  if (totalMinute < 19 * 60) return "you";
  if (totalMinute < 21 * 60) return "xu";

  return "hai";
};

export const mapToShichenLabel = (
  birthTimeKind: BirthTimeKind,
  shichenCode?: string,
  clockTime?: string,
): string => {
  if (birthTimeKind === "unknown") return toTraditionalChinese("吉時");

  if (birthTimeKind === "shichen") {
    if (!shichenCode || !(shichenCode in SHICHEN_LABEL)) return toTraditionalChinese("未知");
    return toTraditionalChinese(`${SHICHEN_LABEL[shichenCode as ShichenCode]}時`);
  }

  const parsedClock = parseClock(clockTime);
  if (!parsedClock) return toTraditionalChinese("未知");

  if (parsedClock.hour === 23) return toTraditionalChinese("夜子時");
  if (parsedClock.hour === 0) return toTraditionalChinese("早子時");

  const code = mapClockToShichen(clockTime ?? "");
  if (!code) return toTraditionalChinese("未知");

  return toTraditionalChinese(`${SHICHEN_LABEL[code]}時`);
};

export const getZodiac = (date: Date): string => {
  const lunar = toSolar(date).getLunar();
  return toTraditionalChinese(lunar.getYearShengXiao());
};

const getZonedParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  return {
    year: toInt(map.year ?? "0"),
    month: toInt(map.month ?? "1"),
    day: toInt(map.day ?? "1"),
    hour: toInt(map.hour ?? "0"),
  };
};

const solarFromUtcDate = (date: Date) =>
  Solar.fromYmd(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());

export const getEffectiveToday = (boundaryHour = 23, timeZone = "Asia/Taipei"): Date => {
  const now = new Date();
  const zoned = getZonedParts(now, timeZone);

  const baseUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day);
  const shiftedUtc = zoned.hour >= boundaryHour ? baseUtc + 24 * 60 * 60 * 1000 : baseUtc;

  return new Date(shiftedUtc);
};

export const formatLunarMD = (date: Date): string => {
  const lunar = solarFromUtcDate(date).getLunar();
  return toTraditionalChinese(`${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`);
};

export const getGanzhiYear = (date: Date): string => {
  const lunar = solarFromUtcDate(date).getLunar();
  return toTraditionalChinese(`${lunar.getYearInGanZhi()}年`);
};

export const getLunarYear = (date: Date): number => {
  const lunar = solarFromUtcDate(date).getLunar();
  return lunar.getYear();
};

export const getZodiacByLunarYear = (lunarYear: number): string => {
  const lunar = Lunar.fromYmd(lunarYear, 1, 1);
  return toTraditionalChinese(`屬${lunar.getYearShengXiao()}`);
};
