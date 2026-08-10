import type { LabelHTMLAttributes, ReactNode } from "react";

export const formControlClass =
  "mt-2 block min-h-11 min-w-0 max-w-full w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)";

type Props = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export const FormLabel = ({ children, className = "", ...props }: Props) => (
  <label className={`block text-xs font-medium text-(--color-text-muted) ${className}`} {...props}>
    {children}
  </label>
);
