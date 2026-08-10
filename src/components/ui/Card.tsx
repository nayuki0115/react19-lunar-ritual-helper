import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  muted?: boolean;
};

export const Card = ({ children, muted = false, className = "", ...props }: CardProps) => (
  <div
    className={`min-w-0 max-w-full rounded-2xl border border-(--color-border) ${muted ? "bg-(--color-surface-muted)" : "bg-(--color-surface) shadow-sm"} ${className}`}
    {...props}
  >
    {children}
  </div>
);

type FormSectionProps = React.FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  legend: string;
  description?: string;
};

export const FormSection = ({ legend, description, children, className = "", ...props }: FormSectionProps) => (
  <fieldset className={`rounded-xl border border-(--color-border) bg-(--color-surface-muted) p-4 ${className}`} {...props}>
    <legend className="px-1 text-sm font-semibold text-(--color-text-primary)">{legend}</legend>
    {description && <p className="mb-3 mt-1 text-xs leading-5 text-(--color-text-muted)">{description}</p>}
    {children}
  </fieldset>
);
