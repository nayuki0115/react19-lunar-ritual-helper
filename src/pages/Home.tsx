import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  formatLunarMD,
  formatLunarBirthday,
  getEffectiveToday,
  getGanzhiYear,
  getLunarYearGanzhi,
  getRocYearFromLunarYear,
  getZodiac,
  mapToShichenLabel,
  parseBirthDateTz,
} from "../utils/lunar";

type Gender = "male" | "female";
type BirthTimeKind = "shichen" | "clock" | "unknown";

type FormValue = {
  gender: Gender | "";
  birthDate: string; // YYYY-MM-DD
  birthTimeKind: BirthTimeKind;
  shichen: string;
  clockTime: string; // HH:mm
};

const DEFAULT_FORM_VALUE: FormValue = {
  gender: "",
  birthDate: "",
  birthTimeKind: "unknown",
  shichen: "",
  clockTime: "",
};

const SHICHEN_OPTIONS = [
  { value: "zi", label: "子（23:00–01:00）" },
  { value: "chou", label: "丑（01:00–03:00）" },
  { value: "yin", label: "寅（03:00–05:00）" },
  { value: "mao", label: "卯（05:00–07:00）" },
  { value: "chen", label: "辰（07:00–09:00）" },
  { value: "si", label: "巳（09:00–11:00）" },
  { value: "wu", label: "午（11:00–13:00）" },
  { value: "wei", label: "未（13:00–15:00）" },
  { value: "shen", label: "申（15:00–17:00）" },
  { value: "you", label: "酉（17:00–19:00）" },
  { value: "xu", label: "戌（19:00–21:00）" },
  { value: "hai", label: "亥（21:00–23:00）" },
] as const;

const SHICHEN_SET = new Set<string>(SHICHEN_OPTIONS.map((x) => x.value));

const isGender = (v: string | null): v is Gender => v === "male" || v === "female";

const isBirthTimeKind = (v: string | null): v is BirthTimeKind =>
  v === "shichen" || v === "clock" || v === "unknown";

const isDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v: string): boolean => /^\d{2}:\d{2}$/.test(v);

const parseSearchParams = (params: URLSearchParams): FormValue => {
  const genderRaw = params.get("gender");
  const birthDateRaw = params.get("birthDate") ?? "";
  const birthTimeKindRaw = params.get("birthTimeKind");
  const shichenRaw = params.get("shichen") ?? "";
  const clockTimeRaw = params.get("clockTime") ?? "";

  const gender = isGender(genderRaw) ? genderRaw : "";
  const birthDate = isDate(birthDateRaw) ? birthDateRaw : "";
  const birthTimeKind = isBirthTimeKind(birthTimeKindRaw) ? birthTimeKindRaw : "unknown";

  if (birthTimeKind === "shichen") {
    return {
      gender,
      birthDate,
      birthTimeKind,
      shichen: SHICHEN_SET.has(shichenRaw) ? shichenRaw : "",
      clockTime: "",
    };
  }

  if (birthTimeKind === "clock") {
    return {
      gender,
      birthDate,
      birthTimeKind,
      shichen: "",
      clockTime: isTime(clockTimeRaw) ? clockTimeRaw : "",
    };
  }

  return {
    gender,
    birthDate,
    birthTimeKind: "unknown",
    shichen: "",
    clockTime: "",
  };
};

const serializeSearchParams = (value: FormValue): URLSearchParams => {
  const p = new URLSearchParams();

  if (value.gender) p.set("gender", value.gender);
  if (isDate(value.birthDate)) p.set("birthDate", value.birthDate);
  p.set("birthTimeKind", value.birthTimeKind);

  if (value.birthTimeKind === "shichen" && SHICHEN_SET.has(value.shichen)) {
    p.set("shichen", value.shichen);
  }

  if (value.birthTimeKind === "clock" && isTime(value.clockTime)) {
    p.set("clockTime", value.clockTime);
  }

  return p;
};

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const committedValue = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const [formValue, setFormValue] = useState<FormValue>(committedValue);
  const [isLoading, setIsLoading] = useState(false);

  const loadingTimerRef = useRef<number | null>(null);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFormValue(committedValue);
  }, [committedValue]);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current !== null) {
        window.clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const canSubmit = Boolean(formValue.gender && formValue.birthDate);
  const hasCommittedResult = Boolean(committedValue.gender && committedValue.birthDate);

  const effectiveToday = useMemo(() => getEffectiveToday(23, "Asia/Taipei"), []);
  const effectiveYear = effectiveToday.getUTCFullYear();

  const todayLunarMd = useMemo(() => formatLunarMD(effectiveToday), [effectiveToday]);
  const todayGanzhiYear = useMemo(() => getGanzhiYear(effectiveToday), [effectiveToday]);

  const birthDateObject = useMemo(() => {
    if (!committedValue.birthDate) return null;

    try {
      return parseBirthDateTz(committedValue.birthDate);
    } catch {
      return null;
    }
  }, [committedValue.birthDate]);

  const lunarYearDisplay = useMemo(() => {
    if (!birthDateObject) return "--";
    return `${getLunarYearGanzhi(birthDateObject)}年（${getRocYearFromLunarYear(birthDateObject)}年）`;
  }, [birthDateObject]);

  const lunarBirthdayDisplay = useMemo(() => {
    if (!birthDateObject) return "--";
    return formatLunarBirthday(birthDateObject);
  }, [birthDateObject]);

  const shichenDisplay = useMemo(
    () =>
      mapToShichenLabel(
        committedValue.birthTimeKind,
        committedValue.shichen || undefined,
        committedValue.clockTime || undefined,
      ),
    [committedValue.birthTimeKind, committedValue.shichen, committedValue.clockTime],
  );

  const zodiacDisplay = useMemo(() => {
    if (!birthDateObject) return "--";
    return getZodiac(birthDateObject);
  }, [birthDateObject]);

  const handRecommendation = useMemo(() => {
    if (committedValue.gender === "male") return "左手";
    if (committedValue.gender === "female") return "右手";
    return "--";
  }, [committedValue.gender]);

  const suiAge = useMemo(() => {
    if (!committedValue.birthDate) return null;
    const birthYear = Number.parseInt(committedValue.birthDate.slice(0, 4), 10);
    if (Number.isNaN(birthYear)) return null;
    return effectiveYear - birthYear + 1;
  }, [committedValue.birthDate, effectiveYear]);

  const suiAgeSummary = useMemo(() => {
    if (suiAge === null || !committedValue.birthDate) return "虛歲 = 今年年分 - 出生年 + 1（需先填生日）";
    const birthYear = Number.parseInt(committedValue.birthDate.slice(0, 4), 10);
    return `虛歲 = ${effectiveYear} - ${birthYear} + 1 = ${suiAge}`;
  }, [suiAge, committedValue.birthDate, effectiveYear]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSearchParams(serializeSearchParams(formValue)); // push
    setIsLoading(true);

    if (loadingTimerRef.current !== null) {
      window.clearTimeout(loadingTimerRef.current);
    }

    loadingTimerRef.current = window.setTimeout(() => {
      setIsLoading(false);

      if (window.matchMedia("(max-width: 767px)").matches) {
        resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 900);
  };

  const handleReset = () => {
    if (loadingTimerRef.current !== null) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    setIsLoading(false);
    setFormValue(DEFAULT_FORM_VALUE);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-(--color-text-primary)">
          疏文填寫助手
        </h1>
        <p className="mt-2 max-w-3xl text-(--color-text-secondary)">
          輸入生日與性別，快速整理疏文所需資料（農曆生日、生肖、虛歲、生辰）。
        </p>
      </section>

      {/* Main Content */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Input */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-(--color-text-primary)">輸入資料</h2>
            <p className="mt-1 text-sm text-(--color-text-secondary)">先用假資料示意版面，之後再接表單。</p>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <fieldset className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                <legend className="px-1 text-xs text-(--color-text-muted)">性別（必填）</legend>
                <div className="mt-2 flex gap-4">
                  <label className="inline-flex items-center gap-2 text-(--color-text-primary)">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formValue.gender === "male"}
                      onChange={() => setFormValue((prev) => ({ ...prev, gender: "male" }))}
                      className="h-4 w-4 border-(--color-border) text-(--color-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                    />
                    男
                  </label>
                  <label className="inline-flex items-center gap-2 text-(--color-text-primary)">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formValue.gender === "female"}
                      onChange={() => setFormValue((prev) => ({ ...prev, gender: "female" }))}
                      className="h-4 w-4 border-(--color-border) text-(--color-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                    />
                    女
                  </label>
                </div>
              </fieldset>

              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                <label htmlFor="birthDate" className="text-xs text-(--color-text-muted)">
                  生日（必填）
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={formValue.birthDate}
                  onChange={(e) => setFormValue((prev) => ({ ...prev, birthDate: e.target.value }))}
                  className="mt-2 block w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                />
              </div>

              <fieldset className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                <legend className="px-1 text-xs text-(--color-text-muted)">出生時間（選填）</legend>

                <div className="mt-2 grid gap-2">
                  <label className="inline-flex items-center gap-2 text-(--color-text-primary)">
                    <input
                      type="radio"
                      name="birthTimeKind"
                      value="shichen"
                      checked={formValue.birthTimeKind === "shichen"}
                      onChange={() =>
                        setFormValue((prev) => ({
                          ...prev,
                          birthTimeKind: "shichen",
                          clockTime: "",
                        }))
                      }
                      className="h-4 w-4 border-(--color-border) text-(--color-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                    />
                    知道時辰
                  </label>

                  <label className="inline-flex items-center gap-2 text-(--color-text-primary)">
                    <input
                      type="radio"
                      name="birthTimeKind"
                      value="clock"
                      checked={formValue.birthTimeKind === "clock"}
                      onChange={() =>
                        setFormValue((prev) => ({
                          ...prev,
                          birthTimeKind: "clock",
                          shichen: "",
                        }))
                      }
                      className="h-4 w-4 border-(--color-border) text-(--color-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                    />
                    知道幾點幾分
                  </label>

                  <label className="inline-flex items-center gap-2 text-(--color-text-primary)">
                    <input
                      type="radio"
                      name="birthTimeKind"
                      value="unknown"
                      checked={formValue.birthTimeKind === "unknown"}
                      onChange={() =>
                        setFormValue((prev) => ({
                          ...prev,
                          birthTimeKind: "unknown",
                          shichen: "",
                          clockTime: "",
                        }))
                      }
                      className="h-4 w-4 border-(--color-border) text-(--color-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                    />
                    不知道
                  </label>
                </div>

                {formValue.birthTimeKind === "shichen" && (
                  <div className="mt-3">
                    <label htmlFor="shichen" className="text-xs text-(--color-text-muted)">
                      時辰
                    </label>
                    <select
                      id="shichen"
                      value={formValue.shichen}
                      onChange={(e) => setFormValue((prev) => ({ ...prev, shichen: e.target.value }))}
                      className="mt-2 block w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                    >
                      <option value="">請選擇時辰</option>
                      {SHICHEN_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formValue.birthTimeKind === "clock" && (
                  <div className="mt-3">
                    <label htmlFor="clockTime" className="text-xs text-(--color-text-muted)">
                      時間
                    </label>
                    <input
                      id="clockTime"
                      type="time"
                      value={formValue.clockTime}
                      onChange={(e) => setFormValue((prev) => ({ ...prev, clockTime: e.target.value }))}
                      className="mt-2 block w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                    />
                  </div>
                )}

                <div className="mt-2 text-xs text-(--color-text-muted)">
                  不知道出生時間也沒關係：可改用「時辰」或選擇「未知」。
                </div>
              </fieldset>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full rounded-xl bg-(--color-accent) py-2.5 text-white hover:bg-(--color-accent-hover) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  產生結果
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-muted) py-2.5 text-(--color-text-primary) hover:bg-(--color-surface) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
                >
                  重填
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Result */}
        <div ref={resultSectionRef} className="lg:col-span-7">
          <div className="grid gap-4">
            {/* Card 1 */}
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 md:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-(--color-text-primary)">歲次、天運（今天農曆）</h3>
                <span className="rounded-full bg-(--color-bg-muted) px-2 py-1 text-xs text-(--color-text-secondary)">
                  不需輸入
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                  <div className="text-xs text-(--color-text-muted)">歲次</div>
                  <div className="mt-1 text-lg font-semibold text-(--color-text-primary)">{todayGanzhiYear}</div>
                </div>
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                  <div className="text-xs text-(--color-text-muted)">今天農曆</div>
                  <div className="mt-1 text-lg font-semibold text-(--color-text-primary)">{todayLunarMd}</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-(--color-text-secondary)">
                天運：{todayGanzhiYear}（Asia/Taipei，23:00 日界線）
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 md:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-(--color-text-primary)">生辰、命宮、本命（農曆生日）</h3>
                <span className="rounded-full bg-(--color-bg-muted) px-2 py-1 text-xs text-(--color-text-secondary)">
                  需生日
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                  <div className="text-xs text-(--color-text-muted)">農曆年</div>
                  <div className="mt-1 text-lg font-semibold text-(--color-text-primary)">{lunarYearDisplay}</div>
                </div>
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                  <div className="text-xs text-(--color-text-muted)">農曆生日</div>
                  <div className="mt-1 text-lg font-semibold text-(--color-text-primary)">{lunarBirthdayDisplay}</div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                  <div className="text-xs text-(--color-text-muted)">生辰（時辰）</div>
                  <div className="mt-1 text-lg font-semibold text-(--color-text-primary)">{shichenDisplay}</div>
                </div>
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                  <div className="text-xs text-(--color-text-muted)">生肖</div>
                  <div className="mt-1 text-lg font-semibold text-(--color-text-primary)">{zodiacDisplay}</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 md:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-(--color-text-primary)">歲數（虛歲）</h3>
                <span className="rounded-full bg-(--color-bg-muted) px-2 py-1 text-xs text-(--color-text-secondary)">
                  需生日
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                  <div className="text-xs text-(--color-text-muted)">虛歲</div>
                  <div className="mt-1 text-2xl font-bold text-(--color-text-primary)">{suiAge ?? "--"}</div>
                </div>
                <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                  <div className="text-xs text-(--color-text-muted)">算法摘要</div>
                  <div className="mt-1 text-sm text-(--color-text-primary)">{suiAgeSummary}</div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 md:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-(--color-text-primary)">手印提醒</h3>
                <span className="rounded-full bg-(--color-bg-muted) px-2 py-1 text-xs text-(--color-text-secondary)">
                  需性別
                </span>
              </div>

              <div className="mt-3 rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-4">
                <div className="text-sm text-(--color-text-primary)">
                  蓋手印規則：<span className="font-semibold">男左女右</span>
                </div>
                <div className="mt-2 text-lg font-semibold text-(--color-text-primary)">
                  建議使用：{handRecommendation}
                </div>
                <div className="mt-1 text-xs text-(--color-text-muted)">※ 如果疏文上有指定，請以疏文為主</div>
              </div>
            </div>

            {hasCommittedResult && committedValue.birthTimeKind === "unknown" && (
              <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 md:p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-(--color-text-primary)">今日建議吉時（示意）</h3>
                  <span className="rounded-full bg-(--color-bg-muted) px-2 py-1 text-xs text-(--color-text-secondary)">
                    v0
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                    <div className="text-xs text-(--color-text-muted)">上午</div>
                    <div className="mt-1 text-lg font-semibold text-(--color-text-primary)">09:00 - 11:00</div>
                  </div>
                  <div className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                    <div className="text-xs text-(--color-text-muted)">下午</div>
                    <div className="mt-1 text-lg font-semibold text-(--color-text-primary)">15:00 - 17:00</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Teaser（可先留著） */}
      {/* <section className="mt-12">
        <h2 className="text-xl font-semibold text-(--color-text-primary)">常見問題</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 text-(--color-text-primary)">
            不知道出生時間怎麼辦？
          </div>
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 text-(--color-text-primary)">
            虛歲怎麼算？
          </div>
        </div>
      </section> */}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-bg)/80 backdrop-blur-sm">
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-3 text-sm font-medium text-(--color-text-primary)">
            載入中...
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;


