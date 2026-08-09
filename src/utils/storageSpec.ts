import type { FormState, TimeBranchValue, TimeMode } from "./formSpec";
import type { DayMode } from "./lunar";

export const PERSONAL_STORAGE_KEY = "lunar-ritual-personal-v1";
export const SETTINGS_STORAGE_KEY = "lunar-ritual-settings-v1";
export const LEGACY_STORAGE_KEY = "lunar-ritual-form";

export type PersonalStorage = {
  version: 1;
  form: FormState;
};

export type SettingsStorage = {
  version: 1;
  dayMode: DayMode;
  detailsOpen: boolean;
  skipShareWarning: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";
const isTimeMode = (value: unknown): value is TimeMode =>
  value === "unknown" || value === "branch" || value === "exact";
const TIME_BRANCHES = new Set<TimeBranchValue | "">([
  "", "zi", "earlyZi", "lateZi", "chou", "yin", "mao", "chen",
  "si", "wu", "wei", "shen", "you", "xu", "hai",
]);

const isTimeDraft = (value: unknown) =>
  isRecord(value)
  && isTimeMode(value.timeMode)
  && isString(value.timeBranch)
  && TIME_BRANCHES.has(value.timeBranch as TimeBranchValue | "")
  && isString(value.timeExact);

const isFormState = (value: unknown): value is FormState => {
  if (!isRecord(value) || (value.gender !== "" && value.gender !== "male" && value.gender !== "female")) return false;
  if (value.birthMode !== "solar" && value.birthMode !== "lunar") return false;
  if (!isRecord(value.solar) || !isTimeDraft(value.solar) || !isString(value.solar.date)) return false;
  return isRecord(value.lunar)
    && isTimeDraft(value.lunar)
    && isString(value.lunar.year)
    && isString(value.lunar.month)
    && isString(value.lunar.day);
};

const parseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const encodePersonalStorage = (form: FormState): string =>
  JSON.stringify({ version: 1, form } satisfies PersonalStorage);

export const decodePersonalStorage = (raw: string): PersonalStorage | null => {
  const value = parseJson(raw);
  return isRecord(value) && value.version === 1 && isFormState(value.form)
    ? { version: 1, form: value.form }
    : null;
};

type SettingsStorageInput = Omit<SettingsStorage, "version" | "skipShareWarning"> &
  Partial<Pick<SettingsStorage, "skipShareWarning">>;

export const encodeSettingsStorage = (settings: SettingsStorageInput): string =>
  JSON.stringify({ version: 1, skipShareWarning: false, ...settings } satisfies SettingsStorage);

export const decodeSettingsStorage = (raw: string): SettingsStorage | null => {
  const value = parseJson(raw);
  return isRecord(value)
    && value.version === 1
    && (value.dayMode === "folk" || value.dayMode === "civil")
    && typeof value.detailsOpen === "boolean"
    && (value.skipShareWarning === undefined || typeof value.skipShareWarning === "boolean")
    ? {
        version: 1,
        dayMode: value.dayMode,
        detailsOpen: value.detailsOpen,
        skipShareWarning: value.skipShareWarning ?? false,
      }
    : null;
};

export type StoredPreferences = {
  personal: PersonalStorage | null;
  settings: SettingsStorage | null;
};

export const loadStoredPreferences = (storage: Storage): StoredPreferences => {
  storage.removeItem(LEGACY_STORAGE_KEY);

  const personalRaw = storage.getItem(PERSONAL_STORAGE_KEY);
  const settingsRaw = storage.getItem(SETTINGS_STORAGE_KEY);
  const personal = personalRaw ? decodePersonalStorage(personalRaw) : null;
  const settings = settingsRaw ? decodeSettingsStorage(settingsRaw) : null;

  if (personalRaw && !personal) storage.removeItem(PERSONAL_STORAGE_KEY);
  if (settingsRaw && !settings) storage.removeItem(SETTINGS_STORAGE_KEY);
  return { personal, settings };
};
