// Test harness: mounts Folio roots on demand so that tests can check configuration and
// isolation (standard INDEPENDENCE_CHECK §3–§4). Original code; synthetic content only.
// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// examples/harness/main.tsx. Changes for Folio: Folio names; no keyboard layer (Folio has none);
// an editorial panel (declared panel roles) with a focusable element inside it.
// ?nocss=1 skips the Folio stylesheet (used to compare host styles with and without it).
import { createRoot, type Root } from "react-dom/client";
import { useRef, useState } from "react";
import {
  Button, Dialog, EditorialPanel, FolioRoot, ItemLink, LogoSlot, Popover, registeredFaceSets, SearchField,
  type FolioRootProps, type Diagnostic,
} from "wakolab-design-systems-folio";

const params = new URLSearchParams(location.search);
const ready = params.get("nocss") ? Promise.resolve() : import("wakolab-design-systems-folio/folio.css");

function Content({ id }: { id: string }) {
  const search = useRef<HTMLInputElement>(null);
  return (
    <div className="wl-home wl-folio">
      <header className="wl-topbar"><LogoSlot label={`Root ${id}`} /></header>
      <main className="wl-page" id={`${id}-main`}>
        <p className="wl-lead" id={`${id}-lead`}>Synthetic content of root {id}.</p>
        <span id={`${id}-ui`} style={{ fontFamily: "var(--wl-font-ui)" }}>ui text Wg</span>
        <span id={`${id}-prose`} style={{ fontFamily: "var(--wl-font-prose)" }}>prose text Wg</span>
        <h1 id={`${id}-display`} style={{ fontFamily: "var(--wl-font-display)" }}>display text Wg</h1>
        <code id={`${id}-code`} style={{ fontFamily: "var(--wl-font-code)" }}>code text Wg</code>
        <Button id={`${id}-primary`}>Primary</Button>
        <Button id={`${id}-ghost`} variant="ghost">Ghost</Button>
        <a href="#x" id={`${id}-link`} className="wl-back">Link</a>
        <div className="wl-skeleton" id={`${id}-skeleton`} style={{ height: 12 }} />
        <Popover label={`Outer ${id}`} align="start" trigger={(p) => <button {...p} ref={p.ref as React.Ref<HTMLButtonElement>} id={`${id}-pop`} type="button" className="wl-tool">Outer</button>}>
          {() => (
            <div className="grid gap-1">
              <button type="button" id={`${id}-pop-item`} className="wl-option">Item</button>
              <Popover label={`Inner ${id}`} align="start" trigger={(p) => <button {...p} ref={p.ref as React.Ref<HTMLButtonElement>} id={`${id}-pop-inner`} type="button" className="wl-tool">Inner</button>}>
                {() => <button type="button" id={`${id}-pop-inner-item`} className="wl-option">Inner item</button>}
              </Popover>
            </div>
          )}
        </Popover>
        <DialogDemo id={id} />
        <SearchField id={`${id}-search`} inputRef={search} label="Search" value="" onChange={() => {}} clearLabel="Clear" />
        <aside data-surface="dark" className="registration-editorial" id={`${id}-panel`}>
          <EditorialPanel label={`Root ${id}`} eyebrow="Eyebrow" title="Panel title" text="Panel text" />
          <a href="#panel" id={`${id}-panel-link`}>Panel link</a>
        </aside>
        <ul>{["one", "two", "three"].map((x) => <li key={x}><ItemLink href={`#${x}`} itemId={`${id}-${x}`} className="wl-row">{x}</ItemLink></li>)}</ul>
      </main>
    </div>
  );
}
function DialogDemo({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button id={`${id}-open-dialog`} variant="secondary" onClick={() => setOpen(true)}>Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Dialog ${id}`} closeLabel="Close" headerClose
        actions={<Button id={`${id}-dialog-keep`} data-autofocus variant="secondary" onClick={() => setOpen(false)}>Keep</Button>}>
        <p id={`${id}-dialog-text`}>Dialog content</p>
        <Popover label={`Dialog menu ${id}`} align="start" trigger={(p) => <button {...p} ref={p.ref as React.Ref<HTMLButtonElement>} id={`${id}-dlg-pop`} type="button" className="wl-tool">Menu</button>}>
          {() => <button type="button" id={`${id}-dlg-pop-item`} className="wl-option">Menu item</button>}
        </Popover>
      </Dialog>
    </>
  );
}

const roots = new Map<string, { root: Root; props: Partial<FolioRootProps> }>();
const diagnostics: (Diagnostic & { id: string })[] = [];
function render(id: string) {
  const entry = roots.get(id)!;
  entry.root.render(
    <FolioRoot {...entry.props} id={`root-${id}`} onDiagnostic={(d) => diagnostics.push({ id, ...d })}>
      <Content id={id} />
    </FolioRoot>,
  );
}
const api = {
  ready,
  mount(id: string, slot: string, props: Partial<FolioRootProps> = {}) {
    const root = createRoot(document.getElementById(slot)!);
    roots.set(id, { root, props }); render(id);
  },
  update(id: string, props: Partial<FolioRootProps>) { roots.get(id)!.props = props; render(id); },
  unmount(id: string) { roots.get(id)?.root.unmount(); roots.delete(id); },
  faceSets: () => registeredFaceSets(),
  diagnostics,
};
(window as unknown as { harness: typeof api }).harness = api;
