import { vi } from "vitest";

export const TAIPEI_TIME_ZONE = "Asia/Taipei";

const TAIPEI_OFFSET_PATTERN = /\+08:00$/;

export const setTaipeiSystemTime = (isoDateTime: string): Date => {
  if (!TAIPEI_OFFSET_PATTERN.test(isoDateTime)) {
    throw new Error("Taipei test time must include the +08:00 offset.");
  }

  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid Taipei test time.");
  }

  vi.useFakeTimers();
  vi.setSystemTime(date);

  return date;
};
