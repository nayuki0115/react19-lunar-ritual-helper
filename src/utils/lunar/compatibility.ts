import { Lunar } from "lunar-javascript";
import {
  getEffectiveSolarDate,
  resolveBirthProfile,
  TAIPEI_TIME_ZONE,
} from "./calendar";
import { formatBirthTime } from "./shichen";
import type { BirthTimeInput, CalendarDate, ShichenCode } from "./types";
import { toTraditionalChinese } from "@/utils/zh";

export type { ShichenCode } from "./types";
export type BirthTimeKind = "shichen" | "clock" | "unknown";

const pad = (value: number) => String(value).padStart(2, "0");
const toDateString = (date: CalendarDate) =>
  `${String(date.year).padStart(4, "0")}-${pad(date.month)}-${pad(date.day)}`;

const getTaipeiDate = (date: Date): CalendarDate => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TAIPEI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
};

const getUtcDate = (date: Date): CalendarDate => ({
  year: date.getUTCFullYear(),
  month: date.getUTCMonth() + 1,
  day: date.getUTCDate(),
});

const getBirthProfile = (date: Date) =>
  resolveBirthProfile({
    mode: "solar",
    date: toDateString(getTaipeiDate(date)),
    time: { kind: "unknown" },
  });

export const parseBirthDateTz = (dateString: string): Date => {
  // Domain parsing and conversion validate both the civil date and library support.
  resolveBirthProfile({ mode: "solar", date: dateString, time: { kind: "unknown" } });
  return new Date(`${dateString}T12:00:00+08:00`);
};

export const solarDateStringToDate = parseBirthDateTz;

export const getLunarYearGanzhi = (date: Date): string => getBirthProfile(date).ganzhiYear;

export const getRocYearFromLunarYear = (date: Date): number =>
  getBirthProfile(date).lunarDate.year - 1911;

export const getRocYear = (date: Date): number => date.getFullYear() - 1911;

export const formatLunarBirthday = (date: Date): string => getBirthProfile(date).lunarDateText;

const toBirthTimeInput = (
  birthTimeKind: BirthTimeKind,
  shichenCode?: string,
  clockTime?: string,
): BirthTimeInput | null => {
  if (birthTimeKind === "unknown") return { kind: "unknown" };
  if (birthTimeKind === "clock") return clockTime ? { kind: "exact", time: clockTime } : null;

  const branches: readonly ShichenCode[] = [
    "zi", "chou", "yin", "mao", "chen", "si",
    "wu", "wei", "shen", "you", "xu", "hai",
  ];
  return branches.includes(shichenCode as ShichenCode)
    ? { kind: "branch", branch: shichenCode as ShichenCode }
    : null;
};

export const mapToShichenLabel = (
  birthTimeKind: BirthTimeKind,
  shichenCode?: string,
  clockTime?: string,
): string => {
  const input = toBirthTimeInput(birthTimeKind, shichenCode, clockTime);
  if (!input) return "未知";
  try {
    return formatBirthTime(input);
  } catch {
    return "未知";
  }
};

export const getZodiac = (date: Date): string => getBirthProfile(date).zodiac;

export const getEffectiveToday = (
  boundaryHour = 23,
  timeZone = TAIPEI_TIME_ZONE,
): Date => {
  if (timeZone !== TAIPEI_TIME_ZONE) {
    throw new Error(`Only ${TAIPEI_TIME_ZONE} is supported.`);
  }
  if (boundaryHour !== 0 && boundaryHour !== 23) {
    throw new Error("Boundary hour must be 0 (civil) or 23 (folk).");
  }

  const effective = getEffectiveSolarDate(new Date(), boundaryHour === 23 ? "folk" : "civil");
  return new Date(Date.UTC(effective.year, effective.month - 1, effective.day));
};

const getTodayProfileFromUtcDate = (date: Date) => {
  const utc = getUtcDate(date);
  return resolveBirthProfile({
    mode: "solar",
    date: toDateString(utc),
    time: { kind: "unknown" },
  });
};

export const formatLunarMD = (date: Date): string => getTodayProfileFromUtcDate(date).lunarDateText;

export const getGanzhiYear = (date: Date): string =>
  `${getTodayProfileFromUtcDate(date).ganzhiYear}年`;

export const getLunarYear = (date: Date): number =>
  getTodayProfileFromUtcDate(date).lunarDate.year;

export const getZodiacByLunarYear = (lunarYear: number): string => {
  const lunar = Lunar.fromYmd(lunarYear, 1, 1);
  return toTraditionalChinese(`屬${lunar.getYearShengXiao()}`);
};
