/* Copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path), unchanged.
 * Source: web/src/components/ui/buttons.tsx
 * Changes for standalone use: none.
 */
import type { ButtonHTMLAttributes } from "react";
const variants = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active",
  secondary:
    "border border-control-border bg-surface text-ink hover:bg-surface-subtle",
  ghost: "text-brand hover:bg-surface-subtle",
  destructive: "bg-danger text-on-danger hover:brightness-90",
};
export function Button({
  variant = "primary",
  busy = false,
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  busy?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`rounded-control font-semibold whitespace-normal [overflow-wrap:anywhere] transition-colors motion-reduce:transition-none disabled:bg-surface-subtle disabled:text-muted disabled:cursor-not-allowed ${size === "sm" ? "min-h-9 px-3" : size === "lg" ? "min-h-12 px-5" : "min-h-11 px-4"} py-2 ${variants[variant]} ${className}`}
    >
      {busy && (
        <span
          aria-hidden="true"
          className="inline-block mr-2 size-4 rounded-full border-2 border-current border-r-transparent animate-spin motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <Button {...props} aria-label={label} className="min-w-11">
      {children}
    </Button>
  );
}
