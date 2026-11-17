// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// tests/isolation.spec.ts; Folio names, fonts, scrims and prefix; the keyboard-layer cases are removed
// (Folio has no keyboard layer).
// Isolation of Folio roots in a host page (standard EXTRACTION_MATRIX R1–R3, N2, E2 and
// INDEPENDENCE_CHECK §4 at 6dc2a7a). Original code; synthetic content only.
import { test, expect, type Page } from "@playwright/test";

const base = { system: "console", systemVersion: "0.1.0" };
const font = (src: string | string[], family = "Example Sans") => ({ ...base, fonts: { ui: { family, files: (Array.isArray(src) ? src : [src]).map((s, i) => ({ src: s, weight: i ? "700" : "400" })) } } });

// Host stylesheet that reuses the source's unprefixed global names.
const HOST_CSS = `
  @keyframes wl-rise { from { opacity: 0.25 } to { opacity: 0.25 } }
  @keyframes wl-shimmer { from { opacity: 0.5 } to { opacity: 0.5 } }
  @property --tw-ring-offset-width { syntax: "<length>"; inherits: true; initial-value: 7px; }
  @property --tw-shadow { syntax: "*"; inherits: true; initial-value: host-shadow; }
  @font-face { font-family: "DM Sans Variable"; src: url(/design/fonts/test-bold.woff2) format("woff2"); }
  @font-face { font-family: "Source Serif 4 Variable"; src: url(/design/fonts/example-sans.woff2) format("woff2"); }
  .host-anim { animation: wl-rise 10s linear infinite; transition: color 3s; }
`;

async function open(page: Page, query = "") {
  await page.goto(`/harness/index.html${query}`);
  await page.evaluate(() => (window as any).harness.ready);
}
const mount = (page: Page, id: string, slot: string, props: object = {}) => page.evaluate(([i, s, p]) => (window as any).harness.mount(i, s, p), [id, slot, props] as const);
const update = (page: Page, id: string, props: object) => page.evaluate(([i, p]) => (window as any).harness.update(i, p), [id, props] as const);
const unmount = (page: Page, id: string) => page.evaluate((i) => (window as any).harness.unmount(i), id);
const addHostCss = (page: Page) => page.evaluate((css) => { const s = document.createElement("style"); s.id = "host-css"; s.textContent = css; document.head.append(s); }, HOST_CSS);
const focused = (page: Page) => page.evaluate(() => document.activeElement?.getAttribute("data-wds-item") || document.activeElement?.id || "");
const item = (page: Page, id: string) => page.locator(`[data-wds-item="${id}"]`);
const live = (page: Page) => page.evaluate(() => Object.fromEntries(Object.entries((window as any).__listeners()).filter(([, n]) => n !== 0)));

async function hostSnapshot(page: Page) {
  return page.evaluate(() => {
    const props = ["font-family", "font-size", "line-height", "color", "background-color", "margin", "padding", "box-sizing", "border-top-width", "letter-spacing", "text-decoration-line", "animation-name", "outline-style", "scroll-behavior"];
    const read = (el: Element) => Object.fromEntries(props.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]));
    return Object.fromEntries(["html", "body", "#host", "#host-h1", "#host-p", "#host-btn", "#host-input", "#host-anim", "#host-font"].map((s) => [s, read(document.querySelector(s)!)]));
  });
}

test("host page untouched: html, body and host content compute the same with and without Folio", async ({ page }) => {
  await open(page, "?nocss=1");
  await addHostCss(page);
  const without = await hostSnapshot(page);
  await open(page);
  await addHostCss(page);
  await mount(page, "a", "slot-a", { mode: "dark" });
  await mount(page, "b", "slot-b", { mode: "light", config: font("/design/fonts/example-sans.woff2") });
  await page.waitForTimeout(200);
  expect(await hostSnapshot(page)).toEqual(without);
  expect(await page.evaluate(() => [document.documentElement.getAttribute("style"), document.body.getAttribute("style"), document.documentElement.className, document.body.className, document.documentElement.dataset.theme])).toEqual([null, null, "", "", undefined]);
});

for (const order of ["host stylesheet first", "host stylesheet last"]) {
  test(`global symbols do not collide (${order}): keyframes, @property, font names`, async ({ page }) => {
    if (order === "host stylesheet first") await page.addInitScript((css) => document.addEventListener("DOMContentLoaded", () => { const s = document.createElement("style"); s.textContent = css; document.head.prepend(s); }), HOST_CSS);
    await open(page);
    if (order === "host stylesheet last") await addHostCss(page);
    await mount(page, "a", "slot-a", { mode: "light" });
    await page.waitForTimeout(100);
    // Host keeps its keyframes and registered properties.
    expect(await page.locator("#host-anim").evaluate((e) => [getComputedStyle(e).animationName, getComputedStyle(e).opacity])).toEqual(["wl-rise", "0.25"]);
    expect(await page.locator("#host-p").evaluate((e) => [getComputedStyle(e).getPropertyValue("--tw-ring-offset-width"), getComputedStyle(e).getPropertyValue("--tw-shadow").trim()])).toEqual(["7px", "host-shadow"]);
    // Folio uses its prefixed names only.
    const sk = await page.locator("#a-skeleton").evaluate((e) => getComputedStyle(e, "::after").animationName);
    expect(sk).toBe("wds-folio-wl-shimmer");
    const ring = await page.locator("#a-primary").evaluate((e) => [getComputedStyle(e).getPropertyValue("--wds-folio-tw-ring-offset-width"), getComputedStyle(e).getPropertyValue("--tw-ring-offset-width")]);
    expect(ring[0]).toBe("0px");
    // A host face named like the source's default family does not reach Folio.
    expect(await page.locator("#a-ui").evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^"?wds-folio-default-dm-sans"?,/);
    expect(await page.locator("#a-display").evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^"?wds-folio-default-source-serif-4"?,/);
    for (const id of ["#a-ui", "#a-display"]) expect(await page.locator(id).evaluate((e) => getComputedStyle(e).fontFamily)).not.toMatch(/DM Sans Variable|Source Serif 4 Variable/);
  });
}

test("fonts: same label with different files, multi-file face sets, sharing, replacement and cleanup", async ({ page }) => {
  await open(page);
  const fam = (id: string) => page.locator(`#${id}-ui`).evaluate((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/"/g, ""));
  const faces = () => page.evaluate(() => [...document.fonts].filter((f) => f.family.replace(/"/g, "").startsWith("wds-folio-font-")).map((f) => `${f.family.replace(/"/g, "")}/${f.weight}`).sort());
  // (a) same label, different files → different internal families
  await mount(page, "a", "slot-a", { config: font("/design/fonts/example-sans.woff2?a") });
  await mount(page, "b", "slot-b", { config: font("/design/fonts/example-sans.woff2?b") });
  await page.waitForTimeout(100);
  const [fa, fb] = [await fam("a"), await fam("b")];
  expect(fa).toMatch(/^wds-folio-font-[0-9a-f]{8}$/); expect(fb).toMatch(/^wds-folio-font-[0-9a-f]{8}$/);
  expect(fa).not.toBe(fb);
  // (c) same face set → one family, shared, counted twice
  await update(page, "b", { config: font("/design/fonts/example-sans.woff2?a") });
  await page.waitForTimeout(100);
  expect(await fam("b")).toBe(fa);
  expect(await page.evaluate(() => (window as any).harness.faceSets())).toEqual({ [fa]: 2 });
  expect(await faces()).toEqual([`${fa}/400`]);
  // (b) multi-file face set → one family, one FontFace per file
  await update(page, "b", { config: font(["/design/fonts/example-sans.woff2?c", "/design/fonts/example-sans.woff2?d"]) });
  await page.waitForTimeout(100);
  const fc = await fam("b");
  expect(fc).not.toBe(fa);
  expect(await faces()).toEqual([`${fa}/400`, `${fc}/400`, `${fc}/700`]);
  // (d) replacement releases the previous set when nobody else uses it
  await update(page, "a", { config: font("/design/fonts/example-sans.woff2?e") });
  await page.waitForTimeout(100);
  const fe = await fam("a");
  expect(Object.keys(await page.evaluate(() => (window as any).harness.faceSets())).sort()).toEqual([fc, fe].sort());
  expect(await faces()).not.toContain(`${fa}/400`);
  // (e) cleanup on unmount
  await unmount(page, "a"); await unmount(page, "b");
  expect(await page.evaluate(() => (window as any).harness.faceSets())).toEqual({});
  expect(await faces()).toEqual([]);
  // (f) host text with the configured label is not served by Folio's file
  expect(await page.locator("#host-font").evaluate((e) => document.fonts.check(`16px "Example Sans"`) && [...document.fonts].some((f) => f.family.replace(/"/g, "") === "Example Sans"))).toBe(false);
});

test("two roots: modes independent; overlays keep each root's scrim; theme switch of one leaves the other", async ({ page }) => {
  await open(page);
  await mount(page, "a", "slot-a", { mode: "light" });
  await mount(page, "b", "slot-b", { mode: "dark" });
  await page.waitForTimeout(100);
  const surf = (id: string) => page.locator(`#root-${id}`).evaluate((e) => [e.getAttribute("data-mode"), getComputedStyle(e).backgroundColor]);
  const [la, db] = [await surf("a"), await surf("b")];
  expect(la[0]).toBe("light"); expect(db[0]).toBe("dark"); expect(la[1]).not.toBe(db[1]);
  for (const [id, scrim] of [["a", "rgba(21, 46, 55, 0.45)"], ["b", "rgba(0, 0, 0, 0.6)"]]) {
    await page.click(`#${id}-open-dialog`);
    const dlg = page.locator(`#root-${id} dialog[open]`);
    await expect(dlg).toBeVisible();
    expect(await dlg.evaluate((d) => getComputedStyle(d, "::backdrop").backgroundColor)).toBe(scrim);
    await expect(page.locator(`#${id}-dialog-keep`)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dlg).toHaveCount(0);
    await expect(page.locator(`#${id}-open-dialog`)).toBeFocused();
  }
  await update(page, "a", { mode: "dark" });
  // Auto-waiting: the switch is applied at the next render (review on folio#5: an immediate snapshot
  // failed once in Revex's run and passed on rerun).
  await expect.poll(() => surf("a")).toEqual(["dark", db[1]]);
  await expect.poll(() => surf("b")).toEqual(db);
});

test("popovers: per root, nested Escape closes the innermost only, outside press closes without moving focus, listeners removed", async ({ page }) => {
  await page.addInitScript(() => {
    const live = new Map<string, number>();
    const add = Document.prototype.addEventListener, remove = Document.prototype.removeEventListener;
    const seen = new WeakSet<object>();
    Document.prototype.addEventListener = function (t: string, l: any, o?: any) { if (!seen.has(l)) { seen.add(l); live.set(t, (live.get(t) ?? 0) + 1); } return add.call(this, t, l, o); };
    Document.prototype.removeEventListener = function (t: string, l: any, o?: any) { if (seen.has(l)) { seen.delete(l); live.set(t, (live.get(t) ?? 0) - 1); } return remove.call(this, t, l, o); };
    (window as any).__listeners = () => Object.fromEntries(live);
  });
  await open(page);
  await mount(page, "a", "slot-a", { mode: "light" });
  await mount(page, "b", "slot-b", { mode: "dark" });
  await page.waitForTimeout(100);
  const baseline = await live(page);
  await page.click("#a-pop");
  await expect(page.locator("#a-pop-item")).toBeVisible();
  await page.click("#a-pop-inner");
  await expect(page.locator("#a-pop-inner-item")).toBeVisible();
  await page.locator("#a-pop-inner-item").focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#a-pop-inner-item")).toHaveCount(0);
  await expect(page.locator("#a-pop-item")).toBeVisible();
  await expect(page.locator("#a-pop-inner")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#a-pop-item")).toHaveCount(0);
  await expect(page.locator("#a-pop")).toBeFocused();
  // A press outside (here in root B) closes A without moving focus back to A's trigger.
  await page.click("#a-pop");
  await expect(page.locator("#a-pop-item")).toBeVisible();
  await page.locator("#b-lead").click();
  await expect(page.locator("#a-pop-item")).toHaveCount(0);
  expect(await focused(page)).not.toBe("a-pop");
  // Escape in root B does not touch an open popover in root A.
  await page.click("#a-pop");
  await page.locator("#b-primary").focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#a-pop-item")).toBeVisible();
  await page.locator("#host-p").click();
  await expect(page.locator("#a-pop-item")).toHaveCount(0);
  expect(await live(page)).toEqual(baseline);
  await page.click("#b-pop");
  await unmount(page, "b");
  expect(await live(page)).toEqual(baseline);
});

test("modal dialog: rest of the page inert", async ({ page }) => {
  await open(page);
  await mount(page, "a", "slot-a", { mode: "light" });
  await mount(page, "b", "slot-b", { mode: "dark" });
  await page.click("#a-open-dialog");
  const dlg = page.locator("#root-a dialog[open]");
  expect(await dlg.evaluate((d) => d.matches(":modal"))).toBe(true);
  await page.locator("#host-btn").click({ force: true, trial: false }).catch(() => {});
  expect(await focused(page)).not.toBe("host-btn");
  await page.keyboard.press("Escape");
  await expect(dlg).toHaveCount(0);
  await expect(page.locator("#a-open-dialog")).toBeFocused();
});

test("reduced motion applies inside Folio roots only", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await addHostCss(page);
  await mount(page, "a", "slot-a", { mode: "light" });
  await page.waitForTimeout(50);
  expect(await page.locator("#host-anim").evaluate((e) => [getComputedStyle(e).animationDuration, getComputedStyle(e).transitionDuration])).toEqual(["10s", "3s"]);
  expect(await page.locator("#host-p").evaluate((e) => getComputedStyle(e).scrollBehavior)).toBe("auto");
  expect(await page.locator("#a-skeleton").evaluate((e) => getComputedStyle(e, "::after").display)).toBe("none");
  expect(await page.locator("#a-primary").evaluate((e) => getComputedStyle(e).transitionDuration)).toMatch(/^(0s|1e-05s)/);
});

// Review on #5: popover keyboard behaviour inside an open modal dialog.
test("popover inside a modal: Escape closes the popover first and keeps the dialog; outside press inside the dialog closes it", async ({ page }) => {
  await open(page);
  await mount(page, "a", "slot-a", { mode: "light" });
  await mount(page, "b", "slot-b", { mode: "dark" });
  await page.click("#a-open-dialog");
  const dlg = page.locator("#root-a dialog[open]");
  await expect(dlg).toBeVisible();
  await page.click("#a-dlg-pop");
  await expect(page.locator("#a-dlg-pop-item")).toBeVisible();
  await page.locator("#a-dlg-pop-item").focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#a-dlg-pop-item")).toHaveCount(0);
  await expect(dlg).toBeVisible();
  await expect(page.locator("#a-dlg-pop")).toBeFocused();
  // Escape on the trigger of the closed popover reaches the dialog.
  await page.click("#a-dlg-pop");
  await page.locator("#a-dialog-text").click();
  await expect(page.locator("#a-dlg-pop-item")).toHaveCount(0);
  await expect(dlg).toBeVisible();
  await page.locator("#a-dlg-pop").focus();
  await page.keyboard.press("Escape");
  await expect(dlg).toHaveCount(0);
  await expect(page.locator("#a-open-dialog")).toBeFocused();
  // Root B's popover was never touched.
  await expect(page.locator("#b-pop-item")).toHaveCount(0);
});
