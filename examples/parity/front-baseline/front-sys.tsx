// Baseline adapter of the parity fixture: the WakoLab frontend's own modules at
// e492bec9ced8893d6940879aa8186ac75a48a272, imported READ ONLY from a separate checkout through the
// "@front" alias (front-baseline/vite.config.mjs). Never built or type-checked in this repository.
// Original code, copied from wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936
// (examples/parity/front-baseline/front-sys.tsx); it only wires the frontend's modules to the fixture's names:
//  - components: web/src/components/ui (the frontend's index re-exports);
//  - Root: the frontend's ThemeProvider and style.css, Folio direction (set by fixture/index.html);
//  - FormPage: the `.wl-form-page` framing of web/src/features/catalog/pages.tsx (Page + header);
//  - Registration: the frontend's real RegistrationShell, with a synthetic flow object whose
//    translation function returns the fixture texts.
import "parity-front-css"; // the frontend's web/src/style.css, plus an @source for web/src (see vite.config.mjs)
import { useRef, type ReactNode } from "react";
import { ThemeProvider } from "@front/theme/ThemeProvider";
import { RegistrationShell } from "@front/features/RegistrationShell";
export {
  Alert, Badge, Button, Card, Checkbox, ChoiceGroup, CodeField, ConfirmDialog, ConnectionRow, EmptyState, Icon, IconButton,
  Popover, SearchField, Select, Skeleton, Stepper, TabPanel, Tabs, TextField, Toast, ToggleChip,
} from "@front/components/ui";

export function Root({ children }: { mode: "light" | "dark"; children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
export function FormPage({ title, lead, children }: { title: ReactNode; lead: ReactNode; children: ReactNode }) {
  return (
    <main id="main" className="wl-page wl-form-page">
      <header className="wl-form-head"><h1>{title}</h1><p className="wl-lead">{lead}</p></header>
      {children}
    </main>
  );
}
export function Registration({ texts, children }: { texts: Record<string, string>; children: ReactNode }) {
  const title = useRef<HTMLHeadingElement>(null);
  const flow = {
    locale: "en", changeLocale: () => {}, t: (key: string) => texts[key] ?? key, screen: "email", title,
    profile: null, busy: false, run: () => {}, logout: () => {}, message: null, error: false, traceId: null,
  } as unknown as Parameters<typeof RegistrationShell>[0]["flow"];
  return <RegistrationShell flow={flow}>{children}</RegistrationShell>;
}
