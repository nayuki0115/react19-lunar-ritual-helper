import type { DetailsHTMLAttributes, ReactNode } from "react";

type Props = DetailsHTMLAttributes<HTMLDetailsElement> & {
  summary: ReactNode;
  children: ReactNode;
  muted?: boolean;
};

const DisclosureCard = ({ summary, children, muted = false, className = "", ...props }: Props) => (
  <details
    className={`group rounded-2xl border border-(--color-border) ${muted ? "bg-(--color-surface-muted)" : "bg-(--color-surface) shadow-sm"} ${className}`}
    {...props}
  >
    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-(--color-text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--color-accent-text) sm:px-5">
      <span>{summary}</span>
      <span aria-hidden="true" className="text-(--color-text-muted) transition-transform group-open:rotate-180">⌄</span>
    </summary>
    <div className="border-t border-(--color-border) px-4 py-4 sm:px-5">{children}</div>
  </details>
);

export default DisclosureCard;
