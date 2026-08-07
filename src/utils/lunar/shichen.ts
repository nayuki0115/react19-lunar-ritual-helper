import type { BirthTimeInput, ShichenCode } from "./types";

const SHICHEN_LABELS: Record<ShichenCode, string> = {
  zi: "子", chou: "丑", yin: "寅", mao: "卯", chen: "辰", si: "巳",
  wu: "午", wei: "未", shen: "申", you: "酉", xu: "戌", hai: "亥",
};

const parseClock = (value: string): { hour: number; minute: number } | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  return hour <= 23 && minute <= 59 ? { hour, minute } : null;
};

export const mapClockToShichen = (value: string): ShichenCode | null => {
  const clock = parseClock(value);
  if (!clock) return null;
  if (clock.hour === 23 || clock.hour === 0) return "zi";
  return ([
    "zi", "chou", "yin", "mao", "chen", "si",
    "wu", "wei", "shen", "you", "xu", "hai",
  ] as const)[Math.floor((clock.hour + 1) / 2)] ?? null;
};

export const formatBirthTime = (time: BirthTimeInput): string => {
  if (time.kind === "unknown") return "吉時";
  if (time.kind === "branch") {
    if (time.branch === "zi" && time.ziPeriod === "early") return "早子時";
    if (time.branch === "zi" && time.ziPeriod === "late") return "夜子時";
    return `${SHICHEN_LABELS[time.branch]}時`;
  }
  const clock = parseClock(time.time);
  if (!clock) throw new Error("Invalid clock time. Expected HH:mm.");
  if (clock.hour === 23) return "夜子時";
  if (clock.hour === 0) return "早子時";
  const branch = mapClockToShichen(time.time);
  if (!branch) throw new Error("Invalid clock time. Expected HH:mm.");
  return `${SHICHEN_LABELS[branch]}時`;
};
