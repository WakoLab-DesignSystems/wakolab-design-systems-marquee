/* Marquee compositions with slots.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272:
 *  - shell:      web/src/features/catalog/compositions/shells.tsx (MarqueeHeader, MarqueeShell), shared.tsx (Tools, Page)
 *  - collection: compositions/MarqueeHome.tsx (MarqueeHome, MarqueeTile)
 *  - detail:     compositions/projects.tsx (MarqueeProject)
 *  - form, message: web/src/features/catalog/pages.tsx (`.wl-form-page` framing, MessagePage)
 * (standard KIT_PROPOSAL §8, Marquee). Structure follows Folio's compositions
 * (wakolab-design-systems-folio at 0856c723bcf1047b61b093b9bf92d36d71f7a402, src/compositions/index.tsx), which
 * follow Console's (018fe3214e0a118162d202c2f39f1236f37b1936).
 * Changes for standalone use: the app context, catalog view, i18n, routes, capabilities and project
 * data are replaced by slots and props; the DOM structure, class names and order are unchanged.
 * Marquee has no keyboard layer (none in the source). */
import type { ReactNode, RefObject } from "react";
import { SearchField } from "../components";
import { MessageBlock } from "../parts/page";

/* ───────── Shell ───────── */
export interface ShellSearch { label: string; placeholder?: string; clearLabel: string; value: string; onChange: (v: string) => void }
/** Marquee top bar: bold logo slot, search, compact tools (source: MarqueeHeader). */
export function MarqueeHeader({ logo, search, tools, searchRef }: {
  logo: ReactNode; search?: ShellSearch; tools?: ReactNode; searchRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <header className="wl-topbar">
      {logo}
      {search && (
        <div className="wl-topbar-search">
          <SearchField inputRef={searchRef} label={search.label} placeholder={search.placeholder} clearLabel={search.clearLabel} value={search.value} onChange={search.onChange} />
        </div>
      )}
      {tools && <div className="wl-tools">{tools}</div>}
    </header>
  );
}
/** Marquee page frame: header plus content (source: MarqueeShell). */
export function MarqueeShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return <div className="wl-home wl-marquee">{header}{children}</div>;
}
/** Main content area of a shell page (source: Page). */
export function Page({ children, className = "", id = "main" }: { children: ReactNode; className?: string; id?: string }) {
  return <main id={id} className={`wl-page ${className}`}>{children}</main>;
}

/* ───────── Collection (visual discovery) ───────── */
/** Marquee collection: intro row (large title, lead, optional action), an optional highlighted
 *  section, then the catalog section (chips, live count, state, shelves or a tile grid, more)
 *  (source: MarqueeHome). */
export function CollectionLayout({ title, lead, action, highlight, label, filters, count, children, mainId = "main" }: {
  title: ReactNode; lead?: ReactNode; action?: ReactNode;
  /** Optional section above the catalog (source: the "mine" section), e.g. a TileGrid with large tiles. */
  highlight?: ReactNode;
  /** Accessible name of the catalog section. */
  label: string;
  /** Typically FilterChips. */
  filters?: ReactNode;
  /** Live count (role="status"). */
  count?: ReactNode;
  /** CollectionStatus, Shelf elements or a TileGrid, and a LoadMore. */
  children: ReactNode; mainId?: string;
}) {
  return (
    <main id={mainId} className="wl-marquee-main">
      <div className="wl-marquee-intro">
        <div className="grid gap-3"><h1>{title}</h1>{lead !== undefined && <p className="wl-lead">{lead}</p>}</div>
        {action}
      </div>
      {highlight}
      <section aria-label={label} className="wl-section">
        {filters}
        <p role="status" className="wl-count">{count}</p>
        {children}
      </section>
    </main>
  );
}
/** A highlighted section above the catalog (source: the "mine" section of MarqueeHome). */
export function HighlightSection({ heading, headingId = "highlight-h", status, children, more }: {
  heading: ReactNode; headingId?: string; status?: ReactNode; children?: ReactNode; more?: ReactNode;
}) {
  return (
    <section aria-labelledby={headingId} className="wl-section">
      <h2 id={headingId}>{heading}</h2>
      {status}
      {children}
      {more}
    </section>
  );
}
/** A shelf: heading, optional "See all" action, and up to three tiles (source: `.wl-shelf`). */
export function Shelf({ heading, headingId, action, children }: { heading: ReactNode; headingId: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={headingId} className="wl-shelf">
      <div className="wl-shelf-head">
        <h2 id={headingId}>{heading}</h2>
        {action}
      </div>
      <ul className="wl-tiles">{children}</ul>
    </section>
  );
}
/** A wrapping grid of tiles: 1, 2 then 3 columns (source: `.wl-tiles`). */
export function TileGrid({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
  return <ul className={`wl-tiles${highlight ? " wl-tiles--mine" : ""}`}>{children}</ul>;
}
/** One tile's content: cover (or initials), heavy title, two-line tagline and a meta line. Wrap it in
 *  an ItemLink with className "wl-tile" (or "wl-tile wl-tile--large") inside <li className="min-w-0">
 *  (source: MarqueeTile). */
export function TileContent({ cover, title, summary, summaryLang, meta }: {
  cover?: ReactNode; title: ReactNode; summary?: ReactNode; summaryLang?: string; meta?: ReactNode;
}) {
  return (
    <>
      {cover}
      <span className="wl-tile-text">
        <span className="wl-tile-title">{title}</span>
        {summary !== undefined && <span lang={summaryLang} className="wl-tile-tagline">{summary}</span>}
        {meta !== undefined && <span className="wl-entry-meta">{meta}</span>}
      </span>
    </>
  );
}

/* ───────── Detail (banner and section cards) ───────── */
/** Marquee detail: a bounded 21:9 banner (or a short initials band without an image), path, large title,
 *  lead and chips; a side column (sticky from 64rem) with a panel; section cards in the body
 *  (source: MarqueeProject). DOM order = narrow reading order: banner, head, side, body. */
export function DetailLayout({ back, banner, bannerHasImage, path, title, lead, leadLang, chips, side, children, problem }: {
  back?: ReactNode;
  /** Typically a Cover: an image when available, otherwise initials (rendered as a short band). */
  banner: ReactNode; bannerHasImage?: boolean;
  path?: ReactNode; title: ReactNode; lead?: ReactNode; leadLang?: string;
  /** Short labels shown as chips under the lead. */
  chips?: ReactNode[];
  side?: ReactNode;
  /** CardSection elements. */
  children: ReactNode;
  /** Loading or problem state shown instead of the detail. */
  problem?: ReactNode;
}) {
  return (
    <Page className="wl-project wl-project--marquee">
      {back}
      {problem ?? (
        <div className="wl-project-grid">
          <div className={`wl-banner${bannerHasImage ? "" : " wl-banner--none"}`}>{banner}</div>
          <header className="wl-project-head">
            {path !== undefined && <p className="wl-path">{path}</p>}
            <h1>{title}</h1>
            {lead !== undefined && <p lang={leadLang} className="wl-lead">{lead}</p>}
            {chips?.length ? <p className="wl-chips">{chips.map((c, i) => <span key={i}>{c}</span>)}</p> : null}
          </header>
          <aside className="wl-project-side">{side}</aside>
          <div className="wl-project-body">{children}</div>
        </div>
      )}
    </Page>
  );
}
/** A raised section card with a heavy heading (source: `.wl-card-section`). */
export function CardSection({ id, heading, children }: { id: string; heading: ReactNode; children: ReactNode }) {
  return <section aria-labelledby={id} className="wl-card-section"><h2 id={id}>{heading}</h2>{children}</section>;
}
/** Bordered side panel (source: `.wl-panel`). */
export function Panel({ children }: { children: ReactNode }) {
  return <div className="wl-panel">{children}</div>;
}

/* ───────── Form and message pages ───────── */
/** Marquee form page: large heading; the form (`.wl-form`) is a raised card (source: `.wl-form-page` pages in Marquee framing). */
export function FormPage({ back, title, lead, children, wide }: { back?: ReactNode; title: ReactNode; lead?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <Page className={`wl-form-page${wide ? " wl-wide-page" : ""}`}>
      {back}
      <header className="wl-form-head"><h1>{title}</h1>{lead !== undefined && <p className="wl-lead">{lead}</p>}</header>
      {children}
    </Page>
  );
}
/** Message page framed by the shell (source: MessagePage). */
export function MessagePage(props: Parameters<typeof MessageBlock>[0]) {
  return <Page className="wl-form-page"><MessageBlock {...props} /></Page>;
}
