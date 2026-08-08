import { useRef, useState, type FormEvent } from "react";
import { getEffectiveSolarDate, type BirthInput } from "@/utils/lunar";
import RitualResults from "@/components/RitualResults";
import { useDayBoundaryClock } from "@/hooks/useDayBoundaryClock";
import {
  createDefaultFormState,
  toBirthInput,
  validateBirthForm,
  type BirthMode,
  type FormErrors,
  type FormState,
  type TimeBranchValue,
  type TimeMode,
} from "@/utils/formSpec";

const SHICHEN_OPTIONS: ReadonlyArray<{ value: TimeBranchValue; label: string }> = [
  { value: "zi", label: "子時（不確定早晚）" },
  { value: "earlyZi", label: "早子時（00:00–00:59）" },
  { value: "lateZi", label: "夜子時（23:00–23:59）" },
  { value: "chou", label: "丑時（01:00–02:59）" },
  { value: "yin", label: "寅時（03:00–04:59）" },
  { value: "mao", label: "卯時（05:00–06:59）" },
  { value: "chen", label: "辰時（07:00–08:59）" },
  { value: "si", label: "巳時（09:00–10:59）" },
  { value: "wu", label: "午時（11:00–12:59）" },
  { value: "wei", label: "未時（13:00–14:59）" },
  { value: "shen", label: "申時（15:00–16:59）" },
  { value: "you", label: "酉時（17:00–18:59）" },
  { value: "xu", label: "戌時（19:00–20:59）" },
  { value: "hai", label: "亥時（21:00–22:59）" },
];

const fieldClass =
  "mt-2 block w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)";

const ErrorMessage = ({ id, children }: { id: string; children?: string }) =>
  children ? <p id={id} className="mt-2 text-sm text-(--color-state-error)" role="alert">{children}</p> : null;

const Home = () => {
  const [formState, setFormState] = useState<FormState>(createDefaultFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedInput, setSubmittedInput] = useState<BirthInput | null>(null);
  const [submittedGender, setSubmittedGender] = useState<FormState["gender"]>("");
  const resultSectionRef = useRef<HTMLDivElement>(null);

  const { mode: dayMode, setMode: setDayMode, now } = useDayBoundaryClock();
  const civilToday = getEffectiveSolarDate(now, "civil");
  const maxSolarDate = `${civilToday.year}-${String(civilToday.month).padStart(2, "0")}-${String(civilToday.day).padStart(2, "0")}`;
  const updateForm = (updater: (previous: FormState) => FormState) => {
    setFormState((previous) => {
      const next = updater(previous);
      if (hasSubmitted) setErrors(validateBirthForm(next, now));
      return next;
    });
  };

  const updateMode = (birthMode: BirthMode) =>
    updateForm((previous) => ({ ...previous, birthMode }));

  const updateTimeMode = (timeMode: TimeMode) =>
    updateForm((previous) => ({
      ...previous,
      [previous.birthMode]: {
        ...previous[previous.birthMode],
        timeMode,
      },
    }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateBirthForm(formState, now);
    setHasSubmitted(true);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmittedInput(toBirthInput(formState));
    setSubmittedGender(formState.gender);
    requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultSectionRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  };

  const handleReset = () => {
    setFormState(createDefaultFormState());
    setErrors({});
    setHasSubmitted(false);
    setSubmittedInput(null);
    setSubmittedGender("");
  };

  const activeDraft = formState[formState.birthMode];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-(--color-text-primary) md:text-3xl">疏文填寫助手</h1>
        <p className="mt-2 max-w-3xl text-(--color-text-secondary)">
          輸入出生資料，系統會整理農曆生日、生肖、虛歲與生辰。
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-(--color-text-primary)">輸入資料</h2>
            <p className="mt-1 text-sm text-(--color-text-secondary)">標示必填的欄位完成後即可產生疏文資料。</p>

            <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate>
              <fieldset className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                <legend className="px-1 text-sm font-medium text-(--color-text-primary)">出生日期輸入方式</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["solar", "lunar"] as const).map((mode) => (
                    <label key={mode} className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${formState.birthMode === mode ? "border-(--color-accent) bg-(--color-surface) font-semibold text-(--color-accent-text)" : "border-(--color-border) text-(--color-text-secondary)"}`}>
                      <input type="radio" name="birthMode" value={mode} className="sr-only" checked={formState.birthMode === mode} onChange={() => updateMode(mode)} />
                      {mode === "solar" ? "國曆自動換算" : "已知農曆日期"}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-(--color-text-muted)">切換模式時，兩邊已輸入的草稿都會保留。</p>
              </fieldset>

              <fieldset className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                <legend className="px-1 text-sm font-medium text-(--color-text-primary)">性別（必填）</legend>
                <div className="mt-2 flex gap-6">
                  {(["male", "female"] as const).map((gender) => (
                    <label key={gender} className="inline-flex items-center gap-2 text-(--color-text-primary)">
                      <input type="radio" name="gender" value={gender} checked={formState.gender === gender} onChange={() => updateForm((previous) => ({ ...previous, gender }))} className="h-4 w-4 accent-(--color-accent)" />
                      {gender === "male" ? "男" : "女"}
                    </label>
                  ))}
                </div>
                <ErrorMessage id="gender-error">{errors.gender}</ErrorMessage>
              </fieldset>

              <section className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3" aria-labelledby="birthday-heading">
                <h3 id="birthday-heading" className="text-sm font-medium text-(--color-text-primary)">出生日期（必填）</h3>
                {formState.birthMode === "solar" ? (
                  <>
                    <label htmlFor="solar-date" className="mt-3 block text-xs text-(--color-text-muted)">國曆出生日期</label>
                    <input id="solar-date" type="date" max={maxSolarDate} value={formState.solar.date} aria-invalid={Boolean(errors.solarDate)} aria-describedby={errors.solarDate ? "solar-date-error" : "solar-date-hint"} onChange={(event) => updateForm((previous) => ({ ...previous, solar: { ...previous.solar, date: event.target.value } }))} className={fieldClass} />
                    <p id="solar-date-hint" className="mt-2 text-xs text-(--color-text-muted)">系統會自動換算農曆日期，並保留閏月資訊。</p>
                    <ErrorMessage id="solar-date-error">{errors.solarDate}</ErrorMessage>
                  </>
                ) : (
                  <>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <label className="text-xs text-(--color-text-muted)">農曆出生年（西元年份）
                        <input inputMode="numeric" placeholder="例：1992" value={formState.lunar.year} aria-invalid={Boolean(errors.lunarYear)} onChange={(event) => updateForm((previous) => ({ ...previous, lunar: { ...previous.lunar, year: event.target.value } }))} className={fieldClass} />
                      </label>
                      <label className="text-xs text-(--color-text-muted)">月份
                        <input type="number" min="1" max="12" placeholder="1–12" value={formState.lunar.month} aria-invalid={Boolean(errors.lunarMonth)} onChange={(event) => updateForm((previous) => ({ ...previous, lunar: { ...previous.lunar, month: event.target.value } }))} className={fieldClass} />
                      </label>
                      <label className="text-xs text-(--color-text-muted)">日期
                        <input type="number" min="1" max="30" placeholder="1–30" value={formState.lunar.day} aria-invalid={Boolean(errors.lunarDay)} onChange={(event) => updateForm((previous) => ({ ...previous, lunar: { ...previous.lunar, day: event.target.value } }))} className={fieldClass} />
                      </label>
                    </div>
                    <ErrorMessage id="lunar-year-error">{errors.lunarYear}</ErrorMessage>
                    <ErrorMessage id="lunar-month-error">{errors.lunarMonth}</ErrorMessage>
                    <ErrorMessage id="lunar-day-error">{errors.lunarDay}</ErrorMessage>
                    <p className="mt-3 text-xs text-(--color-text-muted)">請填西元年份，系統會自動換算干支與生肖。</p>
                    <p className="mt-3 text-xs leading-5 text-(--color-text-muted)">目前僅驗證基本格式，不驗證農曆日期是否實際存在；請確認輸入的農曆生日正確。閏月生日暫不支援。</p>
                  </>
                )}
              </section>

              <fieldset className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3">
                <legend className="px-1 text-sm font-medium text-(--color-text-primary)">出生時間（必填）</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {(["unknown", "branch", "exact"] as const).map((mode) => (
                    <label key={mode} className="inline-flex items-center gap-2 text-sm text-(--color-text-primary)">
                      <input type="radio" name="timeMode" value={mode} checked={activeDraft.timeMode === mode} onChange={() => updateTimeMode(mode)} className="h-4 w-4 accent-(--color-accent)" />
                      {mode === "unknown" ? "不知道" : mode === "branch" ? "知道時辰" : "精確時間"}
                    </label>
                  ))}
                </div>

                {activeDraft.timeMode === "branch" && (
                  <div className="mt-3">
                    <label htmlFor="time-branch" className="text-xs text-(--color-text-muted)">出生時辰</label>
                    <select id="time-branch" value={activeDraft.timeBranch} aria-invalid={Boolean(errors.time)} onChange={(event) => updateForm((previous) => ({ ...previous, [previous.birthMode]: { ...previous[previous.birthMode], timeBranch: event.target.value as TimeBranchValue } }))} className={fieldClass}>
                      <option value="">請選擇時辰</option>
                      {SHICHEN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                )}

                {activeDraft.timeMode === "exact" && (
                  <div className="mt-3">
                    <label htmlFor="time-exact" className="text-xs text-(--color-text-muted)">出生時間</label>
                    <input id="time-exact" type="time" value={activeDraft.timeExact} aria-invalid={Boolean(errors.time)} onChange={(event) => updateForm((previous) => ({ ...previous, [previous.birthMode]: { ...previous[previous.birthMode], timeExact: event.target.value } }))} className={fieldClass} />
                  </div>
                )}
                {activeDraft.timeMode === "unknown" && <p className="mt-3 text-xs text-(--color-text-muted)">不知道也可以產生結果，生辰會顯示「吉時」。</p>}
                <ErrorMessage id="time-error">{errors.time}</ErrorMessage>
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <button type="submit" className="w-full rounded-xl bg-(--color-accent) py-2.5 font-medium text-white transition hover:bg-(--color-accent-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2">產生疏文資料</button>
                <button type="button" onClick={handleReset} className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-muted) py-2.5 text-(--color-text-primary) transition hover:bg-(--color-surface)">清除重填</button>
              </div>
            </form>
          </div>
        </div>

        <div ref={resultSectionRef} className="scroll-mt-24 lg:col-span-7">
          <RitualResults
            input={submittedInput}
            gender={submittedGender}
            now={now}
            dayMode={dayMode}
            onDayModeChange={setDayMode}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
