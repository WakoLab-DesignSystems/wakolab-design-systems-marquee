/* Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at 0856c723bcf1047b61b093b9bf92d36d71f7a402, src/root/context.ts; Folio names → Marquee names (Marquee adaptations noted where they apply). */
/* Marquee root context. Original code for standalone use (replaces the document-level
 * ThemeProvider of WakoLab/wakolab-front web/src/theme/ThemeProvider.tsx at
 * e492bec9ced8893d6940879aa8186ac75a48a272; standard EXTRACTION_MATRIX §4 Provider).
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936, src/root/context.ts; Console names → Marquee names. */
import { createContext, useContext, type RefObject } from "react";
import type { Diagnostic } from "./config";

export type Mode = "light" | "dark" | "system";
export type ResolvedMode = "light" | "dark";

export interface ResolvedLogo {
  mark?: string;
  wordmark?: string | { light?: string; dark?: string };
  alt?: string;
}

export interface MarqueeContextValue {
  /** The requested mode (light, dark or system). */
  mode: Mode;
  /** The mode in effect. */
  resolvedMode: ResolvedMode;
  setMode: (mode: Mode) => void;
  /** Logo files from the configuration, resolved against `assetBase`. */
  logo: ResolvedLogo;
  /** The root element: listeners and lookups stay inside it. */
  rootRef: RefObject<HTMLDivElement | null>;
  /** Reports a structural problem (for example a logo file that failed to load) to `onDiagnostic`. */
  report: (d: Diagnostic) => void;
}

export const MarqueeContext = createContext<MarqueeContextValue | null>(null);

export function useMarquee(): MarqueeContextValue {
  const value = useContext(MarqueeContext);
  if (!value) throw new Error("Marquee components must be rendered inside <MarqueeRoot>.");
  return value;
}
