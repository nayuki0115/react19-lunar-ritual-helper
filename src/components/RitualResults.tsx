import { createRitualResultViewModel } from "@/utils/ritualResults";
import { resolveTodayProfile, type BirthInput, type DayMode } from "@/utils/lunar";
import type { Gender } from "@/utils/formSpec";
import { Button, Card, DisclosureCard } from "@/components/ui";

type Props = {
  input: BirthInput | null;
  gender: Gender | "";
  now: Date;
  dayMode: DayMode;
  onDayModeChange: (mode: DayMode) => void;
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
  fromShare?: boolean;
};

const ResultItem = ({ label, value }: { label: string; value: string }) => (
  <Card muted className="p-3">
    <div className="text-xs text-(--color-text-muted)">{label}</div>
    <div className="mt-1 break-words text-lg font-semibold text-(--color-text-primary)">{value}</div>
  </Card>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium text-(--color-text-muted)">{label}</dt>
    <dd className="mt-1 text-sm text-(--color-text-primary)">{value}</dd>
  </div>
);

const RitualResults = ({ input, gender, now, dayMode, onDayModeChange, detailsOpen, onDetailsOpenChange, fromShare = false }: Props) => {
  const today = resolveTodayProfile(now, dayMode);
  const result = input && gender
    ? createRitualResultViewModel(input, gender, now, dayMode)
    : null;

  return (
    <div className="min-w-0 grid gap-4">
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-6 text-(--color-text-primary)">今日疏文與流年資訊</h2>
            <p className="mt-1 text-xs text-(--color-text-muted)">
              {dayMode === "folk" ? "民俗模式於 23:00 換日" : "民用模式於 00:00 換日"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs">
            <span className="hidden whitespace-nowrap text-(--color-text-muted) sm:inline">換日模式</span>
            <div className="inline-flex whitespace-nowrap rounded-lg border border-(--color-border) bg-(--color-surface-muted) p-0.5" role="group" aria-label="換日模式">
              {(["folk", "civil"] as const).map((mode) => (
                <Button
                  key={mode}
                  aria-pressed={dayMode === mode}
                  aria-label={mode === "folk" ? "民俗 23:00" : "民用 00:00"}
                  onClick={() => onDayModeChange(mode)}
                  variant="quiet"
                  className={`min-h-7 rounded-md px-2 py-0.5 text-[11px] font-medium sm:min-h-8 sm:px-2.5 sm:py-1 sm:text-xs ${
                    dayMode === mode
                      ? "bg-(--color-accent-muted) font-medium text-(--color-accent-text) shadow-sm"
                      : "text-(--color-text-secondary)"
                  }`}
                >
                  <span aria-hidden="true" className="sm:hidden">{mode === "folk" ? "民俗" : "民用"}</span>
                  <span aria-hidden="true" className="hidden sm:inline">{mode === "folk" ? "民俗 23:00" : "民用 00:00"}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ResultItem label="天運／歲次（疏文填寫內容）" value={`${today.ganzhiYear}年 ${today.lunarDateText}`} />
          <ResultItem label="今日流年生肖" value={`屬${today.zodiac}`} />
        </div>
        <p className="mt-3 text-xs leading-5 text-(--color-text-muted)">
          * 「歲次」是指當年的干支年；實際疏文中的「天運」或「歲次」欄位，常需填今年干支年及今天農曆月日。
        </p>
      </Card>

      {result ? (
        <>
          <Card className="p-4 sm:p-5 md:p-6" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-(--color-text-primary)">疏文資料</h2>
              {fromShare && (
                <span className="rounded-full bg-(--color-accent-muted) px-2 py-1 text-xs text-(--color-accent-text)">
                  此結果來自分享連結
                </span>
              )}
              {result.source === "lunar" && (
                <span className="rounded-full bg-(--color-bg-muted) px-2 py-1 text-xs text-(--color-text-secondary)">
                  使用者直接提供農曆資料
                </span>
              )}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ResultItem label="生辰／命宮／本命（農曆出生資料）" value={result.birthText} />
              <ResultItem label="歲數" value={`${result.suiAge} 歲`} />
              <ResultItem label="生肖（參考資訊）" value={result.birthZodiac} />
              <ResultItem label="手印" value={result.handprint} />
            </div>

            <div className="mt-3 text-xs leading-5 text-(--color-text-muted)">
              <p>* 上方出生資料由干支年、農曆月日與時辰組成。疏文寫「生辰」、「命宮」或「本命」，都請填這項資料。</p>
              <p className="mt-1">* 手印依一般「男左女右」整理；若疏文或使用單位另有指定，請以其規定為準。</p>
            </div>

            {result.source === "lunar" && (
              <div className="mt-4 rounded-xl border border-(--color-border) bg-(--color-bg-muted) p-3 text-sm text-(--color-text-secondary)">
                此出生農曆資料由使用者自行提供，系統僅檢查基本格式，不驗證其與實際農曆日期是否一致。
              </div>
            )}
          </Card>

          <DisclosureCard
            open={detailsOpen}
            onToggle={(event) => onDetailsOpenChange(event.currentTarget.open)}
            summary="詳細資訊與判定說明"
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="出生資料來源" value={result.sourceLabel} />
              <DetailItem label="原始出生日期" value={result.originalBirthInput} />
              <DetailItem label="原始出生時間／時辰" value={result.originalTimeInput} />
              <DetailItem label="出生生肖" value={result.birthZodiac} />
              <DetailItem label="出生日期判定" value={result.birthRule} />
              <DetailItem label="今日日期判定" value={result.todayRule} />
              <DetailItem label="虛歲計算式" value={result.suiAgeFormula} />
              <DetailItem label="計算原則" value="目前農曆年 - 出生農曆年 + 1；出生當年即為一歲。" />
            </dl>
          </DisclosureCard>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-muted) p-8 text-center text-(--color-text-secondary)">
          完成輸入資料後，按下「產生疏文資料」即可查看結果。
        </div>
      )}

      <aside className="rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-4 text-xs leading-5 text-(--color-text-muted)" aria-label="免責聲明">
        <span className="font-semibold text-(--color-text-secondary)">使用提醒：</span>
        本工具依輸入資料提供疏文欄位的換算與整理，結果僅供一般參考。各宮廟、法師或疏文格式可能有不同規範，請以實際使用單位的規定為準。
      </aside>
    </div>
  );
};

export default RitualResults;
