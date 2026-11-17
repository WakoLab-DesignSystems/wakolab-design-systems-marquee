// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at 0856c723bcf1047b61b093b9bf92d36d71f7a402, examples/parity/fixture/folio-sys.tsx; Folio names → Marquee names (Marquee adaptations noted where they apply).
// Candidate adapter of the parity fixture: the built Marquee package. Original code, copied from
// wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936
// (examples/parity/fixture/console-sys.tsx); the registration side uses Marquee's EditorialPanel, whose
// monogram defaults to the first letter of the label ("WakoLab" here, as the source's hard-coded "W").
// The registration screen fills RegistrationFrame's slots with the same content the frontend's
// RegistrationShell hard-codes (brand, appearance and language selects, editorial side), as a
// consuming app would; that slot content and its utilities (fixture.css) are not part of Marquee.
import "wakolab-design-systems-marquee/marquee.css";
import "./fixture.css";
import type { ReactNode } from "react";
import { EditorialPanel, MarqueeRoot, FormPage as MarqueeFormPage, RegistrationFrame, Select, Stepper, useMarquee, type IconSet } from "wakolab-design-systems-marquee";
import type { registration } from "./texts";
export {
  Alert, Badge, Button, Card, Checkbox, ChoiceGroup, CodeField, ConfirmDialog, ConnectionRow, EmptyState, Icon, IconButton,
  Popover, SearchField, Select, Skeleton, Stepper, TabPanel, Tabs, TextField, Toast, ToggleChip,
} from "wakolab-design-systems-marquee";

export function Root({ mode, children }: { mode: "light" | "dark"; children: ReactNode }) {
  const icons = (window as unknown as { __MARQUEE_ICONS__?: IconSet }).__MARQUEE_ICONS__;
  return <MarqueeRoot mode={mode} icons={icons}>{children}</MarqueeRoot>;
}
export function FormPage({ title, lead, children }: { title: ReactNode; lead: ReactNode; children: ReactNode }) {
  return <MarqueeFormPage title={title} lead={lead}>{children}</MarqueeFormPage>;
}
export function Registration({ texts: t, children }: { texts: typeof registration; children: ReactNode }) {
  // The frontend's appearance select shows the current mode; so does this slot content.
  const { resolvedMode } = useMarquee();
  return (
    <RegistrationFrame screen="email"
      brand={<a href="/" className="inline-flex items-center gap-3 font-bold text-xl no-underline"><span aria-hidden="true" className="grid place-content-center size-10 rounded-control bg-brand text-on-brand">W</span>WakoLab</a>}
      tools={<>
        <div className="appearance-controls flex flex-wrap gap-3">
          <Select id="theme" label={t.theme} defaultValue="marquee"><option value="console">Console</option><option value="marquee">Marquee</option><option value="marquee">Marquee</option></Select>
          <Select id="appearance-mode" label={t.mode} value={resolvedMode} onChange={() => {}}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></Select>
        </div>
        <Select id="language" label={t.language} defaultValue="en"><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option><option value="zh-Hans">简体中文</option><option value="hi">हिन्दी</option></Select>
      </>}
      eyebrow={t.community} title={t.page} lead={t.pageSub}
      aside={<EditorialPanel label="WakoLab" eyebrow={t.community} title={t.hero} text={t.heroSub} footer={t.humans} />}
      steps={<Stepper steps={[t.step1, t.step2]} current={0} />}
      heading={t.emailTitle} description={t.emailDescription}
      status={<p id="status" role="status" />}
      footnote={t.safe}>
      {children}
    </RegistrationFrame>
  );
}
