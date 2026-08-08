import { Lunar, Solar } from "lunar-javascript";
import { toTraditionalChinese } from "@/utils/zh";
import { assertIntegerInRange, formatTraditionalLunarDate } from "./formatting";
import { formatBirthTime } from "./shichen";
import type {
  BirthInput, BirthProfile, CalendarDate, DayMode, LunarDate, TodayProfile,
} from "./types";

export const TAIPEI_TIME_ZONE = "Asia/Taipei";

const daysInSolarMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

export const parseSolarDate = (value: string): CalendarDate => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error("Invalid date string format. Expected YYYY-MM-DD.");
  const date = {
    year: Number.parseInt(match[1], 10),
    month: Number.parseInt(match[2], 10),
    day: Number.parseInt(match[3], 10),
  };
  if (
    date.year < 1 || date.month < 1 || date.month > 12 ||
    date.day < 1 || date.day > daysInSolarMonth(date.year, date.month)
  ) throw new Error("Invalid solar date value.");
  return date;
};

const lunarYearIdentity = (year: number) => {
  if (!Number.isInteger(year)) throw new RangeError("Lunar year must be an integer.");
  try {
    const lunar = Lunar.fromYmd(year, 1, 1);
    return {
      ganzhiYear: toTraditionalChinese(lunar.getYearInGanZhi()),
      zodiac: toTraditionalChinese(lunar.getYearShengXiao()),
    };
  } catch {
    throw new RangeError("Unsupported lunar year.");
  }
};

const fromSolarDate = (date: CalendarDate): LunarDate => {
  try {
    const lunar = Solar.fromYmd(date.year, date.month, date.day).getLunar();
    const month = lunar.getMonth();
    return {
      year: lunar.getYear(), month: Math.abs(month), day: lunar.getDay(), isLeapMonth: month < 0,
    };
  } catch {
    throw new RangeError("Unsupported solar date.");
  }
};

export const resolveBirthProfile = (input: BirthInput): BirthProfile => {
  const lunarDate = input.mode === "solar"
    ? fromSolarDate(parseSolarDate(input.date))
    : (() => {
        assertIntegerInRange(input.month, 1, 12, "Lunar month");
        assertIntegerInRange(input.day, 1, 30, "Lunar day");
        return { year: input.year, month: input.month, day: input.day, isLeapMonth: false };
      })();
  const identity = lunarYearIdentity(lunarDate.year);
  const lunarDateText = formatTraditionalLunarDate(
    lunarDate.month, lunarDate.day, lunarDate.isLeapMonth,
  );
  const shichenText = formatBirthTime(input.time);
  return {
    source: input.mode,
    lunarDate,
    ...identity,
    lunarDateText,
    shichenText,
    birthText: `${identity.ganzhiYear}年 ${lunarDateText} ${shichenText}`,
    userProvidedLunarDate: input.mode === "lunar",
  };
};

const getTaipeiParts = (now: Date): CalendarDate & { hour: number } => {
  if (Number.isNaN(now.getTime())) throw new Error("Invalid current date.");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TAIPEI_TIME_ZONE,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year), month: Number(values.month),
    day: Number(values.day), hour: Number(values.hour),
  };
};

const addCalendarDay = (date: CalendarDate): CalendarDate => {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + 1));
  return {
    year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate(),
  };
};

export const getEffectiveSolarDate = (now: Date, mode: DayMode): CalendarDate => {
  const taipei = getTaipeiParts(now);
  const date = { year: taipei.year, month: taipei.month, day: taipei.day };
  return mode === "folk" && taipei.hour >= 23 ? addCalendarDay(date) : date;
};

export const resolveTodayProfile = (now: Date, mode: DayMode): TodayProfile => {
  const solarDate = getEffectiveSolarDate(now, mode);
  const lunarDate = fromSolarDate(solarDate);
  const identity = lunarYearIdentity(lunarDate.year);
  return {
    mode, solarDate, lunarDate,
    lunarDateText: formatTraditionalLunarDate(
      lunarDate.month, lunarDate.day, lunarDate.isLeapMonth,
    ),
    ...identity,
  };
};
