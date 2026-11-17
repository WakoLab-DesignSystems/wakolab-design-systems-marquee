/* Neutral collection parts.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272,
 * web/src/features/catalog/parts.tsx: CategoryChips, Cover, ProjectLink, CatalogStatus, LoadMore
 * (standard EXTRACTION_MATRIX §5.3, N1).
 * Changes for standalone use: the catalog view, i18n keys, routes and project contracts are replaced
 * by props (items, selection, labels, handlers). Markup, class names and behaviour are unchanged.
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
 * src/parts/collection.tsx, without FilterTree (the Console rail; Folio uses chips).
 */
import type { ReactNode } from "react";
import { Button, EmptyState, Skeleton, ToggleChip } from "../components";
import { Icon, type IconName } from "../components/icons";

export interface FilterItem { id: string; label: string; children?: FilterItem[] }

/** Two-level filter as chips (source: CategoryChips). */
export function FilterChips({ items, value, subValue = "", onChange, label, allLabel, subLabel }: {
  items: FilterItem[]; value: string; subValue?: string;
  onChange: (value: string, subValue: string) => void;
  label: string; allLabel: string; subLabel: string;
}) {
  const active = items.find((f) => f.id === value);
  return (
    <div className="grid gap-3">
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        <ToggleChip pressed={!value} onClick={() => onChange("", "")}>{allLabel}</ToggleChip>
        {items.map((f) => <ToggleChip key={f.id} pressed={value === f.id} onClick={() => onChange(f.id, "")}>{f.label}</ToggleChip>)}
      </div>
      {active && (active.children?.length ?? 0) > 0 && (
        <div role="group" aria-label={subLabel} className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">{subLabel}</span>
          {active.children!.map((c) => (
            <ToggleChip key={c.id} pressed={subValue === c.id}
              onClick={() => onChange(value, subValue === c.id ? "" : c.id)}>{c.label}</ToggleChip>
          ))}
        </div>
      )}
    </div>
  );
}

/** Cover image, or the initials fallback (source: Cover). Initials are a typographic mark derived
 *  from the name, not an image. */
export function Cover({ name, image, eager }: { name: string; image?: { src: string; width: number; height: number } | null; eager?: boolean }) {
  if (image) return <img className="wl-cover" src={image.src} alt="" width={image.width} height={image.height} loading={eager ? "eager" : "lazy"} decoding="async" />;
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  return <span className="wl-cover wl-cover--none" aria-hidden="true"><span>{initials}</span></span>;
}

/** Link to an item: a real href (modifier keys open it in a new tab), handled in-app otherwise
 *  (source: ProjectLink). `itemId` marks the element for the keyboard layer. */
export function ItemLink({ href, itemId, onOpen, children, className = "" }: {
  href: string; itemId: string; onOpen?: (id: string) => void; children: ReactNode; className?: string;
}) {
  return (
    <a href={href} data-wds-item={itemId} className={className}
      onClick={(e) => { if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); onOpen(itemId); }}>
      {children}
    </a>
  );
}

/** Collection states (source: CatalogStatus): loading, unavailable with retry, empty, no results.
 *  Returns nothing for "ready". Texts come from props. */
export type CollectionState =
  | { status: "loading"; label: string }
  | { status: "unavailable"; title: string; body: string; retryLabel: string; onRetry: () => void }
  | { status: "empty"; title: string; body: ReactNode; icon?: IconName }
  | { status: "noResults"; title: string; body: ReactNode; clearLabel?: string; onClear?: () => void; icon?: IconName }
  | { status: "ready" };
export function CollectionStatus({ state, tiles }: { state: CollectionState; tiles?: boolean }) {
  if (state.status === "loading")
    return (
      <div className="grid gap-3">
        <p role="status" className="text-muted">{state.label}</p>
        <div className={tiles ? "wl-skeleton-tiles" : "grid gap-3"}>
          {[0, 1, 2].map((i) => tiles
            ? <div key={i} className="grid gap-2"><Skeleton className="aspect-video w-full" /><Skeleton className="h-5 w-2/3" /></div>
            : <div key={i} className="flex gap-4"><Skeleton className="h-12 w-20 shrink-0" /><div className="grid flex-1 gap-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-3/4" /></div></div>)}
        </div>
      </div>
    );
  if (state.status === "unavailable")
    return (
      <div role="alert" className="wl-state wl-state--error">
        <Icon name="offline" size={24} />
        <div className="grid gap-1"><h3>{state.title}</h3><p>{state.body}</p></div>
        <Button variant="secondary" onClick={state.onRetry}>{state.retryLabel}</Button>
      </div>
    );
  if (state.status === "empty") return <EmptyState icon={state.icon ?? "spark"} title={state.title}>{state.body}</EmptyState>;
  if (state.status === "noResults")
    return <EmptyState icon={state.icon ?? "search"} title={state.title} action={state.onClear && state.clearLabel ? <Button variant="secondary" onClick={state.onClear}>{state.clearLabel}</Button> : undefined}>{state.body}</EmptyState>;
  return null;
}

/** Bounded "show more" (source: LoadMore). Renders nothing when everything is shown. */
export function LoadMore({ shownLabel, more, busy, failedLabel, actionLabel, onMore }: {
  shownLabel: string; more: boolean; busy?: boolean; failedLabel?: string; actionLabel: string; onMore: () => void;
}) {
  return (
    <div className="wl-more">
      <p className="wl-meta-text">{shownLabel}</p>
      {failedLabel && <p role="alert" className="wl-meta-text text-danger">{failedLabel}</p>}
      {more && <Button variant="secondary" busy={busy} onClick={onMore}>{actionLabel}</Button>}
    </div>
  );
}
