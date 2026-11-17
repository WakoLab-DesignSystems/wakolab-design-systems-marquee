/* Copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path), unchanged.
 * Source: web/src/components/ui/tabs.tsx
 * Changes for standalone use: none.
 */
import { useRef, type ReactNode } from "react";
/** In-page tabs (ARIA tablist). Arrow keys move and select; Home/End jump. Use links, not tabs,
 *  for navigation between routes. Panels are rendered by the caller with `panelProps(id)`. */
export function Tabs<T extends string>({ label, tabs, value, onChange, idBase }: {
  label: string; tabs: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void;
  /** Shared with the panel: panel id = `${idBase}-${tab}-panel`, labelled by `${idBase}-${tab}`. */
  idBase: string;
}) {
  const base = idBase;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const move = (i: number) => { const next = tabs[(i + tabs.length) % tabs.length]; onChange(next.id); refs.current[next.id]?.focus(); };
  return (
    <div role="tablist" aria-label={label} className="wl-tabs flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab, i) => (
        <button key={tab.id} ref={(el) => { refs.current[tab.id] = el; }} type="button" role="tab" id={`${base}-${tab.id}`}
          aria-controls={`${base}-${tab.id}-panel`} aria-selected={value === tab.id} tabIndex={value === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") move(i + 1); else if (e.key === "ArrowLeft") move(i - 1);
            else if (e.key === "Home") move(0); else if (e.key === "End") move(tabs.length - 1); else return;
            e.preventDefault();
          }}
          className={`-mb-px min-h-11 border-b-2 px-3 font-semibold ${value === tab.id ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
export function TabPanel({ idBase, tab, children }: { idBase: string; tab: string; children: ReactNode }) {
  return <div role="tabpanel" id={`${idBase}-${tab}-panel`} aria-labelledby={`${idBase}-${tab}`} tabIndex={0} className="wl-tabpanel">{children}</div>;
}
