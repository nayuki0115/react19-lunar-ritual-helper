import { useEffect, useMemo, useState } from "react";
import { DEFAULT_FORM_STATE, FormState } from "@/utils/formSpec";
import { URL_KEYS } from "@/utils/urlSpec";
import { MESSAGES } from "@/utils/messages";

const STORAGE_KEY = "lunar-ritual-form";

/** safe JSON */
const safeParseJson = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const hasAnyValue = (obj: object) => Object.keys(obj).length > 0;

/** mapping: query -> state */
const GENDER_MAP = { m: "male", f: "female" } as const;
const TIME_MODE_MAP = { u: "unknown", br: "branch", ex: "exact" } as const;

const getQuery = () => new URLSearchParams(window.location.search);

const readFromUrl = (): Partial<FormState> => {
  const q = getQuery();
  const g = q.get(URL_KEYS.gender) as keyof typeof GENDER_MAP | null;
  const tm = q.get(URL_KEYS.timeMode) as keyof typeof TIME_MODE_MAP | null;

  const state: Partial<FormState> = {
    gender: g ? GENDER_MAP[g] : undefined,
    birthSolar: q.get(URL_KEYS.birth) ?? undefined,
    timeMode: tm ? TIME_MODE_MAP[tm] : undefined,
    timeBranch: q.get(URL_KEYS.timeBranch) ?? undefined,
    timeExact: q.get(URL_KEYS.timeExact) ?? undefined,
  };

  // 去掉 undefined，避免把 default 覆蓋成 undefined
  return Object.fromEntries(Object.entries(state).filter(([, v]) => v != null)) as Partial<FormState>;
};

const readFromStorage = (): Partial<FormState> => {
  const stored = safeParseJson<Partial<FormState>>(localStorage.getItem(STORAGE_KEY));
  return stored ?? {};
};

const applyMutexRules = (prev: FormState, next: FormState, changedKey: keyof FormState): FormState => {
  if (changedKey !== "timeMode") return next;

  if (next.timeMode === "unknown") return { ...next, timeBranch: undefined, timeExact: undefined };
  if (next.timeMode === "branch") return { ...next, timeExact: undefined };
  if (next.timeMode === "exact") return { ...next, timeBranch: undefined };
  return next;
};

export const useFormState = () => {
  const [formState, setFormState] = useState<FormState>(() => {
    const url = readFromUrl();
    if (hasAnyValue(url)) return { ...DEFAULT_FORM_STATE, ...url };
    return { ...DEFAULT_FORM_STATE, ...readFromStorage() };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  const updateField = useMemo(
    () =>
      <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setFormState((prev) => {
          const next = { ...prev, [key]: value } as FormState;
          return applyMutexRules(prev, next, key);
        });
      },
    []
  );

  const resetForm = useMemo(
    () => () => {
      localStorage.removeItem(STORAGE_KEY);
      setFormState(DEFAULT_FORM_STATE);
      window.history.replaceState({}, "", window.location.pathname);
    },
    []
  );

  const generateShareUrl = useMemo(
    () => (includeBirth = false) => {
      const p = new URLSearchParams();

      // gender
      if (formState.gender) p.set(URL_KEYS.gender, formState.gender === "male" ? "m" : "f");

      // time mode
      const tm =
        formState.timeMode === "branch" ? "br" : formState.timeMode === "exact" ? "ex" : "u";
      p.set(URL_KEYS.timeMode, tm);

      // branch/time
      if (formState.timeMode === "branch" && formState.timeBranch) p.set(URL_KEYS.timeBranch, formState.timeBranch);
      if (formState.timeMode === "exact" && formState.timeExact) p.set(URL_KEYS.timeExact, formState.timeExact);

      // birth (opt-in)
      if (includeBirth && formState.birthSolar) p.set(URL_KEYS.birth, formState.birthSolar);

      const qs = p.toString();
      return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    },
    [formState]
  );

  return {
    formState,
    updateField,
    resetForm,
    generateShareUrl,
    messages: MESSAGES,
  };
};
