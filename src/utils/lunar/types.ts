export type DayMode = "folk" | "civil";

export type ShichenCode =
  | "zi" | "chou" | "yin" | "mao" | "chen" | "si"
  | "wu" | "wei" | "shen" | "you" | "xu" | "hai";

export type BirthTimeInput =
  | { kind: "unknown" }
  | { kind: "branch"; branch: ShichenCode }
  | { kind: "exact"; time: string };

type BirthInputBase = { time: BirthTimeInput };

export type BirthInput =
  | (BirthInputBase & { mode: "solar"; date: string })
  | (BirthInputBase & { mode: "lunar"; year: number; month: number; day: number });

export type CalendarDate = { year: number; month: number; day: number };

export type LunarDate = {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
};

export type BirthProfile = {
  source: BirthInput["mode"];
  lunarDate: LunarDate;
  ganzhiYear: string;
  zodiac: string;
  lunarDateText: string;
  shichenText: string;
  birthText: string;
  userProvidedLunarDate: boolean;
};

export type TodayProfile = {
  mode: DayMode;
  solarDate: CalendarDate;
  lunarDate: LunarDate;
  lunarDateText: string;
  ganzhiYear: string;
  zodiac: string;
};
