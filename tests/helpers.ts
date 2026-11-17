// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// tests/helpers.ts; open() targets Folio's demo (state in the URL hash).
import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
export async function axe(page: Page, include?: string) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || (a.effect?.getTiming().iterations ?? 1) === Infinity));
  if (!(await page.evaluate(() => "axe" in window))) await page.addScriptTag({ content: axeSource });
  return page.evaluate(async (inc) => {
    const r = await (window as any).axe.run(inc ? { include: [[inc]] } : document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
    return r.violations.map((v: any) => `${v.id}: ${v.nodes.slice(0, 3).map((n: any) => n.target.join(" ")).join(" | ")}`);
  }, include);
}
export const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
export async function open(page: Page, hash: string) {
  // A fresh load for every call (the demo keeps its state in the hash).
  await page.goto(`/demo/?r=${Math.random().toString(36).slice(2)}#${hash}`);
  await expect(page.locator('[data-wds="folio"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}
