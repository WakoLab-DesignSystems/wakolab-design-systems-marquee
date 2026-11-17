/* Runtime font registration for configured font roles. Original code implementing the standard's
 * isolation rule for fonts (EXTRACTION_MATRIX §4 Fonts, R2, at 6dc2a7a):
 *  - one internal family per complete face set (all files with their descriptors), never the
 *    consumer's `family` label;
 *  - one FontFace per file under that family, cached and reference-counted per family;
 *  - a registration is deleted only when no root uses its family any more;
 *  - a face that fails to load marks its whole set as failed and notifies every root using it, so
 *    each one can fall back to the role's default (configuration §7; review R3 on #5). A failed set
 *    stays failed until it is released by every root; a new configuration (other files) is a new set.
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936, src/root/fonts.ts; internal family prefix wds-folio-font-. */
import type { FontFile } from "./config";

type ResolvedFile = FontFile & { url: string };
type ErrorListener = (url: string) => void;
interface Entry { count: number; faces: FontFace[]; failed: string[]; listeners: ErrorListener[] }
const registry = new Map<string, Entry>();

function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Internal family name for a face set: the hash covers every file's resolved URL and descriptors
 *  in a canonical order, so a different set (even by one face) is a different family. */
export function familyForFaceSet(files: ResolvedFile[]): string {
  const canon = files
    .map((f) => [f.url, f.weight ?? "", f.style ?? "", f.stretch ?? "", f.unicodeRange ?? ""])
    .sort((a, b) => (a.join("\u0000") < b.join("\u0000") ? -1 : 1));
  return `wds-folio-font-${fnv1a(JSON.stringify(canon))}`;
}

/** Registers (or reuses) the face set and returns its internal family. `onError` is called for
 *  each failed file of the set (also later, and also when the set had already failed). */
export function acquireFaceSet(files: ResolvedFile[], onError: ErrorListener): string {
  const family = familyForFaceSet(files);
  const existing = registry.get(family);
  if (existing) {
    existing.count++; existing.listeners.push(onError);
    for (const url of existing.failed) queueMicrotask(() => onError(url));
    return family;
  }
  const entry: Entry = { count: 1, faces: [], failed: [], listeners: [onError] };
  registry.set(family, entry);
  entry.faces = files.map((f) => {
    const face = new FontFace(family, `url(${JSON.stringify(f.url)})`, {
      ...(f.weight ? { weight: f.weight } : {}), ...(f.style ? { style: f.style } : {}),
      ...(f.stretch ? { stretch: f.stretch } : {}), ...(f.unicodeRange ? { unicodeRange: f.unicodeRange } : {}),
    });
    document.fonts.add(face);
    face.loaded.catch(() => {
      if (registry.get(family) !== entry) return; // released meanwhile
      entry.failed.push(f.url);
      for (const listener of [...entry.listeners]) listener(f.url);
    });
    return face;
  });
  return family;
}

/** Releases one reference; the faces are deleted only when no root uses the family. */
export function releaseFaceSet(family: string, onError?: ErrorListener): void {
  const entry = registry.get(family);
  if (!entry) return;
  if (onError) { const i = entry.listeners.indexOf(onError); if (i >= 0) entry.listeners.splice(i, 1); }
  entry.count--;
  if (entry.count > 0) return;
  for (const face of entry.faces) document.fonts.delete(face);
  registry.delete(family);
}

/** For tests and diagnostics: families currently registered with their reference counts. */
export function registeredFaceSets(): Record<string, number> {
  return Object.fromEntries([...registry].map(([k, v]) => [k, v.count]));
}
