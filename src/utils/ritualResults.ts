import {
  calculateSuiAge,
  resolveBirthProfile,
  resolveTodayProfile,
  type BirthInput,
  type DayMode,
} from "./lunar";
import type { Gender } from "./formSpec";

export type RitualResultViewModel = {
  todayGanzhiYear: string;
  todayLunarDate: string;
  currentZodiac: string;
  birthText: string;
  birthZodiac: string;
  suiAge: number;
  handprint: string;
  source: BirthInput["mode"];
  sourceLabel: string;
  originalBirthInput: string;
  originalTimeInput: string;
  birthRule: string;
  todayRule: string;
  suiAgeFormula: string;
};

const formatOriginalTime = (input: BirthInput): string => {
  if (input.time.kind === "unknown") return "不知道（結果使用吉時）";
  const profile = resolveBirthProfile(input);
  if (input.time.kind === "exact") return `${input.time.time}（換算為${profile.shichenText}）`;
  return profile.shichenText;
};

export const createRitualResultViewModel = (
  input: BirthInput,
  gender: Gender,
  now: Date,
  dayMode: DayMode = "folk",
): RitualResultViewModel => {
  const birth = resolveBirthProfile(input);
  const today = resolveTodayProfile(now, dayMode);
  const suiAge = calculateSuiAge(today.lunarDate.year, birth.lunarDate.year);

  return {
    todayGanzhiYear: `${today.ganzhiYear}年`,
    todayLunarDate: today.lunarDateText,
    currentZodiac: `屬${today.zodiac}`,
    birthText: birth.birthText,
    birthZodiac: `屬${birth.zodiac}`,
    suiAge,
    handprint: gender === "male" ? "左手印" : "右手印",
    source: input.mode,
    sourceLabel: input.mode === "solar" ? "由國曆出生日期自動換算" : "使用者直接提供農曆資料",
    originalBirthInput: input.mode === "solar"
      ? `國曆 ${input.date}`
      : `農曆 ${input.year} 年 ${input.month} 月 ${input.day} 日`,
    originalTimeInput: formatOriginalTime(input),
    birthRule: "出生資料採台北民用日期，於 00:00 換日；夜子時不會推進出生日期。",
    todayRule: dayMode === "folk"
      ? "今日資料採民俗模式，台北時間 23:00 起視為隔日。"
      : "今日資料採民用模式，台北時間 00:00 起視為隔日。",
    suiAgeFormula: `${today.lunarDate.year} - ${birth.lunarDate.year} + 1 = ${suiAge}`,
  };
};
