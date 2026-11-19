// The delivered single HTML file (marquee-kit.html), opened directly from file:// with the network cut
// (standard DIRECTIONS §4 and CHECKLIST "Demo and HTML file" at 8e3b818; #6).
// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at a6b153fbc9a7cd4c879ccf569345c5088680b3f5,
// tests/kit-html.spec.ts. Changes for Marquee: names, headings, expected values (Marquee's example action
// colour, Manrope display default, DM Sans UI), the licence list; added tests for keyboard navigation and
// for every screen at 360 px in light and dark, in the delivered file.
// It tests the committed file, not a fresh build: generate it with `npm run kit` from a committed
// source (scripts/build-html.mjs). Without the file, these tests are skipped and say so.
import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { axe, noOverflow } from "./helpers";

const require = createRequire(import.meta.url);
const KIT = resolve("marquee-kit.html");
const URL_BASE = `file://${KIT}`;
const SCREENS: [string, string][] = [
  ["Collection", "Datasets"], ["Article", "Coastal temperatures"], ["Form", "Settings"], ["Message", "This page doesn't exist"],
  ["States", "States"], ["Components", "Components"], ["Editorial frame", "Join the workspace"], ["Overview", "Marquee"],
];
test.skip(!existsSync(KIT), "marquee-kit.html is not generated in this checkout (npm run kit)");

/** An offline context that records every request; only the file itself may be requested. */
async function offline(browser: import("@playwright/test").Browser) {
  const context = await browser.newContext({ offline: true, viewport: { width: 1280, height: 900 } });
  const requests: string[] = [];
  context.on("request", (r) => requests.push(r.url()));
  return { context, requests };
}
const foreign = (requests: string[]) => requests.filter((u) => u.split("#")[0] !== URL_BASE && !u.startsWith("data:") && !u.startsWith("blob:"));
async function openKit(context: BrowserContext, hash: string) {
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(`${URL_BASE}#${hash}`);
  await expect(page.locator('[data-wds="marquee"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return { page, errors };
}
const menu = (page: Page, label: string) => page.getByRole("navigation", { name: "Demo screens" }).getByRole("link", { name: label, exact: true });
async function setMode(page: Page, mode: "Light" | "Dark") {
  await page.getByRole("button", { name: /Appearance/ }).click();
  await page.locator("label", { hasText: new RegExp(`^${mode}$`) }).click();
  await page.keyboard.press("Escape");
}

test("file://, network cut: the eight screens by the menu, light and dark, embedded resources only, no request", async ({ browser }) => {
  const { context, requests } = await offline(browser);
  const { page, errors } = await openKit(context, "screen=overview&mode=light&config=default");
  for (const [label, heading] of SCREENS) {
    await menu(page, label).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(menu(page, label)).toHaveAttribute("aria-current", "page");
  }
  await setMode(page, "Dark");
  await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", "dark");
  await expect(page).toHaveURL(/mode=dark/);
  for (const [label, heading] of SCREENS) {
    await menu(page, label).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", "dark");
  }
  await setMode(page, "Light");
  await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", "light");
  // Default fonts are embedded and load from the file.
  const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")); });
  for (const f of ["wds-marquee-default-dm-sans", "wds-marquee-default-manrope"]) expect(fonts).toContain(f);
  // Every resource the page holds is inline: no element or stylesheet points outside the file.
  const outside = await page.evaluate(() => {
    const urls: string[] = [];
    document.querySelectorAll("[src],[href]").forEach((e) => { const v = e.getAttribute("src") ?? e.getAttribute("href") ?? ""; if (!/^(data:|blob:|#)/.test(v)) urls.push(v); });
    for (const sheet of [...document.styleSheets]) for (const rule of [...sheet.cssRules]) {
      for (const m of rule.cssText.matchAll(/url\("?([^")]+)"?\)/g)) if (!/^(data:|blob:)/.test(m[1])) urls.push(m[1]);
    }
    return urls;
  });
  expect(outside).toEqual([]);
  expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content")).toContain("connect-src 'none'");
  expect(await page.locator('meta[name="marquee-kit-source"]').getAttribute("content")).toMatch(/^[0-9a-f]{40}$/);
  expect(foreign(requests)).toEqual([]);
  expect(errors).toEqual([]);
  await context.close();
});

test("the notices travel with the file: Marquee's MIT LICENSE and every third-party licence (H-R1 on #7)", async ({ browser }) => {
  // In the generated artifact itself: the complete LICENSE text, copyright line included.
  const bytes = readFileSync(KIT, "utf8");
  const licence = readFileSync("LICENSE", "utf8");
  expect(licence).toContain("Copyright (c) 2026 WakoLab-DesignSystems");
  // The bundle stores the text as a JavaScript string (line breaks escaped), so the bytes are searched
  // line by line; the exact, complete text is compared below, as the page displays it.
  for (const line of licence.split("\n").filter((l) => l.trim()))
    expect(bytes.includes(line), `LICENSE line in marquee-kit.html: ${line.slice(0, 60)}`).toBe(true);
  expect(bytes.includes("Copyright (c) 2026 WakoLab-DesignSystems"), "the copyright line is in marquee-kit.html").toBe(true);
  // Readable from the file alone (file://, network cut): each Licences entry shows its whole text,
  // exactly as in the repository file.
  const { context, requests } = await offline(browser);
  const { page } = await openKit(context, "screen=overview&mode=light&config=default");
  const section = page.locator("section", { has: page.getByRole("heading", { name: "Licences", exact: true }) });
  for (const [summary, file] of [
    ["Marquee (MIT): LICENSE", "LICENSE"], ["Third-party notices", "THIRD_PARTY_NOTICES.md"], ["DM Sans (OFL-1.1)", "licenses/dm-sans-OFL-1.1.txt"],
    ["Manrope (OFL-1.1)", "licenses/manrope-OFL-1.1.txt"], ["Noto Sans SC (OFL-1.1)", "licenses/noto-sans-sc-OFL-1.1.txt"],
    ["Noto Sans Devanagari (OFL-1.1)", "licenses/noto-sans-devanagari-OFL-1.1.txt"], ["Tailwind CSS (MIT)", "licenses/tailwindcss-MIT.txt"],
    ["React, React DOM, Scheduler (MIT; in the HTML file only)", "licenses/react-MIT.txt"],
  ]) {
    const details = section.locator("details", { has: page.locator("summary", { hasText: summary }) });
    await expect(details, summary).toHaveCount(1);
    await details.locator("summary").click();
    await expect(details.locator("pre")).toBeVisible();
    expect(await details.locator("pre").textContent(), file).toBe(readFileSync(file, "utf8"));
  }
  expect(foreign(requests)).toEqual([]);
  await context.close();
});

test("file://: the embedded example configuration applies its colours, display font and logo", async ({ browser }) => {
  const { context, requests } = await offline(browser);
  const { page } = await openKit(context, "screen=overview&mode=light&config=default");
  await page.getByRole("button", { name: "Example configuration" }).click();
  await expect(page).toHaveURL(/config=example/);
  const root = page.locator('[data-wds="marquee"]');
  await expect.poll(() => root.evaluate((e) => getComputedStyle(e).getPropertyValue("--wl-action").trim())).toBe("#2d5bd7");
  await expect.poll(() => page.locator(".wl-brand img").evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).naturalWidth > 0))).toEqual([true, true]);
  expect(await page.locator("h1").evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^"?wds-marquee-font-[0-9a-f]{8}/);
  await menu(page, "Article").click();
  await expect(page.locator(".wl-brand img").first()).toBeVisible();
  expect(foreign(requests)).toEqual([]);
  await context.close();
});

test("file://: your configuration and files from the disk, kept while navigating; after a reload the values stay and the files are selected again", async ({ browser }) => {
  const { context, requests } = await offline(browser);
  const { page } = await openKit(context, "screen=overview&mode=light&config=default");
  const config = JSON.parse(readFileSync("examples/config/design-config.json", "utf8"));
  config.colors.light.action = "#0b6e4f";
  await page.locator("#local-config").setInputFiles({ name: "design-config.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(config)) });
  await expect(page).toHaveURL(/config=local&local=/);
  const root = page.locator('[data-wds="marquee"]');
  await expect.poll(() => root.evaluate((e) => getComputedStyle(e).getPropertyValue("--wl-action").trim())).toBe("#0b6e4f");
  const status = page.locator("#local-file-status");
  await expect(status.getByText("not selected yet")).toHaveCount(4);
  await expect(page.locator(".wl-brand img")).toHaveCount(0); // no logo file yet: the text logo
  const file = (path: string, name: string, mimeType: string) => ({ name, mimeType, buffer: readFileSync(path) });
  await page.locator("#local-files").setInputFiles([
    file(require.resolve("@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2"), "example-sans.woff2", "font/woff2"),
    file("examples/config/logo/mark.svg", "mark.svg", "image/svg+xml"),
    file("examples/config/logo/wordmark-light.svg", "wordmark-light.svg", "image/svg+xml"),
    file("examples/config/logo/wordmark-dark.svg", "wordmark-dark.svg", "image/svg+xml"),
  ]);
  await expect(status.getByText("not selected yet")).toHaveCount(0);
  await expect.poll(() => page.locator(".wl-brand img").evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src.slice(0, 5)))).toEqual(["blob:", "blob:"]);
  await expect.poll(() => page.locator("h1").evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^"?wds-marquee-font-[0-9a-f]{8}/);
  // Navigation keeps the configuration and the selected files.
  for (const label of ["Collection", "Editorial frame", "Overview"]) {
    await menu(page, label).click();
    await expect(page).toHaveURL(/config=local&local=/);
    await expect(page.locator(".wl-brand img").first()).toHaveAttribute("src", /^blob:/);
  }
  // Reload: the values come back from the hash; the files must be selected again.
  await page.reload();
  await expect(root).toBeVisible();
  await expect.poll(() => root.evaluate((e) => getComputedStyle(e).getPropertyValue("--wl-action").trim())).toBe("#0b6e4f");
  await expect(status.getByText("not selected yet")).toHaveCount(4);
  await expect(page.locator(".wl-brand img")).toHaveCount(0);
  expect(await page.locator("h1").evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^"?wds-marquee-default-manrope/);
  // An invalid file changes nothing and says so.
  await page.locator("#local-config").setInputFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from("{ not json") });
  await expect(page.getByText(/broken\.json is not a valid JSON file/)).toBeVisible();
  await expect.poll(() => root.evaluate((e) => getComputedStyle(e).getPropertyValue("--wl-action").trim())).toBe("#0b6e4f");
  expect(foreign(requests)).toEqual([]);
  await context.close();
});

for (const mode of ["light", "dark"])
  test(`file://, ${mode}: the presentation page (with the local-file panel and licences) is axe A/AA clean and reflows from 320px`, async ({ browser }) => {
    const { context } = await offline(browser);
    const { page } = await openKit(context, `screen=overview&mode=${mode}&config=default`);
    expect(await axe(page)).toEqual([]);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await noOverflow(page), `overflow at ${width}`).toBe(true);
    }
    await context.close();
  });

/** Presses Tab until the focused element's aria-label, text or label text matches, at most `max` times. */
async function tabTo(page: Page, name: RegExp, max = 60, key = "Tab") {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press(key);
    const label = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement | null;
      if (!e) return "";
      const labels = (e as HTMLInputElement).labels ? [...(e as HTMLInputElement).labels!].map((l) => l.textContent ?? "").join(" ") : "";
      return `${e.getAttribute("aria-label") ?? ""} ${e.textContent ?? ""} ${labels}`.trim();
    });
    if (name.test(label)) return;
  }
  throw new Error(`tabTo: ${name} not reached with ${key}`);
}
const focusRing = (page: Page) => page.evaluate(() => {
  const e = document.activeElement as HTMLElement;
  const cs = getComputedStyle(e);
  return e.matches(":focus-visible") && cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
});

test("file://, network cut: keyboard only — menu, appearance, tiles, dialog and back to the overview", async ({ browser }) => {
  const { context, requests } = await offline(browser);
  const { page, errors } = await openKit(context, "screen=overview&mode=light&config=default");
  // Every menu destination by Tab and Enter, with a visible focus ring; the menu keeps its place in the
  // tab order after each navigation.
  for (const [label, heading] of SCREENS) {
    await tabTo(page, new RegExp(`^${label}$`));
    expect(await focusRing(page), `focus ring on ${label}`).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(menu(page, label)).toHaveAttribute("aria-current", "page");
  }
  // Appearance: open with Enter, choose Dark with the arrow keys, Escape closes and returns focus.
  await page.locator("body").focus();
  await tabTo(page, /Appearance/);
  await page.keyboard.press("Enter");
  await tabTo(page, /^Light$/);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", "dark");
  await page.keyboard.press("Escape");
  await expect(page.locator(":focus")).toHaveAccessibleName(/Appearance/);
  await expect(page).toHaveURL(/mode=dark/);
  // Collection: reach a tile from the menu, open it with Enter.
  await menu(page, "Collection").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Datasets");
  await tabTo(page, /Coastal temperatures/);
  expect(await focusRing(page), "focus ring on a tile").toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Coastal temperatures");
  // Article: the confirmation dialog by keyboard; Escape closes it and focus returns to its button.
  await tabTo(page, /^Request access$/);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(":focus")).toHaveAccessibleName("Request access");
  // Editorial frame: its home link (keyboard) keeps mode and configuration.
  await menu(page, "Editorial frame").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Join the workspace");
  await page.getByRole("link", { name: "Field Lab, overview" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#screen=overview&mode=dark&config=default$/);
  expect(foreign(requests)).toEqual([]);
  expect(errors).toEqual([]);
  await context.close();
});

for (const mode of ["light", "dark"] as const)
  test(`file://, ${mode}, 360 × 800: every screen keeps Marquee's identity and needs no sideways scroll`, async ({ browser }) => {
    const context = await browser.newContext({ offline: true, viewport: { width: 360, height: 800 } });
    const requests: string[] = [];
    context.on("request", (r) => requests.push(r.url()));
    const { page, errors } = await openKit(context, `screen=overview&mode=${mode}&config=default`);
    for (const [label, heading] of SCREENS) {
      await menu(page, label).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", mode);
      expect(await noOverflow(page), `${label} overflow at 360`).toBe(true);
      // Heavy Manrope display headings.
      const h1 = await page.locator("h1").evaluate((e) => [getComputedStyle(e).fontFamily, getComputedStyle(e).fontWeight]);
      expect(h1[0], `${label} display face`).toMatch(/^"?wds-marquee-default-manrope"?,/);
      expect(h1[1], `${label} display weight`).toBe("800");
    }
    // Collection at 360: tiles stacked in one column, with the card shadow in both modes.
    await menu(page, "Collection").click();
    const tiles = await page.locator(".wl-shelf .wl-tile").evaluateAll((els) => els.slice(0, 3).map((e) => {
      const r = e.getBoundingClientRect(); return { x: Math.round(r.x), shadow: getComputedStyle(e).boxShadow };
    }));
    expect(new Set(tiles.map((t) => t.x)).size, "one column").toBe(1);
    for (const t of tiles) expect(t.shadow).toContain(mode === "dark" ? "rgba(0, 0, 0, 0.4)" : "rgba(25, 24, 29, 0.08)");
    expect(foreign(requests)).toEqual([]);
    expect(errors).toEqual([]);
    await context.close();
  });
