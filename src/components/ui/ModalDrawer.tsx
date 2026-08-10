import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
};

const ModalDrawer = ({ open, title, description, children, actions, onClose }: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    firstActionRef.current?.querySelector<HTMLElement>("button, input, textarea")?.focus();
    return () => previousFocusRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
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
    <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/45 sm:items-center sm:p-4" role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-(--color-border) bg-(--color-surface) p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-(--color-border) sm:hidden" aria-hidden="true" />
        <h2 id={titleId} className="text-xl font-bold tracking-tight text-(--color-text-primary)">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-(--color-text-secondary)">{description}</p>
        {children}
        <div ref={firstActionRef} className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{actions}</div>
      </div>
    </div>
  );
};

export default ModalDrawer;
