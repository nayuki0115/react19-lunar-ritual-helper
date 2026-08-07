import {
  getEffectiveSolarDate,
  parseSolarDate,
  resolveBirthProfile,
  resolveTodayProfile,
  type BirthInput,
  type BirthTimeInput,
  type ShichenCode,
  type ZiPeriod,
} from "./lunar";

export type Gender = "male" | "female";
export type BirthMode = "solar" | "lunar";
export type TimeMode = "unknown" | "branch" | "exact";
export type TimeBranchValue = ShichenCode | "earlyZi" | "lateZi";

export type BirthDraftBase = {
  timeMode: TimeMode;
  timeBranch: TimeBranchValue | "";
  timeExact: string;
};

export type SolarBirthDraft = BirthDraftBase & { date: string };
export type LunarBirthDraft = BirthDraftBase & {
  year: string;
  month: string;
  day: string;
};

export type FormState = {
  gender: Gender | "";
  birthMode: BirthMode;
  solar: SolarBirthDraft;
  lunar: LunarBirthDraft;
};

export type FormField = "gender" | "solarDate" | "lunarYear" | "lunarMonth" | "lunarDay" | "time";
export type FormErrors = Partial<Record<FormField, string>>;

const emptyTimeDraft = (): BirthDraftBase => ({
  timeMode: "unknown",
  timeBranch: "",
  timeExact: "",
});

export const createDefaultFormState = (): FormState => ({
  gender: "",
  birthMode: "solar",
  solar: { date: "", ...emptyTimeDraft() },
  lunar: { year: "", month: "", day: "", ...emptyTimeDraft() },
});

export const DEFAULT_FORM_STATE: FormState = createDefaultFormState();

const compareCalendarDates = (left: { year: number; month: number; day: number }, right: typeof left) =>
  left.year - right.year || left.month - right.month || left.day - right.day;

const validateTime = (draft: BirthDraftBase, errors: FormErrors) => {
  if (draft.timeMode === "branch" && !draft.timeBranch) {
    errors.time = "請選擇出生時辰，或改選「不知道」";
  }
  if (draft.timeMode === "exact") {
    if (!draft.timeExact) errors.time = "請輸入出生時間，或改選其他選項";
    else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.timeExact)) {
      errors.time = "時間格式不正確";
    }
  }
};

const parseRequiredInteger = (value: string): number | null =>
  /^\d+$/.test(value) ? Number.parseInt(value, 10) : null;

export const validateBirthForm = (state: FormState, now = new Date()): FormErrors => {
  const errors: FormErrors = {};
  if (!state.gender) errors.gender = "請選擇性別";

  if (state.birthMode === "solar") {
    if (!state.solar.date) {
      errors.solarDate = "請選擇國曆出生日期";
    } else {
      try {
        const birthDate = parseSolarDate(state.solar.date);
        const today = getEffectiveSolarDate(now, "civil");
        if (compareCalendarDates(birthDate, today) > 0) {
          errors.solarDate = "出生日期不得晚於今天";
        } else {
          resolveBirthProfile({ mode: "solar", date: state.solar.date, time: { kind: "unknown" } });
        }
      } catch (error) {
        errors.solarDate = error instanceof RangeError
          ? "此日期不在支援範圍內"
          : "請輸入有效的國曆日期";
      }
    }
    validateTime(state.solar, errors);
  } else {
    const year = parseRequiredInteger(state.lunar.year);
    const month = parseRequiredInteger(state.lunar.month);
    const day = parseRequiredInteger(state.lunar.day);
    if (year === null) errors.lunarYear = "請輸入有效的農曆出生年";
    if (month === null || month < 1 || month > 12) errors.lunarMonth = "農曆月份必須介於 1 到 12";
    if (day === null || day < 1 || day > 30) errors.lunarDay = "農曆日期必須介於 1 到 30";

    if (year !== null) {
      const currentLunarYear = resolveTodayProfile(now, "folk").lunarDate.year;
      if (year > currentLunarYear) errors.lunarYear = "農曆出生年不得晚於目前農曆年";
      else {
        try {
          resolveBirthProfile({
            mode: "lunar", year, month: 1, day: 1, time: { kind: "unknown" },
          });
        } catch (error) {
          if (error instanceof RangeError) {
            errors.lunarYear = "此農曆年份不在支援範圍內";
          }
        }
      }
    }
    validateTime(state.lunar, errors);
  }
  return errors;
};

const toBirthTimeInput = (draft: BirthDraftBase): BirthTimeInput => {
  if (draft.timeMode === "unknown") return { kind: "unknown" };
  if (draft.timeMode === "branch") {
    const ziPeriod: ZiPeriod | undefined = draft.timeBranch === "earlyZi"
      ? "early"
      : draft.timeBranch === "lateZi"
        ? "late"
        : undefined;
    const branchInput: BirthTimeInput = {
      kind: "branch",
      branch: draft.timeBranch === "earlyZi" || draft.timeBranch === "lateZi"
        ? "zi"
        : draft.timeBranch as ShichenCode,
    };
    return ziPeriod ? { ...branchInput, ziPeriod } : branchInput;
  }
  return { kind: "exact", time: draft.timeExact };
};

export const toBirthInput = (state: FormState): BirthInput => {
  if (Object.keys(validateBirthForm(state)).length > 0) {
    throw new Error("Cannot create BirthInput from an invalid form.");
  }
  return state.birthMode === "solar"
    ? { mode: "solar", date: state.solar.date, time: toBirthTimeInput(state.solar) }
    : {
        mode: "lunar",
        year: Number(state.lunar.year),
        month: Number(state.lunar.month),
        day: Number(state.lunar.day),
        time: toBirthTimeInput(state.lunar),
      };
};
