/* Folio compositions with slots.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272:
 *  - shell:      web/src/features/catalog/compositions/shells.tsx (FolioHeader, FolioShell), shared.tsx (Tools, Page)
 *  - collection: compositions/FolioHome.tsx (FolioHome, FolioEntry, FolioMineEntry)
 *  - detail:     compositions/projects.tsx (FolioProject)
 *  - form, message: web/src/features/catalog/pages.tsx (`.wl-form-page` framing, MessagePage)
 * (standard KIT_PROPOSAL §8, Folio). Structure follows Console's compositions (wakolab-design-systems-console
 * at 018fe3214e0a118162d202c2f39f1236f37b1936, src/compositions/index.tsx).
 * Changes for standalone use: the app context, catalog view, i18n, routes, capabilities and project
 * data are replaced by slots and props; the DOM structure, class names and order are unchanged.
 * Folio has no keyboard layer (none in the source). */
import type { ReactNode } from "react";
import { MessageBlock } from "../parts/page";

/* ───────── Shell ───────── */
/** Folio top bar: logo slot on the left, tools on the right (source: FolioHeader; no header search). */
export function FolioHeader({ logo, tools }: { logo: ReactNode; tools?: ReactNode }) {
  return (
    <header className="wl-topbar">
      {logo}
      {tools && <div className="wl-tools">{tools}</div>}
    </header>
  );
}
/** Folio page frame: header plus content (source: FolioShell). */
export function FolioShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return <div className="wl-home wl-folio">{header}{children}</div>;
}
/** Main content area of a shell page (source: Page). */
export function Page({ children, className = "", id = "main" }: { children: ReactNode; className?: string; id?: string }) {
  return <main id={id} className={`wl-page ${className}`}>{children}</main>;
}

/* ───────── Collection (editorial index) ───────── */
/** Folio collection: intro (serif title, lead, optional action); an optional shortlist section;
 *  then the catalog: filters column (sticky from 64rem: search, chips, live count) and the
 *  grouped index (source: FolioHome). */
export function CollectionLayout({ title, lead, action, shortlist, filters, count, children, mainId = "main" }: {
  title: ReactNode; lead?: ReactNode; action?: ReactNode;
  /** Optional section above the catalog (source: the "mine" section), e.g. a Shortlist. */
  shortlist?: ReactNode;
  /** Filters column content: typically a SearchField and FilterChips. */
  filters?: ReactNode;
  /** Live count under the filters (role="status"). */
  count?: ReactNode;
  /** The index: CollectionGroup elements, a CollectionStatus and a LoadMore. */
  children: ReactNode; mainId?: string;
}) {
  return (
    <main id={mainId} className="wl-folio-main">
      <div className="wl-folio-intro">
        <h1>{title}</h1>
        {lead !== undefined && <p className="wl-lead">{lead}</p>}
        {action && <div>{action}</div>}
      </div>
      {shortlist}
      <div className="wl-folio-catalog">
        <div className="wl-folio-filters">
          {filters}
          <p role="status" className="wl-count">{count}</p>
        </div>
        <div className="wl-folio-index">{children}</div>
      </div>
    </main>
  );
}
/** One group of the index, under an uppercase group title (source: `.wl-group`). Without a title the
 *  group is a plain list (search results). */
export function CollectionGroup({ title, titleId, children }: { title?: ReactNode; titleId?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={title ? titleId : undefined} className="wl-group">
      {title && <h2 id={titleId} className="wl-group-title">{title}</h2>}
      <ul>{children}</ul>
    </section>
  );
}
/** One entry of a group: cover, serif title, tagline and a meta line. Wrap it in an ItemLink with
 *  className "wl-entry-link" inside an <li className="wl-entry"> (source: FolioEntry). */
export function EntryContent({ cover, title, summary, summaryLang, meta }: {
  cover?: ReactNode; title: ReactNode; summary?: ReactNode; summaryLang?: string; meta?: ReactNode;
}) {
  return (
    <>
      {cover}
      <span className="wl-entry-text">
        <span className="wl-entry-title">{title}</span>
        {summary !== undefined && <span lang={summaryLang} className="wl-entry-tagline">{summary}</span>}
        {meta !== undefined && <span className="wl-entry-meta">{meta}</span>}
      </span>
    </>
  );
}
/** A short, highlighted list above the catalog (source: the "mine" section of FolioHome, with
 *  `.wl-mine-list` and `.wl-mine-link`). Items: <li className="wl-mine-entry"> with an ItemLink of
 *  className "wl-mine-link" containing ShortlistContent. */
export function Shortlist({ heading, headingId = "shortlist-h", status, children, more }: {
  heading: ReactNode; headingId?: string; status?: ReactNode; children?: ReactNode; more?: ReactNode;
}) {
  return (
    <section aria-labelledby={headingId} className="wl-folio-mine">
      <h2 id={headingId}>{heading}</h2>
      {status}
      {children && <ul className="wl-mine-list">{children}</ul>}
      {more}
    </section>
  );
}
export function ShortlistContent({ cover, title, meta }: { cover?: ReactNode; title: ReactNode; meta?: ReactNode }) {
  return (
    <>
      {cover}
      <span className="grid gap-1 min-w-0">
        <span className="wl-entry-title">{title}</span>
        {meta !== undefined && <span className="wl-entry-meta">{meta}</span>}
      </span>
    </>
  );
}

/* ───────── Detail (article) ───────── */
/** Folio article: eyebrow path, serif title and display lead; a side column (sticky from 64rem) with
 *  a panel and facts; the body with an optional bounded figure and sections (source: FolioProject).
 *  DOM order = narrow reading order: head, side, body. */
export function DetailLayout({ back, eyebrow, title, lead, leadLang, side, figure, children, problem }: {
  back?: ReactNode; eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; leadLang?: string;
  side?: ReactNode;
  /** Bounded figure shown only when there is an image (source: `.wl-cover-bounded`). */
  figure?: ReactNode;
  /** DetailSection elements. */
  children: ReactNode;
  /** Loading or problem state shown instead of the article. */
  problem?: ReactNode;
}) {
  return (
    <Page className="wl-project wl-project--folio">
      {back}
      {problem ?? (
        <article className="wl-project-grid">
          <header className="wl-project-head">
            {eyebrow !== undefined && <p className="wl-eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {lead !== undefined && <p lang={leadLang} className="wl-lead wl-lead--display">{lead}</p>}
          </header>
          <aside className="wl-project-side">{side}</aside>
          <div className="wl-project-body">
            {figure && <div className="wl-cover-bounded">{figure}</div>}
            {children}
          </div>
        </article>
      )}
    </Page>
  );
}
/** One article section with a serif heading (source: `.wl-block`). */
export function DetailSection({ id, heading, children }: { id: string; heading: ReactNode; children: ReactNode }) {
  return <section aria-labelledby={id} className="wl-block"><h2 id={id}>{heading}</h2>{children}</section>;
}
/** Bordered side panel (source: `.wl-panel`). */
export function Panel({ children }: { children: ReactNode }) {
  return <div className="wl-panel">{children}</div>;
}

/* ───────── Form and message pages ───────── */
/** Folio form page: centered column with a serif title (source: `.wl-form-page` pages in Folio framing). */
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
