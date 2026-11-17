/* FolioRoot: the element every Folio screen renders inside.
 * Replaces the document-level ThemeProvider of WakoLab/wakolab-front
 * (web/src/theme/ThemeProvider.tsx at e492bec9ced8893d6940879aa8186ac75a48a272) for standalone use
 * (standard EXTRACTION_MATRIX §4 Provider and Fonts, §5.7):
 *  - renders <div data-wds="folio" data-mode="light|dark">; nothing is written to <html> or <body>;
 *  - mode is light, dark or system (system follows prefers-color-scheme with a listener);
 *    persistence only when `storageKey` is given (no default key); no side effect at import;
 *  - applies the explicit configuration (colours as custom properties for the current mode,
 *    fonts through internal face-set families, logo files to the logo slot);
 *  - provides the icon set (icon path data is not shipped, see components/icons.tsx).
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936, src/root/ConsoleRoot.tsx; Console names → Folio names, root data-wds="folio". */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FolioContext, type Mode, type ResolvedMode } from "./context";
import { normalizeConfig, type DesignConfig, type Diagnostic, type FontRole } from "./config";
import { acquireFaceSet, releaseFaceSet } from "./fonts";
import { IconSetProvider, type IconSet } from "../components/icons";

// Fallback stacks appended to a configured font, as in the source's Folio tokens (themes.css
// lines 84–87): sans roles fall back to the shared sans stack, display to the serif stack.
const SANS_FALLBACK = "var(--wl-fallback-sans)";
const SERIF_FALLBACK = '"Noto Serif", Georgia, var(--wl-fallback-sans)';
const FONT_VARS: Record<FontRole, { name: string; fallback: string }> = {
  ui: { name: "--wl-font-ui", fallback: SANS_FALLBACK },
  display: { name: "--wl-font-display", fallback: SERIF_FALLBACK },
  code: { name: "--wl-font-code", fallback: SANS_FALLBACK },
  prose: { name: "--wl-font-prose", fallback: SANS_FALLBACK },
};
const quote = (family: string) => JSON.stringify(family);

function readStored(key: string | undefined): Mode | undefined {
  if (!key) return undefined;
  try { const v = localStorage.getItem(key); return v === "light" || v === "dark" || v === "system" ? v : undefined; } catch { return undefined; }
}
function systemMode(): ResolvedMode {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export interface FolioRootProps {
  children?: ReactNode;
  /** Controlled mode. Omit it to let the root manage its own mode (starting at `defaultMode`). */
  mode?: Mode;
  defaultMode?: Mode;
  onModeChange?: (mode: Mode) => void;
  /** localStorage key for the mode. No persistence when omitted. */
  storageKey?: string;
  /** Parsed design-config.json. Values are applied as written; omitted keys keep the defaults. */
  config?: DesignConfig | unknown;
  /** Base URL for relative asset paths in the configuration (for example "/design/"). */
  assetBase?: string;
  /** Icon path data by name. Folio ships no icon artwork (provenance unresolved). */
  icons?: IconSet;
  /** Structural problems in the configuration. Defaults to console.warn. */
  onDiagnostic?: (d: Diagnostic) => void;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

export function FolioRoot({ children, mode: controlled, defaultMode = "system", onModeChange, storageKey, config, assetBase, icons, onDiagnostic, className, style, id }: FolioRootProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState<Mode>(() => readStored(storageKey) ?? defaultMode);
  const mode = controlled ?? own;
  const [system, setSystem] = useState<ResolvedMode>(systemMode);
  useEffect(() => {
    if (mode !== "system" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystem(media.matches ? "dark" : "light");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [mode]);
  const resolvedMode: ResolvedMode = mode === "system" ? system : mode;
  const setMode = useCallback((next: Mode) => {
    if (controlled === undefined) setOwn(next);
    if (storageKey) { try { localStorage.setItem(storageKey, next); } catch { /* optional */ } }
    onModeChange?.(next);
  }, [controlled, storageKey, onModeChange]);

  const report = useRef(onDiagnostic ?? ((d: Diagnostic) => console.warn(`[console config] ${d.key}: ${d.message}`)));
  report.current = onDiagnostic ?? ((d: Diagnostic) => console.warn(`[console config] ${d.key}: ${d.message}`));
  const configKey = JSON.stringify(config ?? null) + "\u0000" + (assetBase ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const normalized = useMemo(() => normalizeConfig(config, assetBase, (d) => report.current(d)), [configKey]);

  // Fonts: register the new face sets first, switch, then release the previous ones.
  const fontKey = JSON.stringify(normalized.fonts);
  const [families, setFamilies] = useState<Partial<Record<FontRole, string>>>({});
  // Internal families whose files failed to load: their roles fall back to the defaults (§7, R3).
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const held = useRef<[string, (url: string) => void][]>([]);
  useLayoutEffect(() => {
    const next: Partial<Record<FontRole, string>> = {};
    const acquired: [string, (url: string) => void][] = [];
    for (const [role, setting] of Object.entries(normalized.fonts) as [FontRole, (typeof normalized.fonts)[FontRole]][]) {
      if (!setting) continue;
      if (setting.files?.length) {
        const files = setting.files;
        let fam = "";
        const onError = (url: string) => {
          const index = files.findIndex((f) => f.url === url);
          report.current({ key: `fonts.${role}.files[${index}].src`, message: `font file failed to load: ${url}; the default ${role} font is used` });
          setFailed((s) => (s.has(fam) ? s : new Set(s).add(fam)));
        };
        fam = acquireFaceSet(files, onError);
        acquired.push([fam, onError]); next[role] = fam;
      } else next[role] = setting.family; // an installed or host-loaded font, global by the consumer's choice
    }
    const previous = held.current;
    held.current = acquired;
    setFamilies(next);
    for (const [fam, onError] of previous) releaseFaceSet(fam, onError);
    setFailed((s) => { const keep = new Set([...s].filter((f) => acquired.some(([a]) => a === f))); return keep.size === s.size ? s : keep; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontKey]);
  useEffect(() => () => { for (const [fam, onError] of held.current) releaseFaceSet(fam, onError); held.current = []; }, []);

  const vars = useMemo(() => {
    const v: Record<string, string> = {};
    for (const [role, value] of Object.entries(normalized.colors[resolvedMode])) v[`--wl-${role}`] = value as string;
    for (const [role, fam] of Object.entries(families) as [FontRole, string][]) {
      if (failed.has(fam)) continue; // the role keeps its default
      v[FONT_VARS[role].name] = `${quote(fam)}, ${FONT_VARS[role].fallback}`;
    }
    return v;
  }, [normalized, resolvedMode, families, failed]);

  const reportStable = useCallback((d: Diagnostic) => report.current(d), []);
  const ctx = useMemo(() => ({ mode, resolvedMode, setMode, logo: normalized.logo, rootRef, report: reportStable }), [mode, resolvedMode, setMode, normalized.logo, reportStable]);
  return (
    <FolioContext.Provider value={ctx}>
      <IconSetProvider value={icons ?? {}}>
        <div ref={rootRef} id={id} data-wds="folio" data-mode={resolvedMode} className={className} style={{ ...style, ...vars } as CSSProperties}>
          {children}
        </div>
      </IconSetProvider>
    </FolioContext.Provider>
  );
}
