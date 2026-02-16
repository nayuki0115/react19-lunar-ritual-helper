export type TimeBranchKey =
  | "zi" | "chou" | "yin" | "mao"
  | "chen" | "si" | "wu" | "wei"
  | "shen" | "you" | "xu" | "hai";

export const TIME_BRANCHES: Record<
  TimeBranchKey,
  {
    label: string;
    range: string;
    start: string;
    end: string;
  }
> = {
  zi:   { label: "子時", range: "23:00–00:59", start: "23:00", end: "00:59" },
  chou: { label: "丑時", range: "01:00–02:59", start: "01:00", end: "02:59" },
  yin:  { label: "寅時", range: "03:00–04:59", start: "03:00", end: "04:59" },
  mao:  { label: "卯時", range: "05:00–06:59", start: "05:00", end: "06:59" },
  chen: { label: "辰時", range: "07:00–08:59", start: "07:00", end: "08:59" },
  si:   { label: "巳時", range: "09:00–10:59", start: "09:00", end: "10:59" },
  wu:   { label: "午時", range: "11:00–12:59", start: "11:00", end: "12:59" },
  wei:  { label: "未時", range: "13:00–14:59", start: "13:00", end: "14:59" },
  shen: { label: "申時", range: "15:00–16:59", start: "15:00", end: "16:59" },
  you:  { label: "酉時", range: "17:00–18:59", start: "17:00", end: "18:59" },
  xu:   { label: "戌時", range: "19:00–20:59", start: "19:00", end: "20:59" },
  hai:  { label: "亥時", range: "21:00–22:59", start: "21:00", end: "22:59" },
};
