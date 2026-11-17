/* Copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path), unchanged.
 * Source: web/src/components/ui/search.tsx
 * Changes for standalone use: none (icons come from the icon slot, see icons.tsx).
 */
import { useId, type ReactNode, type RefObject } from "react";
import { Icon } from "./icons";
/** Search input inside a search landmark, with a visible-or-hidden label and a clear button. */
export function SearchField({ label, placeholder, value, onChange, clearLabel, inputRef, hideLabel = true, id }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; clearLabel: string;
  inputRef?: RefObject<HTMLInputElement | null>; hideLabel?: boolean; id?: string;
}) {
  const generated = useId();
  const key = id || generated;
  return (
    <div role="search" className="wl-search relative min-w-0">
      <label htmlFor={key} className={hideLabel ? "sr-only" : "mb-2 block font-medium"}>{label}</label>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input ref={inputRef} id={key} type="search" value={value} placeholder={placeholder} autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full min-w-0 rounded-control border border-control-border bg-surface pl-10 pr-11 text-base text-ink placeholder:text-muted [&::-webkit-search-cancel-button]:hidden" />
        {value && (
          <button type="button" aria-label={clearLabel} onClick={() => onChange("")}
            className="absolute right-0.5 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-control text-muted hover:bg-surface-subtle hover:text-ink">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
/** Toggle button for filters; pressed state uses shape + check mark, not colour alone. */
export function ToggleChip({ pressed, onClick, children, note }: { pressed: boolean; onClick: () => void; children: ReactNode; note?: string }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick}
      className={`wl-chip inline-flex min-h-11 items-center gap-2 rounded-chip border px-4 text-sm font-semibold transition-colors motion-reduce:transition-none ${pressed ? "border-ink bg-ink text-canvas" : "border-control-border bg-surface text-ink hover:bg-surface-subtle"}`}>
      {pressed && <Icon name="check" size={16} />}
      {children}
      {note && <span className="text-xs font-normal">({note})</span>}
    </button>
  );
}
