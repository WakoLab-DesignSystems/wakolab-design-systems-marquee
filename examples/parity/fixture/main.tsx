// Shared parity fixture (standard EXTRACTION_MATRIX §8; review R4 and S1 on #5). The same screens are
// rendered by two adapters that export the same names ("parity-sys"):
//   examples/parity/fixture/folio-sys.tsx        the built Folio package (candidate)
//   examples/parity/front-baseline/front-sys.tsx  the WakoLab frontend's own modules at e492bec (baseline,
//                                                 built only from a separate read-only checkout)
// ?screen=form|components|confirm|registration|overlays  &mode=light|dark. Original code, copied from
// wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (examples/parity/fixture/main.tsx)
// with the Folio shell class (wl-folio).
// overlays: the capture script opens the popover by clicking #fx-pop (same action on both sides);
// the toast is shown from the first render with a timeout far longer than any capture.
import { createRoot } from "react-dom/client";
import { useState, type ReactNode } from "react";
import * as Sys from "parity-sys";
import { components as C, form as F, overlays as O, registration as R } from "./texts";

const params = new URLSearchParams(location.search);
const screen = params.get("screen") ?? "form";
const mode = (params.get("mode") as "light" | "dark") || "light";
const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 } as const;
const stack = { display: "grid", gap: 16, alignContent: "start", minWidth: 0 } as const;

function FormScreen() {
  const [access, setAccess] = useState("read");
  return (
    <div className="wl-home wl-folio">
      <Sys.FormPage title={F.title} lead={F.lead}>
        <form noValidate className="wl-form" onSubmit={(e) => e.preventDefault()}>
          <Sys.TextField label={F.name} hint={F.nameHint} defaultValue="Sam Rivera" />
          <Sys.TextField label={F.email} type="email" defaultValue="sam@" error={F.emailError} />
          <div className="wl-form-row">
            <Sys.Select label={F.team} defaultValue="Design">{F.teams.map((t) => <option key={t}>{t}</option>)}</Sys.Select>
            <Sys.TextField label={F.role} hint={F.roleHint} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="about" style={{ fontWeight: 500 }}>{F.about}</label>
            <textarea id="about" className="wl-textarea" rows={4} defaultValue={F.aboutValue} aria-describedby="about-hint" />
            <p id="about-hint" className="text-sm text-muted">{F.aboutHint}</p>
          </div>
          <Sys.ChoiceGroup label={F.access} value={access} options={F.accessOptions} onChange={setAccess} />
          <Sys.Checkbox label={F.terms} defaultChecked />
          <Sys.Alert tone="info">{F.notice}</Sys.Alert>
          <div style={row}><Sys.Button type="submit">{F.submit}</Sys.Button><Sys.Button variant="secondary" type="button">{F.cancel}</Sys.Button></div>
        </form>
      </Sys.FormPage>
    </div>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section style={stack}><h2 className="wl-label">{title}</h2>{children}</section>;
}
function ComponentsScreen() {
  const [tab, setTab] = useState<"a" | "b">("a");
  const [choice, setChoice] = useState("weekly");
  return (
    <div className="wl-home wl-folio">
      <main className="wl-page" style={{ display: "grid", gap: 32 }}>
        <Section title={C.buttons}>
          <div style={row}>
            <Sys.Button>{C.primary}</Sys.Button><Sys.Button variant="secondary">{C.secondary}</Sys.Button>
            <Sys.Button variant="ghost">{C.ghost}</Sys.Button><Sys.Button variant="destructive">{C.destructive}</Sys.Button>
          </div>
          <div style={row}>
            <Sys.Button size="sm">{C.small}</Sys.Button><Sys.Button size="lg">{C.large}</Sys.Button>
            <Sys.Button busy>{C.busy}</Sys.Button><Sys.Button disabled>{C.disabled}</Sys.Button>
            <Sys.IconButton label={C.iconButton}><Sys.Icon name="x" /></Sys.IconButton>
          </div>
        </Section>
        <Section title={C.fields}>
          <div style={{ ...stack, maxWidth: 480 }}>
            <Sys.TextField label={C.text} hint={C.hint} defaultValue={C.textValue} />
            <Sys.TextField label={C.invalid} error={C.invalidError} defaultValue="ab" />
            <Sys.CodeField label={C.code} defaultValue={C.codeValue} />
            <Sys.Select label={C.select} defaultValue="Members">{C.selectOptions.map((o) => <option key={o}>{o}</option>)}</Sys.Select>
            <Sys.ChoiceGroup label={C.choice} value={choice} options={C.choices} onChange={setChoice} />
            <Sys.Checkbox label={C.check} />
            <Sys.SearchField label={C.search} value={C.searchValue} onChange={() => {}} clearLabel={C.clear} />
          </div>
        </Section>
        <Section title={C.chips}>
          <div style={row}>
            <Sys.ToggleChip pressed onClick={() => {}} note={C.chipNote}>{C.chipA}</Sys.ToggleChip>
            <Sys.ToggleChip pressed={false} onClick={() => {}}>{C.chipB}</Sys.ToggleChip>
            <Sys.Badge>{C.badge}</Sys.Badge>
          </div>
        </Section>
        <Section title={C.feedback}>
          <div style={{ ...stack, maxWidth: 640 }}>
            <Sys.Alert tone="info">{C.info}</Sys.Alert><Sys.Alert tone="success">{C.success}</Sys.Alert>
            <Sys.Alert tone="warning">{C.warning}</Sys.Alert><Sys.Alert tone="error">{C.error}</Sys.Alert>
            <Sys.Card>{C.card}</Sys.Card>
            <Sys.Stepper steps={C.steps} current={1} />
            <Sys.ConnectionRow name={C.connection} status={C.connectionStatus} description={C.connectionDescription} />
            <Sys.Tabs label={C.tabs} idBase="fx-tabs" value={tab} onChange={setTab} tabs={[{ id: "a", label: C.tabA }, { id: "b", label: C.tabB }]} />
            <Sys.TabPanel idBase="fx-tabs" tab={tab}><p>{C.tabContent}</p></Sys.TabPanel>
            <Sys.EmptyState icon="spark" title={C.empty} action={<Sys.Button variant="secondary">{C.emptyAction}</Sys.Button>}>{C.emptyBody}</Sys.EmptyState>
            <div style={{ display: "grid", gap: 8 }}><Sys.Skeleton className="h-5 w-1/2" /><Sys.Skeleton className="h-4 w-3/4" /></div>
          </div>
        </Section>
      </main>
    </div>
  );
}
function ConfirmScreen() {
  return (
    <>
      <ComponentsScreen />
      <Sys.ConfirmDialog open destructive title={C.confirmTitle} body={C.confirmBody} confirmLabel={C.confirm} cancelLabel={C.cancel} closeLabel={C.close} onConfirm={() => {}} onCancel={() => {}} />
    </>
  );
}
function RegistrationScreen() {
  return (
    <Sys.Registration texts={R}>
      <Sys.TextField label={R.email} type="email" defaultValue="sam@example.com" />
      <Sys.Button>{R.continue}</Sys.Button>
    </Sys.Registration>
  );
}
function OverlaysScreen() {
  return (
    <div className="wl-home wl-folio">
      <main className="wl-page" style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <p className="wl-lead">{O.lead}</p>
        <div style={row}>
          <Sys.Popover label={O.sortMenu} align="start" trigger={(p) => (
            <button {...p} ref={p.ref as React.Ref<HTMLButtonElement>} id="fx-pop" type="button" className="wl-tool"><Sys.Icon name="list" size={18} />{O.sort}</button>
          )}>
            {(close) => (
              <div className="grid gap-1">
                <p className="wl-label">{O.sortLabel}</p>
                {O.options.map((o, i) => (
                  <button key={o} type="button" className="wl-option" aria-pressed={i === 0} onClick={close}>
                    {i === 0 ? <Sys.Icon name="check" size={18} /> : <span style={{ width: 18 }} />}{o}
                  </button>
                ))}
              </div>
            )}
          </Sys.Popover>
        </div>
      </main>
      <Sys.Toast message={O.toast} onDone={() => {}} timeout={600000} />
    </div>
  );
}
const screens: Record<string, () => ReactNode> = { form: () => <FormScreen />, components: () => <ComponentsScreen />, confirm: () => <ConfirmScreen />, registration: () => <RegistrationScreen />, overlays: () => <OverlaysScreen /> };
createRoot(document.getElementById("app")!).render(<Sys.Root mode={mode}>{(screens[screen] ?? screens.form)()}</Sys.Root>);
