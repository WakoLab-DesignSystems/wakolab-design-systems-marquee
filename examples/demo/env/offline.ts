// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at a6b153fbc9a7cd4c879ccf569345c5088680b3f5, examples/demo/env/offline.ts;
// Folio names → Marquee names (package, alias, build constant and file name); no other change.
// Demo environment, offline mode: used only when building the single HTML file (marquee-kit.html,
// scripts/build-html.mjs). Original code (Folio). The example configuration and every file it names are
// embedded in the page as data: URLs, so the example works from file:// with no request (standard
// DIRECTIONS §4 and KIT_PROPOSAL §2 at 8e3b818). The example font is the same file the HTTP demo
// serves (examples/vite.config.ts copies it from the declared @fontsource-variable/dm-sans package).
import type { DesignConfig } from "wakolab-design-systems-marquee";
import exampleConfig from "../../config/design-config.json";
import exampleConfigText from "../../config/design-config.json?raw";
import mark from "../../config/logo/mark.svg?inline";
import wordmarkLight from "../../config/logo/wordmark-light.svg?inline";
import wordmarkDark from "../../config/logo/wordmark-dark.svg?inline";
import exampleFont from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?inline";
import { EXAMPLE_PATHS, KIT_STANDARD_SHA, withFiles } from "./shared";

declare const __MARQUEE_SOURCE_SHA__: string;
export const KIT = { offline: true, sourceSha: __MARQUEE_SOURCE_SHA__ as string | undefined, standardSha: KIT_STANDARD_SHA };
const EMBEDDED: Record<(typeof EXAMPLE_PATHS)[number], string> = {
  "fonts/example-sans.woff2": exampleFont, "logo/mark.svg": mark, "logo/wordmark-light.svg": wordmarkLight, "logo/wordmark-dark.svg": wordmarkDark,
};
export const EXAMPLE_FILES = [
  { path: "design-config.json", url: "data:application/json;charset=utf-8," + encodeURIComponent(exampleConfigText) },
  ...EXAMPLE_PATHS.map((path) => ({ path, url: EMBEDDED[path] })),
];
export async function loadExample(): Promise<{ config: DesignConfig; assetBase: string | undefined }> {
  return { config: withFiles(exampleConfig, (path) => EMBEDDED[path as keyof typeof EMBEDDED]).config, assetBase: undefined };
}
