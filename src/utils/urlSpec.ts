export const URL_KEYS = {
  gender: "g",
  birth: "b",
  birthMode: "bm",
  timeMode: "tm",
  timeBranch: "br",
  timeExact: "t",
} as const;

export type UrlState = Partial<{
  g: "m" | "f";
  b: string;
  bm: "s" | "l";
  tm: "u" | "br" | "ex";
  br: string;
  t: string;
}>;

export const URL_ALLOWED_FIELDS = {
  gender: true,
  timeMode: true,
  timeBranch: true,
  timeExact: true,
  birth: false, // 分享時才打開
};
