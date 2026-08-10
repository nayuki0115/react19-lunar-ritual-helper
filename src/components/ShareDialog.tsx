import { Button, ModalDrawer } from "@/components/ui";

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
}: Props) => (
  <ModalDrawer
    open={open}
    title={manualUrl ? "手動複製分享連結" : "建立分享連結"}
    description={manualUrl
      ? "瀏覽器無法自動寫入剪貼簿，請選取下方完整網址後手動複製。"
      : "分享網址會包含性別、出生日期、出生時間與換日模式。任何取得連結的人都可以還原這些資料。"}
    onClose={onCancel}
    actions={manualUrl ? (
      <Button onClick={onCancel}>關閉</Button>
    ) : (
      <>
        <Button onClick={onCancel}>取消</Button>
        <Button variant="primary" onClick={onConfirm}>同意並複製連結</Button>
      </>
    )}
  >
    {manualUrl ? (
      <textarea
        readOnly
        value={manualUrl}
        onFocus={(event) => event.currentTarget.select()}
        aria-label="分享連結"
        className="mt-4 h-28 w-full rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-3 text-sm text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text)"
      />
    ) : rememberSettings ? (
      <label className="mt-4 flex items-start gap-2 rounded-xl bg-(--color-surface-muted) p-3 text-sm text-(--color-text-primary)">
        <input
          type="checkbox"
          checked={skipNextWarning}
          onChange={(event) => onSkipNextWarningChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-(--color-accent)"
        />
        下次分享時不再提醒
      </label>
    ) : null}
  </ModalDrawer>
);

export default ShareDialog;
