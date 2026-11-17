/* Copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path), unchanged.
 * Source: web/src/components/ui/popover.tsx
 * Changes for standalone use: `data-wds-popover`/`data-open` markers on the wrapper; event and focus ownership (standard EXTRACTION_MATRIX §4, R3): Escape only when focus is inside the popover or on its trigger; outside pointer-down closes without moving focus; listeners are added on open and removed on close/unmount. Visual and pointer behaviour unchanged.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
/** Disclosure popover (menus, appearance, language). Esc and outside click close it and
 *  return focus to the trigger. Content is ordinary buttons/fieldsets, not role="menu". */
export function Popover({ trigger, label, children, align = "end", className = "" }: {
  trigger: (props: { "aria-expanded": boolean; "aria-controls": string; onClick: () => void; ref: React.Ref<HTMLButtonElement> }) => ReactNode;
  label: string; children: (close: () => void) => ReactNode; align?: "start" | "end"; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); button.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    // An outside pointer-down closes the popover without moving focus.
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    // Escape is handled only when focus is inside this popover or on its trigger. With nested
    // popovers only the innermost open one around the focus reacts.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // The owner is the innermost OPEN popover around the focused element.
      let owner = document.activeElement?.closest("[data-wds-popover]") ?? null;
      while (owner && owner.getAttribute("data-open") !== "true") owner = owner.parentElement?.closest("[data-wds-popover]") ?? null;
      if (owner !== root.current) return;
      e.preventDefault(); e.stopPropagation(); close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div ref={root} className="relative" data-wds-popover="" data-open={open ? "true" : "false"}>
      {trigger({ "aria-expanded": open, "aria-controls": id, onClick: () => setOpen(!open), ref: button })}
      {open && (
        <div id={id} role="group" aria-label={label}
          className={`wl-popover absolute top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-card border border-border bg-surface p-3 text-ink shadow-dialog ${align === "end" ? "right-0" : "left-0"} ${className}`}>
          {children(close)}
        </div>
      )}
    </div>
  );
}
