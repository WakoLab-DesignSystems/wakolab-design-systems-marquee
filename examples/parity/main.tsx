// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at 0856c723bcf1047b61b093b9bf92d36d71f7a402, examples/parity/main.tsx; Folio names → Marquee names (Marquee adaptations noted where they apply).
// Candidate screens for the visual parity check (standard EXTRACTION_MATRIX §8; KIT_PROPOSAL §8): the
// same synthetic texts as the frontend's Marquee baselines, rendered with the built Marquee package.
// ?screen=collection|detail|notFound|message|loading|unavailable|dialog  &mode=light|dark
// Icon path data is not part of this repository (EXTRACTION_MATRIX §10, E4): the capture script
// may inject a set at run time through window.__MARQUEE_ICONS__.
// Structure copied from wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// examples/parity/main.tsx; the screens follow the frontend's MarqueeHome (search in the top bar, shelves of
// tiles), MarqueeProject (banner, card sections) and Marquee pages.
import "wakolab-design-systems-marquee/marquee.css";
import "./parity.css";
import { createRoot } from "react-dom/client";
import { useState, type ReactNode } from "react";
import {
  BackLink, Button, CardSection, CollectionLayout, CollectionStatus, Cover, DetailLayout, Dialog,
  FilterChips, Shelf, TileContent, MarqueeHeader, MarqueeRoot, MarqueeShell, Icon, ItemLink, KeyValueList, LogoSlot, MessagePage, Panel, Popover, SearchField,
  ToolButton, type IconSet, type Mode,
} from "wakolab-design-systems-marquee";
import { detail, groups, rows, text } from "./fixtures";

const params = new URLSearchParams(location.search);
const screen = params.get("screen") ?? "collection";
const mode = (params.get("mode") as Mode) || "light";

function Tool({ icon, label, value, compact, hideValue, valueLang }: { icon: "palette" | "globe"; label: string; value?: string; compact?: boolean; hideValue?: boolean; valueLang?: string }) {
  return (
    <Popover label={label} trigger={(p) => <ToolButton {...p} icon={icon} label={label} value={value} compact={compact} hideValue={hideValue} valueLang={valueLang} />}>
      {() => null}
    </Popover>
  );
}
function Shell({ children }: { children: ReactNode }) {
  const [q, setQ] = useState("");
  return (
    <>
      <a href="#main" className="wl-skip">{text.skip}</a>
      <MarqueeShell header={
        <MarqueeHeader logo={<LogoSlot label={text.brand} accessibleName={text.brandName} />}
          search={{ label: text.searchLabel, placeholder: text.searchPlaceholder, clearLabel: text.clear, value: q, onChange: setQ }}
          tools={<><Tool icon="palette" label={text.appearance} value={text.appearanceValue} compact /><Tool icon="globe" label={text.language} value="English" valueLang="en" compact hideValue />
            <Button id="sign-in" className="wl-signin">{text.signIn}</Button></>} />
      }>{children}</MarqueeShell>
    </>
  );
}
function Collection({ state }: { state: "ready" | "loading" | "unavailable" }) {
  return (
    <Shell>
      <CollectionLayout title={text.title} lead={text.lead} label={text.sectionLabel}
        filters={<FilterChips items={groups.map((g) => ({ id: g.id, label: g.label }))} value="" onChange={() => {}} label={text.category} allLabel={text.all} subLabel="Subcategory" />}
        count={state === "ready" ? text.count : ""}>
        {state === "loading" ? <CollectionStatus tiles state={{ status: "loading", label: text.loading }} />
          : state === "unavailable" ? <CollectionStatus tiles state={{ status: "unavailable", title: text.unavailableTitle, body: text.unavailableBody, retryLabel: text.retry, onRetry: () => {} }} />
          : groups.map((g) => (
            <Shelf key={g.id} heading={g.label} headingId={`sh-${g.id}`}>
              {g.slugs.map((slug) => rows.find((r) => r.slug === slug)!).map((r) => (
                <li key={r.slug} className="min-w-0">
                  <ItemLink href={`?screen=detail&slug=${r.slug}`} itemId={r.slug} className="wl-tile">
                    <TileContent cover={<Cover name={r.name} />} title={r.name} summary={r.summary} summaryLang={r.lang}
                      meta={<><span className="wl-meta"><Icon name={r.codeIcon} size={16} />{r.code}</span><span className="wl-meta">{r.access}</span></>} />
                  </ItemLink>
                </li>
              ))}
            </Shelf>
          ))}
      </CollectionLayout>
    </Shell>
  );
}
function Detail() {
  return (
    <Shell>
      <DetailLayout back={<BackLink id="skip-profile" label={text.back} />} banner={<Cover name={detail.title} eager />}
        path={detail.facts[0].value} title={detail.title} lead={detail.lead} leadLang="en"
        side={
          <Panel>
            <div className="wl-join grid gap-2">
              <p className="wl-join-title">{detail.joinTitle}</p>
              <p className="wl-meta-text">{detail.join}</p>
              <p className="wl-meta-text wl-with-icon"><Icon name="clock" size={18} />{detail.joinNote}</p>
            </div>
            <div className="wl-access">
              <Icon name="repo" className="text-muted" />
              <div><p className="font-semibold">{detail.accessTitle}</p><p className="wl-meta-text">{detail.access}</p></div>
            </div>
          </Panel>
        }>
        <CardSection id="about-h" heading={detail.about}>
          <p lang="en" className="wl-prose">{detail.body}</p>
          <KeyValueList items={detail.facts.map((f) => ({ key: f.key, value: "lang" in f ? <span lang={f.lang}>{f.value}</span> : f.value }))} />
          <p className="wl-meta-text wl-with-icon"><Icon name="info" size={18} />{detail.note}</p>
        </CardSection>
      </DetailLayout>
    </Shell>
  );
}
function Message({ icon, title, body }: { icon: "search" | "doc"; title: string; body: string }) {
  return <Shell><MessagePage icon={icon} title={title} body={body} action={<Button variant="secondary">{text.back}</Button>} /></Shell>;
}
function WithDialog() {
  return (
    <>
      <Collection state="ready" />
      <Dialog open onClose={() => {}} title={text.dialogTitle} closeLabel={text.close} headerClose description={text.dialogBody}
        actions={<Button data-autofocus>{text.dialogAction}</Button>}>{null}</Dialog>
    </>
  );
}
const screens: Record<string, () => ReactNode> = {
  collection: () => <Collection state="ready" />, loading: () => <Collection state="loading" />, unavailable: () => <Collection state="unavailable" />,
  detail: () => <Detail />, notFound: () => <Message icon="search" title={text.notFoundTitle} body={text.notFoundBody} />,
  message: () => <Message icon="doc" title={text.proposeTitle} body={text.proposeBody} />, dialog: () => <WithDialog />,
};
const icons = (window as unknown as { __MARQUEE_ICONS__?: IconSet }).__MARQUEE_ICONS__;
createRoot(document.getElementById("app")!).render(
  <MarqueeRoot mode={mode} icons={icons}>{(screens[screen] ?? screens.collection)()}</MarqueeRoot>,
);
