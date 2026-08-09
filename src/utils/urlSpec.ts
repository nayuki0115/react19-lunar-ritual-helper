import {
  createDefaultFormState,
  validateBirthForm,
  type FormState,
  type TimeBranchValue,
  type TimeMode,
} from "./formSpec";
import type { DayMode } from "./lunar";

export const URL_KEYS = {
  version: "v",
  birthMode: "bm",
  gender: "g",
  birth: "b",
  lunarYear: "ly",
  lunarMonth: "lm",
  lunarDay: "ld",
  timeMode: "tm",
  timeBranch: "br",
  timeExact: "t",
  dayMode: "dm",
} as const;

const LEGACY_KEYS = {
  gender: "gender",
  birth: "birthDate",
  timeMode: "birthTimeKind",
  timeBranch: "shichen",
  timeExact: "clockTime",
} as const;

const SHARE_KEYS = new Set<string>([...Object.values(URL_KEYS), ...Object.values(LEGACY_KEYS)]);
const TIME_BRANCHES = new Set<TimeBranchValue>([
  "zi", "earlyZi", "lateZi", "chou", "yin", "mao", "chen",
  "si", "wu", "wei", "shen", "you", "xu", "hai",
]);

export type SharedFormState = {
  form: FormState;
  dayMode: DayMode;
};

export type DecodedShareState =
  | { status: "none" }
  | { status: "invalid" }
  | ({ status: "valid" } & SharedFormState);

const preferred = (params: URLSearchParams, shortKey: string, legacyKey?: string) =>
  params.has(shortKey) ? params.get(shortKey) : legacyKey ? params.get(legacyKey) : null;

const decodeGender = (value: string | null): FormState["gender"] | null => {
  if (value === "m" || value === "male") return "male";
  if (value === "f" || value === "female") return "female";
  return null;
};

const decodeTimeMode = (value: string | null): TimeMode | null => {
  if (value === "u" || value === "unknown") return "unknown";
  if (value === "br" || value === "shichen") return "branch";
  if (value === "ex" || value === "clock") return "exact";
  return null;
};

export const decodeShareParams = (
  params: URLSearchParams,
  now = new Date(),
): DecodedShareState => {
  if (![...params.keys()].some((key) => SHARE_KEYS.has(key))) return { status: "none" };
  if (params.has(URL_KEYS.version) && params.get(URL_KEYS.version) !== "1") {
    return { status: "invalid" };
  }

  const form = createDefaultFormState();
  const birthModeRaw = params.get(URL_KEYS.birthMode);
  if (birthModeRaw !== null && birthModeRaw !== "s" && birthModeRaw !== "l") {
    return { status: "invalid" };
  }
  form.birthMode = birthModeRaw === "l" ? "lunar" : "solar";

  const gender = decodeGender(preferred(params, URL_KEYS.gender, LEGACY_KEYS.gender));
  const timeMode = decodeTimeMode(preferred(params, URL_KEYS.timeMode, LEGACY_KEYS.timeMode));
  if (!gender || !timeMode) return { status: "invalid" };
  form.gender = gender;

  if (form.birthMode === "solar") {
    form.solar.date = preferred(params, URL_KEYS.birth, LEGACY_KEYS.birth) ?? "";
  } else {
    form.lunar.year = params.get(URL_KEYS.lunarYear) ?? "";
    form.lunar.month = params.get(URL_KEYS.lunarMonth) ?? "";
    form.lunar.day = params.get(URL_KEYS.lunarDay) ?? "";
  }

  const activeDraft = form[form.birthMode];
  activeDraft.timeMode = timeMode;
  if (timeMode === "branch") {
    const branch = preferred(params, URL_KEYS.timeBranch, LEGACY_KEYS.timeBranch);
    if (!branch || !TIME_BRANCHES.has(branch as TimeBranchValue)) return { status: "invalid" };
    activeDraft.timeBranch = branch as TimeBranchValue;
  } else if (timeMode === "exact") {
    activeDraft.timeExact = preferred(params, URL_KEYS.timeExact, LEGACY_KEYS.timeExact) ?? "";
  }

  const dayModeRaw = params.get(URL_KEYS.dayMode);
  const dayMode = dayModeRaw === null ? "folk" : dayModeRaw;
  if (dayMode !== "folk" && dayMode !== "civil") return { status: "invalid" };
  if (Object.keys(validateBirthForm(form, now)).length > 0) return { status: "invalid" };
  return { status: "valid", form, dayMode };
};

export const encodeShareParams = ({ form, dayMode }: SharedFormState): URLSearchParams => {
  const params = new URLSearchParams();
  params.set(URL_KEYS.version, "1");
  params.set(URL_KEYS.birthMode, form.birthMode === "solar" ? "s" : "l");
  params.set(URL_KEYS.gender, form.gender === "male" ? "m" : "f");

  const activeDraft = form[form.birthMode];
  if (form.birthMode === "solar") {
    params.set(URL_KEYS.birth, form.solar.date);
  } else {
    params.set(URL_KEYS.lunarYear, form.lunar.year);
    params.set(URL_KEYS.lunarMonth, form.lunar.month);
    params.set(URL_KEYS.lunarDay, form.lunar.day);
  }

  const encodedTimeMode = activeDraft.timeMode === "unknown"
    ? "u"
    : activeDraft.timeMode === "branch" ? "br" : "ex";
  params.set(URL_KEYS.timeMode, encodedTimeMode);
  if (activeDraft.timeMode === "branch") params.set(URL_KEYS.timeBranch, activeDraft.timeBranch);
  if (activeDraft.timeMode === "exact") params.set(URL_KEYS.timeExact, activeDraft.timeExact);
  params.set(URL_KEYS.dayMode, dayMode);
  return params;
};

export const createShareUrl = (location: Location, state: SharedFormState): string => {
  const url = new URL(location.href);
  url.search = encodeShareParams(state).toString();
  url.hash = "";
  return url.toString();
};

export const clearShareParams = (location: Location, history: History) => {
  const url = new URL(location.href);
  url.search = "";
  history.replaceState(null, "", `${url.pathname}${url.hash}`);
};
