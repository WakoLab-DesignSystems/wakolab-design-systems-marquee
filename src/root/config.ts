/* Explicit configuration (design-config.json) for Folio.
 * Original code implementing the configuration specification of the standard repository
 * (WakoLab-DesignSystems/wakolab-design-systems-standard docs/CONFIGURATION.md at
 * 6dc2a7a38cc35b34f737c49e79077b025e47ab6c). Values are used exactly as written; omitted keys keep
 * Folio's defaults; nothing is derived, checked, corrected or approved. Only structural problems
 * are reported.
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
 * src/root/config.ts. Changes for Folio: system "folio"; the Folio-declared colour roles panel,
 * on-panel and panel-accent (standard CONFIGURATION §2.1 at c2ca848d0b44c62a2864f1c23d99b7ec7d34bdc1);
 * an empty font `family` or an empty `files` list is reported and leaves the role's default (F-R1). */

export const COLOR_ROLES = [
  "bg", "surface", "surface-2", "ink", "muted", "border", "control",
  "action", "action-hover", "action-pressed", "on-action", "link", "focus", "accent",
  "success", "success-soft", "warning", "warning-soft", "danger", "danger-soft", "info", "info-soft", "on-danger",
  "scrim", "shadow-card", "shadow-pop",
  // Folio-declared roles (CONFIGURATION §2.1): the editorial panel. Each keeps its own default.
  "panel", "on-panel", "panel-accent",
] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];
export const FONT_ROLES = ["ui", "display", "prose", "code"] as const;
export type FontRole = (typeof FONT_ROLES)[number];

export interface FontFile { src: string; weight?: string; style?: string; stretch?: string; unicodeRange?: string }
export interface FontSetting { family: string; files?: FontFile[] }
export type Asset = string;
export interface DesignConfig {
  system: string;
  systemVersion: string;
  colors?: { light?: Partial<Record<ColorRole, string>>; dark?: Partial<Record<ColorRole, string>> };
  fonts?: Partial<Record<FontRole, FontSetting>>;
  logo?: { mark?: Asset; wordmark?: Asset | { light?: Asset; dark?: Asset }; alt?: string };
}

export interface Diagnostic { key: string; message: string }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Resolves an Asset (CONFIGURATION §5): absolute URLs and root-relative paths are used as written;
 *  other paths are resolved against `assetBase`; without `assetBase` they are reported and ignored. */
export function resolveAsset(path: string, assetBase: string | undefined, key: string, report: (d: Diagnostic) => void): string | undefined {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith("/")) return path;
  if (!assetBase) { report({ key, message: `relative path "${path}" needs an assetBase; ignored` }); return undefined; }
  try { return new URL(path, new URL(assetBase, document.baseURI)).href; }
  catch { report({ key, message: `cannot resolve "${path}" against assetBase "${assetBase}"; ignored` }); return undefined; }
}

export interface NormalizedConfig {
  colors: { light: Partial<Record<ColorRole, string>>; dark: Partial<Record<ColorRole, string>> };
  fonts: Partial<Record<FontRole, { family: string; files?: (FontFile & { url: string })[] }>>;
  logo: { mark?: string; wordmark?: string | { light?: string; dark?: string }; alt?: string };
}

/** Structural validation only. Wrong-typed or unknown entries are reported and ignored; their
 *  defaults stay in use. Colour strings, fonts and logos are never judged. */
export function normalizeConfig(input: unknown, assetBase: string | undefined, report: (d: Diagnostic) => void): NormalizedConfig {
  const out: NormalizedConfig = { colors: { light: {}, dark: {} }, fonts: {}, logo: {} };
  if (input === undefined || input === null) return out;
  if (!isObject(input)) { report({ key: "(root)", message: "configuration must be a JSON object; ignored" }); return out; }
  for (const k of Object.keys(input)) if (!["system", "systemVersion", "colors", "fonts", "logo", "$schema"].includes(k)) report({ key: k, message: "unknown key; ignored" });
  if (input.system !== "folio") report({ key: "system", message: `expected "folio", got ${JSON.stringify(input.system)}` });
  if (typeof input.systemVersion !== "string") report({ key: "systemVersion", message: "required string is missing" });
  if (input.colors !== undefined) {
    if (!isObject(input.colors)) report({ key: "colors", message: "must be an object; ignored" });
    else for (const [mode, roles] of Object.entries(input.colors)) {
      if (mode !== "light" && mode !== "dark") { report({ key: `colors.${mode}`, message: "unknown mode; ignored" }); continue; }
      if (!isObject(roles)) { report({ key: `colors.${mode}`, message: "must be an object; ignored" }); continue; }
      for (const [role, value] of Object.entries(roles)) {
        if (!(COLOR_ROLES as readonly string[]).includes(role)) { report({ key: `colors.${mode}.${role}`, message: "unknown role; ignored" }); continue; }
        if (typeof value !== "string") { report({ key: `colors.${mode}.${role}`, message: "must be a string; ignored" }); continue; }
        out.colors[mode][role as ColorRole] = value; // exactly as written
      }
    }
  }
  if (input.fonts !== undefined) {
    if (!isObject(input.fonts)) report({ key: "fonts", message: "must be an object; ignored" });
    else for (const [role, setting] of Object.entries(input.fonts)) {
      const key = `fonts.${role}`;
      if (!(FONT_ROLES as readonly string[]).includes(role)) { report({ key, message: "unknown role; ignored" }); continue; }
      if (!isObject(setting) || typeof setting.family !== "string") { report({ key, message: "needs a string `family`; ignored" }); continue; }
      // Contract (CONFIGURATION §3; review F-R1 on folio#5): `family` is non-empty and `files`, when
      // present, has at least one file. Otherwise the role keeps its default. Non-empty values are
      // used exactly as written (never trimmed or judged).
      if (setting.family === "") { report({ key: `${key}.family`, message: "must not be empty; the default stays in use" }); continue; }
      if (Array.isArray(setting.files) && setting.files.length === 0) { report({ key: `${key}.files`, message: "must contain at least one file; the default stays in use" }); continue; }
      let files: (FontFile & { url: string })[] | undefined;
      if (setting.files !== undefined) {
        if (!Array.isArray(setting.files)) { report({ key: `${key}.files`, message: "must be an array; ignored" }); continue; }
        files = [];
        setting.files.forEach((f, i) => {
          const fk = `${key}.files[${i}]`;
          if (!isObject(f) || typeof f.src !== "string") { report({ key: fk, message: "needs a string `src`; ignored" }); return; }
          for (const d of ["weight", "style", "stretch", "unicodeRange"]) if (f[d] !== undefined && typeof f[d] !== "string") report({ key: `${fk}.${d}`, message: "must be a string; ignored" });
          const url = resolveAsset(f.src, assetBase, `${fk}.src`, report);
          if (!url) return;
          const pick = (d: string) => (typeof f[d] === "string" ? (f[d] as string) : undefined);
          files!.push({ src: f.src, url, weight: pick("weight"), style: pick("style"), stretch: pick("stretch"), unicodeRange: pick("unicodeRange") });
        });
        if (!files.length) { report({ key, message: "no usable font file; the default stays in use" }); continue; }
      }
      out.fonts[role as FontRole] = { family: setting.family, files };
    }
  }
  if (input.logo !== undefined) {
    if (!isObject(input.logo)) report({ key: "logo", message: "must be an object; ignored" });
    else {
      const L = input.logo;
      for (const k of Object.keys(L)) if (!["mark", "wordmark", "alt"].includes(k)) report({ key: `logo.${k}`, message: "unknown key; ignored" });
      if (L.mark !== undefined) { if (typeof L.mark === "string") out.logo.mark = resolveAsset(L.mark, assetBase, "logo.mark", report); else report({ key: "logo.mark", message: "must be a string; ignored" }); }
      if (typeof L.wordmark === "string") out.logo.wordmark = resolveAsset(L.wordmark, assetBase, "logo.wordmark", report);
      else if (isObject(L.wordmark)) {
        const w: { light?: string; dark?: string } = {};
        for (const m of ["light", "dark"] as const) {
          const v = L.wordmark[m];
          if (v === undefined) continue;
          if (typeof v === "string") w[m] = resolveAsset(v, assetBase, `logo.wordmark.${m}`, report);
          else report({ key: `logo.wordmark.${m}`, message: "must be a string; ignored" });
        }
        if (w.light || w.dark) out.logo.wordmark = w;
      } else if (L.wordmark !== undefined) report({ key: "logo.wordmark", message: "must be a string or {light, dark}; ignored" });
      if (L.alt !== undefined) { if (typeof L.alt === "string") out.logo.alt = L.alt; else report({ key: "logo.alt", message: "must be a string; ignored" }); }
    }
  }
  return out;
}
