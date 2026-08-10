import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "quiet";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary: "bg-(--color-accent) text-white hover:bg-(--color-accent-hover)",
  secondary: "border border-(--color-border) bg-(--color-surface) text-(--color-text-primary) hover:bg-(--color-surface-muted)",
  quiet: "text-(--color-accent-text) hover:bg-(--color-accent-muted)",
};

const Button = forwardRef<HTMLButtonElement, Props>(({ variant = "secondary", className = "", type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-text) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    {...props}
  />
));

Button.displayName = "Button";

export default Button;
