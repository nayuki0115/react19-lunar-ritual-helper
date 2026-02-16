export type Gender = "male" | "female";
export type BirthMode = "solar" | "lunar";
export type TimeMode = "unknown" | "branch" | "exact";

export type FormState = {
  gender?: Gender;

  birthMode: BirthMode;
  birthSolar?: string;

  timeMode: TimeMode;
  timeBranch?: string;
  timeExact?: string;

  tz: string;
};

export const DEFAULT_FORM_STATE: FormState = {
  gender: undefined,
  birthMode: "solar",
  birthSolar: undefined,

  timeMode: "unknown",
  timeBranch: undefined,
  timeExact: undefined,

  tz: "Asia/Taipei",
};
