// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at a6b153fbc9a7cd4c879ccf569345c5088680b3f5, examples/demo/env/shared.ts;
// Folio names → Marquee names (package, alias, build constant and file name); no other change.
// Shared by both demo environments and the in-page configuration panel. Original code (Folio).
import type { DesignConfig } from "wakolab-design-systems-marquee";

/** Standard version the kit follows (DIRECTIONS §6). */
export const KIT_STANDARD_SHA = "8e3b818ece8dbb57f48a2dc779ee743fe441aba4";
/** Files named by examples/config/design-config.json, relative to that file. */
export const EXAMPLE_PATHS = ["fonts/example-sans.woff2", "logo/mark.svg", "logo/wordmark-light.svg", "logo/wordmark-dark.svg"] as const;

/** Every font and logo path a configuration names (fonts.<role>.files[].src, logo.mark, logo.wordmark). */
export function namedFiles(config: unknown): string[] {
  const out: string[] = [];
  const c = config as { fonts?: Record<string, { files?: { src?: unknown }[] }>; logo?: { mark?: unknown; wordmark?: unknown } } | null;
  if (!c || typeof c !== "object") return out;
  for (const role of Object.values(c.fonts ?? {})) if (role && Array.isArray(role.files)) for (const f of role.files) if (f && typeof f.src === "string") out.push(f.src);
  if (c.logo && typeof c.logo === "object") {
    if (typeof c.logo.mark === "string") out.push(c.logo.mark);
    const w = c.logo.wordmark;
    if (typeof w === "string") out.push(w);
    else if (w && typeof w === "object") for (const v of Object.values(w)) if (typeof v === "string") out.push(v);
  }
  return [...new Set(out)];
}

/** A copy of the configuration in which each named font or logo path that `resolve` knows is
 *  replaced by the URL it returns (a data: or blob: URL). Other values, and paths `resolve` does not
 *  know, stay exactly as written; they are listed in `missing`. */
export function withFiles(config: unknown, resolve: (path: string) => string | undefined): { config: DesignConfig; missing: string[] } {
  const missing: string[] = [];
  const swap = (p: unknown) => { if (typeof p !== "string") return p; const url = resolve(p); if (url === undefined) missing.push(p); return url ?? p; };
  const copy = JSON.parse(JSON.stringify(config ?? null));
  if (copy && typeof copy === "object") {
    for (const role of Object.values((copy.fonts ?? {}) as Record<string, { files?: { src?: unknown }[] }>))
      if (role && Array.isArray(role.files)) for (const f of role.files) if (f && typeof f === "object") f.src = swap(f.src) as string;
    if (copy.logo && typeof copy.logo === "object") {
      if ("mark" in copy.logo) copy.logo.mark = swap(copy.logo.mark);
      const w = copy.logo.wordmark;
      if (typeof w === "string") copy.logo.wordmark = swap(w);
      else if (w && typeof w === "object") for (const k of Object.keys(w)) w[k] = swap(w[k]);
    }
  }
  return { config: copy as DesignConfig, missing: [...new Set(missing)] };
}

/** Last path segment: a selected file is matched to a configured path by its file name. */
export const fileName = (path: string) => path.split(/[\\/]/).pop() ?? path;

/** The configuration's own text in the URL hash (scalars only: no file bytes), base64url. */
export function encodeConfig(config: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(config));
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeConfig(text: string): unknown {
  const s = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(s, (c) => c.charCodeAt(0))));
}
