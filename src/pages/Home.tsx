import { useEffect, useRef, useState, type FormEvent } from "react";
import { getEffectiveSolarDate, type BirthInput } from "@/utils/lunar";
import RitualResults from "@/components/RitualResults";
import ShareDialog from "@/components/ShareDialog";
import { Button, Card, DisclosureCard, FormLabel, FormSection, formControlClass } from "@/components/ui";
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
import {
  PERSONAL_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  encodePersonalStorage,
  encodeSettingsStorage,
  loadStoredPreferences,
} from "@/utils/storageSpec";
import { clearShareParams, createShareUrl, decodeShareParams } from "@/utils/urlSpec";

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

const ErrorMessage = ({ id, children }: { id: string; children?: string }) =>
  children ? <p id={id} className="mt-2 text-sm text-(--color-state-error)" role="alert">{children}</p> : null;

const Home = () => {
  const [initial] = useState(() => {
    const stored = loadStoredPreferences(window.localStorage);
    const share = decodeShareParams(new URLSearchParams(window.location.search));
    return { stored, share };
  });
  const { stored } = initial;
  const initialShared = initial.share.status === "valid" ? initial.share : null;
  const [formState, setFormState] = useState<FormState>(() => initialShared?.form ?? stored.personal?.form ?? createDefaultFormState());
  const [rememberData, setRememberData] = useState(Boolean(stored.personal));
  const [rememberSettings, setRememberSettings] = useState(Boolean(stored.settings));
  const [privacyOpen, setPrivacyOpen] = useState(Boolean(stored.personal || stored.settings));
  const [detailsOpen, setDetailsOpen] = useState(stored.settings?.detailsOpen ?? false);
  const [skipShareWarning, setSkipShareWarning] = useState(stored.settings?.skipShareWarning ?? false);
  const [savedDayMode, setSavedDayMode] = useState(stored.settings?.dayMode ?? "folk");
  const [shareStatus, setShareStatus] = useState(initial.share.status);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [manualShareUrl, setManualShareUrl] = useState<string | null>(null);
  const [shareSkipChoice, setShareSkipChoice] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(Boolean(initialShared));
  const [submittedInput, setSubmittedInput] = useState<BirthInput | null>(() => initialShared ? toBirthInput(initialShared.form) : null);
  const [submittedGender, setSubmittedGender] = useState<FormState["gender"]>(() => initialShared?.form.gender ?? "");
  const [submittedForm, setSubmittedForm] = useState<FormState | null>(() => initialShared?.form ?? null);
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const allowPersonalSaveRef = useRef(!initialShared);

  const { mode: dayMode, setMode: setDayMode, now } = useDayBoundaryClock(initialShared?.dayMode ?? savedDayMode);

  useEffect(() => {
    if (rememberData && allowPersonalSaveRef.current) {
      window.localStorage.setItem(PERSONAL_STORAGE_KEY, encodePersonalStorage(formState));
    }
  }, [formState, rememberData]);

  useEffect(() => {
    if (rememberSettings && shareStatus !== "valid") {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        encodeSettingsStorage({ dayMode: savedDayMode, detailsOpen, skipShareWarning }),
      );
    }
  }, [savedDayMode, detailsOpen, rememberSettings, skipShareWarning, shareStatus]);

  useEffect(() => {
    if (!initialShared || !window.matchMedia("(max-width: 1023px)").matches) return;
    const frame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultSectionRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialShared]);

  const handleDayModeChange = (mode: "folk" | "civil") => {
    setDayMode(mode);
    setSavedDayMode(mode);
    if (shareStatus === "valid") {
      clearShareParams(window.location, window.history);
      setShareStatus("none");
    }
  };

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
    setSubmittedForm(structuredClone(formState));
    if (shareStatus === "valid") {
      clearShareParams(window.location, window.history);
      setShareStatus("none");
    }
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

  const handleClearData = () => {
    setFormState(createDefaultFormState());
    setErrors({});
    setHasSubmitted(false);
    setSubmittedInput(null);
    setSubmittedGender("");
    setSubmittedForm(null);
    setRememberData(false);
    window.localStorage.removeItem(PERSONAL_STORAGE_KEY);
    if (shareStatus !== "none") {
      clearShareParams(window.location, window.history);
      setShareStatus("none");
    }
  };

  const handleRememberDataChange = (enabled: boolean) => {
    setRememberData(enabled);
    if (enabled) allowPersonalSaveRef.current = true;
    if (enabled) window.localStorage.setItem(PERSONAL_STORAGE_KEY, encodePersonalStorage(formState));
    else window.localStorage.removeItem(PERSONAL_STORAGE_KEY);
  };

  const handleRememberSettingsChange = (enabled: boolean) => {
    setRememberSettings(enabled);
    if (enabled) {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        encodeSettingsStorage({ dayMode: savedDayMode, detailsOpen, skipShareWarning }),
      );
    } else {
      setSkipShareWarning(false);
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  };

  const handleResetSettings = () => {
    setRememberSettings(false);
    setDayMode("folk");
    setSavedDayMode("folk");
    setDetailsOpen(false);
    setSkipShareWarning(false);
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
  };

  const copyShareUrl = async (url: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setShareDialogOpen(false);
      setManualShareUrl(null);
      setShareNotice("分享連結已複製");
    } catch {
      setManualShareUrl(url);
      setShareDialogOpen(true);
    }
  };

  const handleShare = () => {
    if (!submittedInput || !submittedGender || !submittedForm) return;
    const url = createShareUrl(window.location, { form: submittedForm, dayMode });
    setShareNotice("");
    if (rememberSettings && skipShareWarning) {
      void copyShareUrl(url);
    } else {
      setManualShareUrl(null);
      setShareSkipChoice(false);
      setShareDialogOpen(true);
    }
  };

  const handleConfirmShare = () => {
    if (!submittedForm) return;
    if (rememberSettings && shareSkipChoice) setSkipShareWarning(true);
    const url = createShareUrl(window.location, { form: submittedForm, dayMode });
    void copyShareUrl(url);
  };

  const handleClearInvalidShare = () => {
    clearShareParams(window.location, window.history);
    const fallbackForm = stored.personal?.form ?? createDefaultFormState();
    setFormState(fallbackForm);
    setSubmittedInput(null);
    setSubmittedGender("");
    setSubmittedForm(null);
    setHasSubmitted(false);
    setDayMode(savedDayMode);
    setShareStatus("none");
  };

  const activeDraft = formState[formState.birthMode];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <section className="mb-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-(--color-accent-text)">LUNAR RITUAL HELPER</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-(--color-text-primary) sm:text-3xl">疏文填寫助手</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--color-text-secondary) sm:text-base">
          輸入出生資料，系統會整理農曆生日、生肖、虛歲與生辰。
        </p>
      </section>

      {shareStatus === "invalid" && (
        <Card className="mb-6 border-(--color-state-error) p-4" role="alert">
          <p className="text-sm text-(--color-text-primary)">分享連結無效或資料不完整，無法還原資料。</p>
          <Button
            onClick={handleClearInvalidShare}
            className="mt-3"
          >
            清除此分享連結
          </Button>
        </Card>
      )}

      <section className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 lg:col-span-5">
          <div className="mb-3 px-1">
            <p className="text-xs font-semibold text-(--color-accent-text)">步驟 1</p>
            <h2 className="mt-1 text-xl font-bold text-(--color-text-primary)">輸入出生資料</h2>
            <p className="mt-1 text-sm leading-6 text-(--color-text-secondary)">完成必填欄位後，即可在右側或下方查看疏文資料。</p>
          </div>
          <Card className="p-4 sm:p-5 md:p-6">
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <FormSection legend="出生日期輸入方式" description="切換模式時，兩邊已輸入的草稿都會保留。">
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["solar", "lunar"] as const).map((mode) => (
                    <label key={mode} className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${formState.birthMode === mode ? "border-(--color-accent) bg-(--color-surface) font-semibold text-(--color-accent-text)" : "border-(--color-border) text-(--color-text-secondary)"}`}>
                      <input type="radio" name="birthMode" value={mode} className="sr-only" checked={formState.birthMode === mode} onChange={() => updateMode(mode)} />
                      {mode === "solar" ? "國曆自動換算" : "已知農曆日期"}
                    </label>
                  ))}
                </div>
              </FormSection>

              <FormSection legend="性別（必填）">
                <div className="mt-2 flex gap-6">
                  {(["male", "female"] as const).map((gender) => (
                    <label key={gender} className="inline-flex items-center gap-2 text-(--color-text-primary)">
                      <input type="radio" name="gender" value={gender} checked={formState.gender === gender} onChange={() => updateForm((previous) => ({ ...previous, gender }))} className="h-4 w-4 accent-(--color-accent)" />
                      {gender === "male" ? "男" : "女"}
                    </label>
                  ))}
                </div>
                <ErrorMessage id="gender-error">{errors.gender}</ErrorMessage>
              </FormSection>

              <FormSection legend="出生日期（必填）">
                {formState.birthMode === "solar" ? (
                  <>
                    <FormLabel htmlFor="solar-date" className="mt-3">國曆出生日期</FormLabel>
                    <input id="solar-date" type="date" max={maxSolarDate} value={formState.solar.date} aria-invalid={Boolean(errors.solarDate)} aria-describedby={errors.solarDate ? "solar-date-error" : "solar-date-hint"} onChange={(event) => updateForm((previous) => ({ ...previous, solar: { ...previous.solar, date: event.target.value } }))} className={formControlClass} />
                    <p id="solar-date-hint" className="mt-2 text-xs text-(--color-text-muted)">系統會自動換算農曆日期，並保留閏月資訊。</p>
                    <ErrorMessage id="solar-date-error">{errors.solarDate}</ErrorMessage>
                  </>
                ) : (
                  <>
                    <div className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-3 sm:gap-2">
                      <FormLabel>農曆出生年（西元）
                        <input inputMode="numeric" placeholder="例：1992" value={formState.lunar.year} aria-invalid={Boolean(errors.lunarYear)} onChange={(event) => updateForm((previous) => ({ ...previous, lunar: { ...previous.lunar, year: event.target.value } }))} className={formControlClass} />
                      </FormLabel>
                      <FormLabel>月份
                        <input type="number" min="1" max="12" placeholder="1–12" value={formState.lunar.month} aria-invalid={Boolean(errors.lunarMonth)} onChange={(event) => updateForm((previous) => ({ ...previous, lunar: { ...previous.lunar, month: event.target.value } }))} className={formControlClass} />
                      </FormLabel>
                      <FormLabel>日期
                        <input type="number" min="1" max="30" placeholder="1–30" value={formState.lunar.day} aria-invalid={Boolean(errors.lunarDay)} onChange={(event) => updateForm((previous) => ({ ...previous, lunar: { ...previous.lunar, day: event.target.value } }))} className={formControlClass} />
                      </FormLabel>
                    </div>
                    <ErrorMessage id="lunar-year-error">{errors.lunarYear}</ErrorMessage>
                    <ErrorMessage id="lunar-month-error">{errors.lunarMonth}</ErrorMessage>
                    <ErrorMessage id="lunar-day-error">{errors.lunarDay}</ErrorMessage>
                    <p className="mt-3 text-xs text-(--color-text-muted)">請填西元年份，系統會自動換算干支與生肖。</p>
                    <p className="mt-3 text-xs leading-5 text-(--color-text-muted)">目前僅驗證基本格式，不驗證農曆日期是否實際存在；請確認輸入的農曆生日正確。閏月生日暫不支援。</p>
                  </>
                )}
              </FormSection>

              <FormSection legend="出生時間（必填）">
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
                    <FormLabel htmlFor="time-branch">出生時辰</FormLabel>
                    <select id="time-branch" value={activeDraft.timeBranch} aria-invalid={Boolean(errors.time)} onChange={(event) => updateForm((previous) => ({ ...previous, [previous.birthMode]: { ...previous[previous.birthMode], timeBranch: event.target.value as TimeBranchValue } }))} className={formControlClass}>
                      <option value="">請選擇時辰</option>
                      {SHICHEN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                )}

                {activeDraft.timeMode === "exact" && (
                  <div className="mt-3">
                    <FormLabel htmlFor="time-exact">出生時間</FormLabel>
                    <input id="time-exact" type="time" value={activeDraft.timeExact} aria-invalid={Boolean(errors.time)} onChange={(event) => updateForm((previous) => ({ ...previous, [previous.birthMode]: { ...previous[previous.birthMode], timeExact: event.target.value } }))} className={formControlClass} />
                  </div>
                )}
                {activeDraft.timeMode === "unknown" && <p className="mt-3 text-xs text-(--color-text-muted)">不知道也可以產生結果，生辰會顯示「吉時」。</p>}
                <ErrorMessage id="time-error">{errors.time}</ErrorMessage>
              </FormSection>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="submit" variant="primary" className="w-full">產生疏文資料</Button>
                <Button onClick={handleClearData} className="w-full">清除資料</Button>
              </div>
            </form>
          </Card>

          <DisclosureCard
            className="mt-4"
            muted
            summary={<span>本機保存與隱私 <span className="font-normal text-(--color-text-muted)">（選填）</span></span>}
            open={privacyOpen}
            onToggle={(event) => setPrivacyOpen(event.currentTarget.open)}
          >
              <p className="text-xs leading-5 text-(--color-text-muted)">不影響疏文資料的產生。啟用後，資料只會保存在目前瀏覽器。</p>
              <div className="mt-4 grid gap-4">
                <label className="flex items-start gap-2 text-sm text-(--color-text-primary)">
                    <input
                      type="checkbox"
                      checked={rememberData}
                      onChange={(event) => handleRememberDataChange(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-(--color-accent)"
                    />
                    <span>
                      記住我的資料
                      <span className="mt-0.5 block text-xs leading-5 text-(--color-text-muted)">在這台裝置保存性別、兩種出生日期草稿與最後使用的輸入模式。</span>
                    </span>
                </label>
                <div>
                  <label className="flex items-start gap-2 text-sm text-(--color-text-primary)">
                    <input
                      type="checkbox"
                      checked={rememberSettings}
                      onChange={(event) => handleRememberSettingsChange(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-(--color-accent)"
                    />
                    <span>
                      記住設定
                      <span className="mt-0.5 block text-xs leading-5 text-(--color-text-muted)">在這台裝置保存換日模式、詳細資訊展開狀態與分享提醒偏好。</span>
                    </span>
                  </label>
                  {(rememberSettings || dayMode !== "folk" || detailsOpen) && (
                    <div className="ml-6 mt-2">
                      <Button onClick={handleResetSettings} className="min-h-9 px-3 py-1.5 text-xs">重設設定</Button>
                      <p className="mt-1 text-xs leading-5 text-(--color-text-muted)">換日模式將恢復為民俗 23:00，詳細資訊將恢復收合，分享時會再次顯示隱私提醒。</p>
                    </div>
                  )}
                </div>
              </div>
          </DisclosureCard>
        </div>

        <div ref={resultSectionRef} className="min-w-0 scroll-mt-24 lg:col-span-7">
          <div className="mb-3 px-1">
            <p className="text-xs font-semibold text-(--color-accent-text)">步驟 2</p>
            <h2 className="mt-1 text-xl font-bold text-(--color-text-primary)">查看疏文資料</h2>
            <p className="mt-1 text-sm leading-6 text-(--color-text-secondary)">確認今日資訊，並查看整理完成的生辰、虛歲、生肖與手印。</p>
          </div>
          <RitualResults
            input={submittedInput}
            gender={submittedGender}
            now={now}
            dayMode={dayMode}
            onDayModeChange={handleDayModeChange}
            detailsOpen={detailsOpen}
            onDetailsOpenChange={setDetailsOpen}
            fromShare={shareStatus === "valid"}
          />
          {submittedInput && submittedGender && (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <div role="status" aria-live="polite">
                {shareNotice && (
                  <span className="inline-flex items-center gap-2 border-l-4 border-(--color-state-success) bg-(--color-state-success-muted) px-3 py-2 text-sm font-medium text-(--color-state-success)">
                    <span aria-hidden="true">✓</span>
                    {shareNotice}
                  </span>
                )}
              </div>
              <Button
                onClick={handleShare}
                variant="primary"
              >
                分享結果
              </Button>
            </div>
          )}
        </div>
      </section>
      <ShareDialog
        open={shareDialogOpen}
        manualUrl={manualShareUrl}
        rememberSettings={rememberSettings}
        skipNextWarning={shareSkipChoice}
        onSkipNextWarningChange={setShareSkipChoice}
        onCancel={() => {
          setShareDialogOpen(false);
          setManualShareUrl(null);
        }}
        onConfirm={handleConfirmShare}
      />
    </div>
  );
};

export default Home;
