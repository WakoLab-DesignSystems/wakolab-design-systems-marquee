/* Copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path), unchanged.
 * Source: web/src/components/ui/index.tsx
 * Changes for standalone use: Dialog: the dead `backdrop:bg-panel/60` utility is removed (E2); the effective backdrop is `.wl-dialog::backdrop { var(--wl-scrim) }` in console.css, so rendering is unchanged.
 */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./buttons";
export { Button, IconButton } from "./buttons";
export { TextField, CodeField, Select, ChoiceGroup, Checkbox } from "./fields";
export { Icon, type IconName } from "./icons";
export { EmptyState, Skeleton, Toast } from "./feedback";
export { SearchField, ToggleChip } from "./search";
export { Popover } from "./popover";
export { ConfirmDialog } from "./confirm";
export { Tabs, TabPanel } from "./tabs";
const tones = {
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-danger-soft text-danger",
};
export function Alert({
  children,
  tone = "info",
  urgent = false,
  id,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  urgent?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      role={urgent ? "alert" : "status"}
      tabIndex={urgent ? -1 : undefined}
      className={`rounded-control p-4 [overflow-wrap:anywhere] ${tones[tone]}`}
    >
      <span aria-hidden="true" className="mr-2">
        {tone === "error" ? "!" : tone === "success" ? "✓" : "i"}
      </span>
      {children}
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-surface-subtle text-ink px-3 py-1 text-sm">
      {children}
    </span>
  );
}
export function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-card bg-surface border border-border p-4 sm:p-6 space-y-4 min-w-0">
      {children}
    </section>
  );
}
export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol
      className={`grid grid-cols-2 ${steps.length > 2 ? "sm:grid-cols-4" : ""} gap-3 text-sm mb-8`}
    >
      {steps.map((step, i) => (
        <li
          key={i}
          aria-current={i === current ? "step" : undefined}
          className={i === current ? "text-brand font-semibold" : "text-muted"}
        >
          <span
            aria-hidden="true"
            className="inline-flex rounded-full border border-current size-7 items-center justify-center mr-2"
          >
            {i < current ? "✓" : i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}
export function ConnectionRow({
  name,
  status,
  description,
}: {
  name: string;
  status: string;
  description: string;
}) {
  return (
    <div className="border-t border-border py-4 space-y-2">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <strong>{name}</strong>
        <Badge>{status}</Badge>
      </div>
      <p className="text-sm text-muted">{description}</p>
      <Button variant="secondary" disabled>
        {status}
      </Button>
    </div>
  );
}
export function Dialog({
  open,
  onClose,
  title,
  closeLabel,
  children,
  actions,
  headerClose = false,
  description,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
  /** Replaces the default bottom close button (e.g. a form's own buttons). */
  actions?: ReactNode;
  /** Adds a labelled close button in the header (multi-step dialogs). */
  headerClose?: boolean;
  description?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const node = ref.current;
    if (!open || !node) return;
    const previous = document.activeElement as HTMLElement;
    const previousId = previous?.id;
    node.showModal();
    // React's autoFocus runs at mount, while the dialog may still be closed.
    node.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      node.close();
      // If the trigger was re-rendered elsewhere (e.g. another composition), find it by id.
      const target = previous?.isConnected ? previous : previousId ? document.getElementById(previousId) : null;
      target?.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const items = Array.from(
          ref.current!.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]',
          ),
        );
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-describedby={description ? id + "-d" : undefined}
      className={`wl-dialog m-auto max-w-form w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] overflow-auto rounded-card p-6 bg-surface text-ink shadow-dialog ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={id}>{title}</h2>
        {headerClose && (
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink hover:bg-surface-subtle"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        )}
      </div>
      {description && (
        <div id={id + "-d"} className="mt-2 text-muted">
          {description}
        </div>
      )}
      <div className="my-6">{children}</div>
      {actions ?? (headerClose ? null : <Button onClick={onClose}>{closeLabel}</Button>)}
    </dialog>
  );
}
