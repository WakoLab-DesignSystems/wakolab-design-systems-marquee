/* Copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path), unchanged.
 * Source: web/src/components/ui/feedback.tsx
 * Changes for standalone use: none (icons come from the icon slot, see icons.tsx).
 */
import { useEffect, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";
/** Empty list with a reason and at most one next action. */
export function EmptyState({ icon, title, children, action, headingLevel = 3 }: {
  icon: IconName; title: string; children?: ReactNode; action?: ReactNode; headingLevel?: 2 | 3;
}) {
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <div className="wl-empty grid justify-items-start gap-3 rounded-card border border-dashed border-control-border p-6">
      <Icon name={icon} size={28} className="text-muted" />
      <H className="text-lg">{title}</H>
      {children && <div className="text-muted max-w-prose">{children}</div>}
      {action}
    </div>
  );
}
/** Decorative placeholder; always pair with a visible text status. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`wl-skeleton rounded-control bg-surface-subtle ${className}`} />;
}
/** Non-critical confirmation. Never the only copy of an error. Does not move focus. */
export function Toast({ message, onDone, timeout = 5000 }: { message?: string; onDone: () => void; timeout?: number }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDone, timeout);
    return () => clearTimeout(id);
  }, [message, onDone, timeout]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-center">
      {message && <p className="wl-toast pointer-events-auto rounded-control bg-ink px-4 py-3 text-canvas shadow-dialog">{message}</p>}
    </div>
  );
}
