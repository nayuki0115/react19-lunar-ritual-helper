import { useEffect, useRef, type KeyboardEvent } from "react";

type Props = {
  open: boolean;
  manualUrl: string | null;
  rememberSettings: boolean;
  skipNextWarning: boolean;
  onSkipNextWarningChange: (checked: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

const ShareDialog = ({
  open,
  manualUrl,
  rememberSettings,
  skipNextWarning,
  onSkipNextWarningChange,
  onCancel,
  onConfirm,
}: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => previousFocusRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        aria-describedby="share-dialog-description"
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg rounded-t-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <h2 id="share-dialog-title" className="text-lg font-semibold text-(--color-text-primary)">
          {manualUrl ? "手動複製分享連結" : "建立分享連結"}
        </h2>
        <p id="share-dialog-description" className="mt-2 text-sm leading-6 text-(--color-text-secondary)">
          {manualUrl
            ? "瀏覽器無法自動寫入剪貼簿，請選取下方完整網址後手動複製。"
            : "分享網址會包含性別、出生日期、出生時間與換日模式。任何取得連結的人都可以還原這些資料。"}
        </p>

        {manualUrl ? (
          <textarea
            readOnly
            value={manualUrl}
            onFocus={(event) => event.currentTarget.select()}
            aria-label="分享連結"
            className="mt-4 h-28 w-full rounded-lg border border-(--color-border) bg-(--color-surface-muted) p-3 text-sm text-(--color-text-primary)"
          />
        ) : rememberSettings ? (
          <label className="mt-4 flex items-start gap-2 text-sm text-(--color-text-primary)">
            <input
              type="checkbox"
              checked={skipNextWarning}
              onChange={(event) => onSkipNextWarningChange(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-(--color-accent)"
            />
            下次分享時不再提醒
          </label>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-(--color-border) px-4 py-2 text-sm text-(--color-text-primary)"
          >
            {manualUrl ? "關閉" : "取消"}
          </button>
          {!manualUrl && (
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-white"
            >
              同意並複製連結
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
