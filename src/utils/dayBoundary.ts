import { TAIPEI_TIME_ZONE, type CalendarDate, type DayMode } from "./lunar";

const getTaipeiDate = (now: Date): CalendarDate => {
  if (Number.isNaN(now.getTime())) throw new Error("Invalid current date.");

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TAIPEI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
};

const addCalendarDay = (date: CalendarDate): CalendarDate => {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + 1));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
};

const taipeiInstant = (date: CalendarDate, hour: number) =>
  new Date(Date.UTC(date.year, date.month - 1, date.day, hour - 8));

export const getNextDayBoundary = (now: Date, mode: DayMode): Date => {
  const today = getTaipeiDate(now);
  if (mode === "civil") return taipeiInstant(addCalendarDay(today), 0);

  const tonight = taipeiInstant(today, 23);
  return now.getTime() < tonight.getTime()
    ? tonight
    : taipeiInstant(addCalendarDay(today), 23);
};

export const getDayBoundaryDelay = (now: Date, mode: DayMode): number =>
  Math.max(0, getNextDayBoundary(now, mode).getTime() - now.getTime());
