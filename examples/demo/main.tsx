// Folio demo: a presentation page and the neutral example screens, reached through a menu.
// Original code with synthetic data. It imports the BUILT package ("wakolab-design-systems-folio" is
// aliased to dist/ by examples/vite.config.ts), like an external project would.
// State lives in the URL hash, so it is kept while navigating and survives a reload:
//   #screen=overview|collection|article|form|message|states|components|registration
//   &mode=light|dark|system   &config=default|example (example loads /design/design-config.json,
//   with assetBase "/design/", from examples/config).
// Not covered here (later kit targets): editing values in the page, choosing local font and logo
// files, the single offline HTML file, Docker and the Figma companion.
import "wakolab-design-systems-folio/folio.css";
import "./demo.css";
import { StrictMode, useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  Alert, BackLink, Badge, Button, Card, Checkbox, ChoiceGroup, CodeField, CollectionGroup, CollectionLayout, CollectionStatus,
  ConfirmDialog, ConnectionRow, Cover, DetailLayout, DetailSection, Dialog, EditorialPanel, EmptyState, EntryContent, FilterChips,
  FolioHeader, FolioRoot, FolioShell, FormPage, IconButton, ItemLink, KeyValueList, LoadMore, LoadingState, LogoSlot, MessagePage,
  ModeMenu, Page, Panel, Popover, ProblemState, RegistrationFrame, SearchField, Select, Shortlist, ShortlistContent, Skeleton,
  Stepper, TabPanel, Tabs, TextField, Toast, ToggleChip, ToolButton, type DesignConfig, type FilterItem, type IconSet, type Mode,
} from "wakolab-design-systems-folio";

/* ───────── State in the hash ───────── */
const SCREENS = [
  ["overview", "Overview"], ["collection", "Collection"], ["article", "Article"], ["form", "Form"],
  ["message", "Message"], ["states", "States"], ["components", "Components"], ["registration", "Editorial frame"],
] as const;
type Screen = (typeof SCREENS)[number][0];
interface DemoState { screen: Screen; mode: Mode; config: "default" | "example" }
function readHash(): DemoState {
  const p = new URLSearchParams(location.hash.slice(1));
  const screen = (SCREENS.some(([id]) => id === p.get("screen")) ? p.get("screen") : "overview") as Screen;
  const mode = (["light", "dark", "system"].includes(p.get("mode") ?? "") ? p.get("mode") : "system") as Mode;
  return { screen, mode, config: p.get("config") === "example" ? "example" : "default" };
}
const hashOf = (s: DemoState) => `#screen=${s.screen}&mode=${s.mode}&config=${s.config}`;

/* ───────── Synthetic data ───────── */
const CATEGORIES: FilterItem[] = [
  { id: "science", label: "Science", children: [{ id: "science/climate", label: "Climate" }, { id: "science/biology", label: "Biology" }] },
  { id: "civic", label: "Civic", children: [{ id: "civic/transport", label: "Transport" }] },
  { id: "culture", label: "Culture" },
];
const ITEMS = [
  { id: "coastal-temperatures", name: "Coastal temperatures", summary: "Daily sea-surface readings from six buoys along the coast.", cat: "science/climate", path: "Science › Climate", access: "Public data" },
  { id: "pollinator-counts", name: "Pollinator counts", summary: "Weekly counts from community gardens, with photos and notes.", cat: "science/biology", path: "Science › Biology", access: "Public data" },
  { id: "bus-punctuality", name: "Bus punctuality", summary: "Departures and delays per stop, updated every hour.", cat: "civic/transport", path: "Civic › Transport", access: "Restricted data" },
  { id: "library-loans", name: "Library loans", summary: "Anonymous loan counts per branch and month.", cat: "culture", path: "Culture", access: "Public data" },
  { id: "long-title", name: "A deliberately long dataset title that wraps on narrow screens without hiding any word", summary: "A long summary to check wrapping in the editorial index.", cat: "science/climate", path: "Science › Climate", access: "Public data" },
];

/* ───────── Shell and menu ───────── */
function Header({ state, go }: { state: DemoState; go: (s: Partial<DemoState>) => void }) {
  return (
    <FolioHeader
      logo={<LogoSlot label="Field Lab" accessibleName="Field Lab, overview" href={hashOf({ ...state, screen: "overview" })} onHome={() => go({ screen: "overview" })} />}
      tools={<>
        <ModeMenu label="Appearance" modeLabel="Mode" labels={{ light: "Light", dark: "Dark", system: "System" }} />
        <ToolButton icon="globe" label="Language" value="English" compact valueLang="en" />
      </>} />
  );
}
function Menu({ state, go }: { state: DemoState; go: (s: Partial<DemoState>) => void }) {
  return (
    <nav aria-label="Demo screens" className="demo-menu">
      <ul>
        {SCREENS.map(([id, label]) => (
          <li key={id}>
            <a href={hashOf({ ...state, screen: id })} className="wl-tool" aria-current={state.screen === id ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); go({ screen: id }); }}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
function Shell({ state, go, children }: { state: DemoState; go: (s: Partial<DemoState>) => void; children: ReactNode }) {
  return <FolioShell header={<><Header state={state} go={go} /><Menu state={state} go={go} /></>}>{children}</FolioShell>;
}

/* ───────── Screens ───────── */
function Overview({ state, go }: { state: DemoState; go: (s: Partial<DemoState>) => void }) {
  const swatch = (role: string) => <div key={role} className="demo-swatch"><span style={{ background: `var(--wl-${role})` }} /><code>{role}</code></div>;
  return (
    <Page className="demo-grid">
      <header className="wl-form-head">
        <p className="wl-eyebrow">Design system</p>
        <h1>Folio</h1>
        <p className="wl-lead">An editorial system: sans interface type with a serif display face, a grouped index under group titles, articles with a sticky side card, softer radii and calm 150 ms motion. Everything below is rendered with Folio's own components.</p>
      </header>
      <section className="demo-card" aria-labelledby="ov-config">
        <h2 id="ov-config">Configuration</h2>
        <p className="wl-meta-text">Values in a design-config.json are applied exactly as written; omitted roles keep Folio's defaults. Switch between the shipped defaults and the example configuration (colours, display font and logo from examples/config).</p>
        <div className="demo-row" role="group" aria-label="Configuration">
          <ToggleChip pressed={state.config === "default"} onClick={() => go({ config: "default" })}>Shipped defaults</ToggleChip>
          <ToggleChip pressed={state.config === "example"} onClick={() => go({ config: "example" })}>Example configuration</ToggleChip>
        </div>
      </section>
      <section className="demo-card" aria-labelledby="ov-colours">
        <h2 id="ov-colours">Colour roles</h2>
        <div className="demo-swatches">{["bg", "surface", "surface-2", "ink", "muted", "border", "control", "action", "action-hover", "link", "focus", "success", "warning", "danger", "info"].map(swatch)}</div>
        <h3>Editorial panel (Folio-declared roles)</h3>
        <div className="demo-panel"><p className="demo-eyebrow">panel-accent</p><p>on-panel text on the panel background. Each of the three roles keeps its own default when omitted.</p></div>
      </section>
      <section className="demo-card" aria-labelledby="ov-type">
        <h2 id="ov-type">Typography</h2>
        <p style={{ fontFamily: "var(--wl-font-display)", fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.01em" }}>Display — Source Serif 4</p>
        <p style={{ fontFamily: "var(--wl-font-ui)" }}>Interface — DM Sans, 16 px, rows of at least 56 px.</p>
        <p className="wl-prose">Prose — DM Sans with a 1.65 line height and a 68-character measure, for leads and long descriptions.</p>
      </section>
      <section className="demo-card" aria-labelledby="ov-use">
        <h2 id="ov-use">Use it</h2>
        <ul className="demo-list">
          <li>Render every screen inside <code>FolioRoot</code> and import <code>wakolab-design-systems-folio/folio.css</code> once.</li>
          <li>Pass your own icon set: Folio ships no icon artwork, so icon slots stay empty here.</li>
          <li>See README.md, AGENTS.md and docs/rules/ in the repository.</li>
        </ul>
        <p className="wl-meta-text">Kit status: this demo runs with Node (npm run example). The single offline HTML file, Docker start and Figma companion are later kit targets, not delivered yet.</p>
      </section>
    </Page>
  );
}

function CollectionScreen({ go }: { go: (s: Partial<DemoState>) => void }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(""); const [sub, setSub] = useState("");
  const items = ITEMS.filter((i) => (!cat || i.cat.startsWith(sub || cat)) && (!query || (i.name + " " + i.summary).toLowerCase().includes(query.toLowerCase())));
  const groups = cat || query ? [{ id: "results", label: "", items }]
    : CATEGORIES.map((c) => ({ id: c.id, label: c.label, items: items.filter((i) => i.cat.startsWith(c.id)) })).filter((g) => g.items.length);
  const entry = (i: (typeof ITEMS)[number]) => (
    <li key={i.id} className="wl-entry">
      <ItemLink href="#screen=article" itemId={i.id} className="wl-entry-link" onOpen={() => go({ screen: "article" })}>
        <EntryContent cover={<Cover name={i.name} />} title={i.name} summary={i.summary} summaryLang="en"
          meta={<><span className="wl-path">{i.path}</span><span className="wl-meta">{i.access}</span></>} />
      </ItemLink>
    </li>
  );
  return (
    <CollectionLayout title="Datasets" lead="Synthetic datasets for the Folio demo, grouped by topic. Nothing here is real."
      action={<Button variant="ghost">Suggest a dataset</Button>}
      shortlist={<Shortlist heading="Following">
        {ITEMS.slice(0, 2).map((i) => (
          <li key={i.id} className="wl-mine-entry">
            <ItemLink href="#screen=article" itemId={`f-${i.id}`} className="wl-mine-link" onOpen={() => go({ screen: "article" })}>
              <ShortlistContent cover={<Cover name={i.name} />} title={i.name} meta={<span className="wl-meta">Updated weekly</span>} />
            </ItemLink>
          </li>
        ))}
      </Shortlist>}
      filters={<>
        <SearchField label="Search datasets" placeholder="Dataset name or summary" clearLabel="Clear search" value={query} onChange={setQuery} />
        <FilterChips items={CATEGORIES} value={cat} subValue={sub} onChange={(v, s) => { setCat(v); setSub(s); }} label="Category" allLabel="All" subLabel="Subcategory" />
      </>}
      count={`${items.length} dataset${items.length === 1 ? "" : "s"}`}>
      <CollectionStatus state={items.length === 0
        ? { status: "noResults", title: "No dataset matches", body: "Try another word or clear the filters.", clearLabel: "Clear filters", onClear: () => { setCat(""); setSub(""); setQuery(""); } }
        : { status: "ready" }} />
      {groups.map((g) => <CollectionGroup key={g.id} title={g.label || undefined} titleId={`g-${g.id}`}>{g.items.map(entry)}</CollectionGroup>)}
      {items.length > 0 && <LoadMore shownLabel={`Showing ${items.length} of 12`} more actionLabel="Show more datasets" onMore={() => {}} />}
    </CollectionLayout>
  );
}

function ArticleScreen({ go }: { go: (s: Partial<DemoState>) => void }) {
  const item = ITEMS[0];
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<string>();
  return (
    <>
      <DetailLayout back={<BackLink href="#screen=collection" label="Back to datasets" onBack={() => go({ screen: "collection" })} />}
        eyebrow={item.path} title={item.name} lead={item.summary} leadLang="en"
        side={<>
          <Panel>
            <p className="wl-meta-text">Open to edits. Requests are answered by the maintainers.</p>
            <Button size="lg" id="request" onClick={() => setConfirm(true)}>Request access</Button>
          </Panel>
          <KeyValueList items={[{ key: "Category", value: item.path }, { key: "Access", value: item.access }, { key: "Updated", value: "2026-11-02" }, { key: "Language", value: <span lang="en">English</span> }]} />
        </>}>
        <DetailSection id="about-h" heading="About"><p className="wl-prose" lang="en">Readings are collected by volunteers at dawn and checked every week. Each buoy reports temperature, salinity and wave height. Synthetic text for the Folio demo.</p></DetailSection>
        <DetailSection id="method-h" heading="Method"><p className="wl-prose" lang="en">Values outside the expected range are flagged, never removed. A short note explains each flag.</p></DetailSection>
        <DetailSection id="files-h" heading="Files"><EmptyState icon="doc" title="No file yet">Files you add appear here.</EmptyState></DetailSection>
      </DetailLayout>
      <ConfirmDialog open={confirm} title={`Request access to ${item.name}?`} body="The maintainers review each request. You can withdraw it later."
        confirmLabel="Send request" cancelLabel="Not now" closeLabel="Close" onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); setToast("Request sent (example)."); }} />
      <Toast message={toast} onDone={() => setToast(undefined)} />
    </>
  );
}

function FormScreen({ go }: { go: (s: Partial<DemoState>) => void }) {
  const [name, setName] = useState("fl");
  const [error, setError] = useState<string>();
  const [view, setView] = useState("entries");
  return (
    <FormPage back={<BackLink href="#screen=collection" label="Back to datasets" onBack={() => go({ screen: "collection" })} />} title="Settings" lead="Synthetic settings form. Nothing is saved.">
      <form noValidate className="wl-form" onSubmit={(e) => { e.preventDefault(); setError(name.trim().length < 3 ? "Use at least 3 characters." : undefined); }}>
        <TextField id="team" label="Team name" required value={name} onChange={(e) => setName(e.target.value)} error={error} hint="Shown on shared datasets." />
        <div className="wl-form-row">
          <TextField id="email" label="Email" value="team@example.test" readOnly />
          <Select id="tz" label="Time zone"><option>UTC</option><option>Europe/Brussels</option></Select>
        </div>
        <ChoiceGroup label="Default view" value={view} onChange={setView} options={[{ value: "entries", label: "Entries with summary" }, { value: "titles", label: "Titles only" }]} />
        <Checkbox label="Email me when a dataset I follow changes" defaultChecked />
        <div className="demo-row"><Button type="submit">Save changes</Button><Button variant="ghost" type="reset">Discard</Button></div>
      </form>
    </FormPage>
  );
}

function MessageScreen({ go }: { go: (s: Partial<DemoState>) => void }) {
  return <MessagePage icon="search" title="This page doesn't exist" body="The link may be wrong or out of date." action={<Button variant="secondary" onClick={() => go({ screen: "collection" })}>Back to datasets</Button>} />;
}

function StatesScreen() {
  return (
    <Page className="demo-grid">
      <h1>States</h1>
      <section className="demo-card"><h2>Collection loading</h2><CollectionStatus state={{ status: "loading", label: "Loading datasets…" }} /></section>
      <section className="demo-card"><h2>Collection unavailable</h2><CollectionStatus state={{ status: "unavailable", title: "Datasets are unavailable right now", body: "Try again in a moment.", retryLabel: "Try again", onRetry: () => {} }} /></section>
      <section className="demo-card"><h2>Nothing published</h2><CollectionStatus state={{ status: "empty", title: "No dataset yet", body: "Published datasets appear here." }} /></section>
      <section className="demo-card"><h2>No results</h2><CollectionStatus state={{ status: "noResults", title: "No dataset matches", body: "Try another word.", clearLabel: "Clear filters", onClear: () => {} }} /></section>
      <section className="demo-card"><h2>Article loading</h2><LoadingState label="Loading the dataset…" /></section>
      <section className="demo-card"><h2>Article problem</h2><ProblemState title="The dataset couldn't be loaded" body="Try again in a moment." retryLabel="Try again" onRetry={() => {}} /></section>
    </Page>
  );
}

function ComponentsScreen() {
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<string>();
  const [chip, setChip] = useState(true);
  const [tab, setTab] = useState<"one" | "two" | "three">("one");
  const [search, setSearch] = useState("buoy");
  return (
    <>
      <Page className="demo-grid">
        <h1>Components</h1>
        <section className="demo-card"><h2>Buttons</h2>
          <div className="demo-row"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Delete</Button></div>
          <div className="demo-row"><Button size="sm">Small</Button><Button size="lg">Large</Button><Button busy>Saving</Button><Button disabled>Disabled</Button><IconButton label="Close">×</IconButton></div>
        </section>
        <section className="demo-card"><h2>Fields</h2>
          <TextField id="f1" label="Name" defaultValue="Coastal temperatures" />
          <TextField id="f2" label="Code" defaultValue="C" error="Use 2 to 8 letters." />
          <TextField id="f3" label="Owner" defaultValue="Not editable" disabled />
          <CodeField id="f4" label="Six-digit code" hint="Sent to your email." />
          <SearchField label="Search" value={search} onChange={setSearch} clearLabel="Clear search" hideLabel={false} />
        </section>
        <section className="demo-card"><h2>Choices</h2>
          <Checkbox label="Include archived datasets" defaultChecked />
          <ChoiceGroup label="Delimiter" value="comma" onChange={() => {}} options={[{ value: "comma", label: "Comma" }, { value: "tab", label: "Tab" }]} />
          <div className="demo-row"><ToggleChip pressed={chip} onClick={() => setChip(!chip)}>Open</ToggleChip><ToggleChip pressed={!chip} onClick={() => setChip(!chip)} note="3">Closed</ToggleChip></div>
          <FilterChips items={CATEGORIES} value="science" subValue="" onChange={() => {}} label="Category" allLabel="All" subLabel="Subcategory" />
        </section>
        <section className="demo-card"><h2>Tabs and popover</h2>
          <Tabs idBase="demo-tabs" label="Example" value={tab} onChange={setTab} tabs={[{ id: "one", label: "Summary" }, { id: "two", label: "History" }, { id: "three", label: "Files" }]} />
          <TabPanel idBase="demo-tabs" tab={tab}><p className="wl-prose">Panel for {tab}. Arrow keys move between tabs.</p></TabPanel>
          <Popover label="More actions" align="start" trigger={(p) => <button {...p} ref={p.ref as React.Ref<HTMLButtonElement>} id="more-actions" type="button" className="wl-tool">Actions</button>}>
            {(close) => <div className="grid gap-1"><button type="button" className="wl-option demo-left" onClick={close}>Duplicate</button><button type="button" className="wl-option demo-left" onClick={close}>Rename</button></div>}
          </Popover>
        </section>
        <section className="demo-card"><h2>Feedback</h2>
          <Alert tone="info">Sync runs every hour.</Alert><Alert tone="success">Export finished.</Alert><Alert tone="warning">2 rows need review.</Alert><Alert tone="error">The file couldn't be read.</Alert>
          <div className="demo-row"><Badge>Draft</Badge><Badge>Public</Badge></div>
          <div className="demo-row"><Button variant="secondary" id="toast-btn" onClick={() => setToast("Saved. This message is not urgent.")}>Show toast</Button>
            <Button variant="secondary" id="dialog-btn" onClick={() => setDialog(true)}>Open dialog</Button>
            <Button variant="secondary" id="confirm-btn" onClick={() => setConfirm(true)}>Open confirmation</Button></div>
        </section>
        <section className="demo-card"><h2>Structure</h2>
          <Card><h3>Card</h3><p className="wl-meta-text">Storage: 38.2 GB of 50 GB.</p></Card>
          <Stepper steps={["Upload", "Check", "Publish"]} current={1} />
          <ConnectionRow name="Archive service" status="Not available yet" description="Connections are not part of this demo." />
          <KeyValueList items={[{ key: "Owner", value: "data-team" }, { key: "Updated", value: "2026-11-02" }]} />
          <div className="demo-row"><div className="demo-cover"><Cover name="Coastal temperatures" /></div><div className="demo-stack"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-3/4" /></div></div>
          <EmptyState icon="spark" title="No export yet">Exports you run appear here.</EmptyState>
        </section>
      </Page>
      <Dialog open={dialog} onClose={() => setDialog(false)} title="Archive this dataset?" closeLabel="Close" headerClose description="It leaves the open list. You can restore it later."
        actions={<div className="demo-row demo-end"><Button variant="secondary" data-autofocus onClick={() => setDialog(false)}>Keep</Button><Button onClick={() => setDialog(false)}>Archive</Button></div>}>
        <p className="wl-meta-text">Synthetic dialog content.</p>
      </Dialog>
      <ConfirmDialog open={confirm} destructive title="Delete this dataset?" body="This removes it from the demo." confirmLabel="Delete" cancelLabel="Cancel" closeLabel="Close"
        onCancel={() => setConfirm(false)} onConfirm={() => setConfirm(false)} />
      <Toast message={toast} onDone={() => setToast(undefined)} />
    </>
  );
}

function RegistrationScreen({ state, go }: { state: DemoState; go: (s: Partial<DemoState>) => void }) {
  // The home link keeps mode and configuration, like the menu (review F-R2 on folio#5).
  return (
    <RegistrationFrame screen="email"
      brand={<LogoSlot label="Field Lab" accessibleName="Field Lab, overview" href={hashOf({ ...state, screen: "overview" })} onHome={() => go({ screen: "overview" })} />}
      tools={<ModeMenu label="Appearance" modeLabel="Mode" labels={{ light: "Light", dark: "Dark", system: "System" }} />}
      eyebrow="Open community" title="Join the workspace" lead="One account for people and their tools. You can leave at any time."
      aside={<EditorialPanel label="Field Lab" eyebrow="Open community" title="Build things together, in the open."
        text="Share datasets, review changes and keep a clear record of who did what." footer="People and tools work side by side." />}
      steps={<Stepper steps={["Email", "Code"]} current={0} />}
      heading="Start with your email" description="We send a one-time code to this address."
      status={<p id="status" role="status" />} footnote="We never share your address.">
      <TextField id="reg-email" label="Email address" type="email" defaultValue="sam@example.com" />
      <Button>Continue</Button>
    </RegistrationFrame>
  );
}

/* ───────── App ───────── */
function App() {
  const [state, setState] = useState<DemoState>(readHash);
  const [config, setConfig] = useState<DesignConfig | undefined>();
  useEffect(() => {
    const onHash = () => setState(readHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (state.config !== "example") { setConfig(undefined); return; }
    let live = true;
    fetch("/design/design-config.json").then((r) => r.json()).then((c) => { if (live) setConfig(c); });
    return () => { live = false; };
  }, [state.config]);
  const go = (next: Partial<DemoState>) => {
    const s = { ...state, ...next };
    if (hashOf(s) !== location.hash) location.hash = hashOf(s);
    setState(s);
    if (next.screen) scrollTo(0, 0);
  };
  // Test-only hook: icon path data can be injected by a test harness (no icon artwork ships here).
  const icons = (window as unknown as { __FOLIO_ICONS__?: IconSet }).__FOLIO_ICONS__;
  const screens: Record<Screen, () => ReactNode> = {
    overview: () => <Overview state={state} go={go} />, collection: () => <CollectionScreen go={go} />, article: () => <ArticleScreen go={go} />,
    form: () => <FormScreen go={go} />, message: () => <MessageScreen go={go} />, states: () => <StatesScreen />,
    components: () => <ComponentsScreen />, registration: () => <RegistrationScreen state={state} go={go} />,
  };
  return (
    <FolioRoot mode={state.mode} onModeChange={(mode) => go({ mode })} config={config} assetBase="/design/" icons={icons} className="demo-root">
      {state.screen === "registration"
        ? <><Menu state={state} go={go} />{screens.registration()}</>
        : <Shell state={state} go={go}>{screens[state.screen]()}</Shell>}
    </FolioRoot>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
