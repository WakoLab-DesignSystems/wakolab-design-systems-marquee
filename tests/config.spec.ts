// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at 0856c723bcf1047b61b093b9bf92d36d71f7a402, tests/config.spec.ts; Folio names → Marquee names (Marquee adaptations noted where they apply).
// Explicit configuration (standard CONFIGURATION.md and INDEPENDENCE_CHECK §3; CONFIGURATION §2.1 at c2ca848).
// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// tests/config.spec.ts; expected values are Marquee's (defaults, example configuration, font stacks). Marquee
// declares no system roles: Folio's panel roles are reported as unknown, and the role independence and
// configurable shadows that matter for Marquee are tested below.
// Values are applied as written; omitted keys keep defaults; nothing is judged.
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const example = JSON.parse(readFileSync("examples/config/design-config.json", "utf8"));
const defaults = JSON.parse(readFileSync("config.default.json", "utf8"));
const base = { system: "marquee", systemVersion: "0.1.0" };

async function harness(page: Page, query = "") {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto(`/harness/index.html${query}`);
  await page.evaluate(() => (window as any).harness.ready);
  return requests;
}
const mount = (page: Page, id: string, slot: string, props: object) => page.evaluate(([i, s, p]) => (window as any).harness.mount(i, s, p), [id, slot, props] as const);
const update = (page: Page, id: string, props: object) => page.evaluate(([i, p]) => (window as any).harness.update(i, p), [id, props] as const);
const v = (page: Page, id: string, name: string) => page.evaluate(([i, n]) => getComputedStyle(document.getElementById(`root-${i}`)!).getPropertyValue(n).trim(), [id, name] as const);
const settle = (page: Page) => page.waitForTimeout(50);

test("example file: values exactly as written in each mode; omitted roles keep defaults; pressed follows the effective hover", async ({ page }) => {
  await harness(page);
  await mount(page, "a", "slot-a", { config: example, assetBase: "/design/", mode: "light" });
  await settle(page);
  for (const [role, value] of Object.entries(example.colors.light)) expect(await v(page, "a", `--wl-${role}`), `light ${role}`).toBe(value);
  for (const role of ["surface", "ink", "on-action", "danger", "accent", "scrim"]) expect(await v(page, "a", `--wl-${role}`), `light ${role} default`).toBe(defaults.colors.light[role].replace(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/, "rgb($1 $2 $3 / $4)"));
  expect(await v(page, "a", "--wl-action-pressed")).toBe(example.colors.light["action-hover"]);
  expect(await page.locator("#a-primary").evaluate((b) => getComputedStyle(b).backgroundColor)).toBe("rgb(45, 91, 215)");
  expect(await page.locator("#a-link").evaluate((b) => getComputedStyle(b).color)).toBe("rgb(31, 79, 191)");
  await expect.poll(() => page.locator("#root-a .wl-tile").evaluate((b) => getComputedStyle(b).boxShadow)).toBe("rgba(20, 30, 80, 0.12) 0px 4px 16px 0px");
  await update(page, "a", { config: example, assetBase: "/design/", mode: "dark" });
  await settle(page);
  for (const [role, value] of Object.entries(example.colors.dark)) expect(await v(page, "a", `--wl-${role}`), `dark ${role}`).toBe(value);
  expect(await v(page, "a", "--wl-focus")).toBe(defaults.colors.dark.focus);
  expect(await v(page, "a", "--wl-action-pressed")).toBe(example.colors.dark["action-hover"]);
  await expect.poll(() => page.locator("#root-a .wl-tile").evaluate((b) => getComputedStyle(b).boxShadow)).toBe("rgba(0, 0, 0, 0.55) 0px 4px 18px 0px");
});

test("explicit action-pressed wins; any CSS colour syntax is used as written, even low contrast", async ({ page }) => {
  await harness(page);
  await mount(page, "a", "slot-a", { mode: "light", config: { ...base, colors: { light: { action: "rgb(200 10 10)", "action-pressed": "#ff00aa", "on-action": "#fefefe", surface: "#fdfdfd" } } } });
  await settle(page);
  expect(await v(page, "a", "--wl-action")).toBe("rgb(200 10 10)");
  expect(await v(page, "a", "--wl-action-pressed")).toBe("#ff00aa");
  expect(await v(page, "a", "--wl-on-action")).toBe("#fefefe");
  expect(await page.evaluate(() => (window as any).harness.diagnostics.length)).toBe(0);
});

test("action only (C1): link and focus keep their defaults; pressed follows the default hover; dark unchanged; explicit then removed", async ({ page }) => {
  await harness(page);
  await mount(page, "a", "slot-a", { mode: "light", config: { ...base, colors: { light: { action: "#0e7c66" } } } });
  await settle(page);
  expect(await v(page, "a", "--wl-action")).toBe("#0e7c66");
  expect(await v(page, "a", "--wl-link")).toBe(defaults.colors.light.link);
  expect(await v(page, "a", "--wl-focus")).toBe(defaults.colors.light.focus);
  expect(await v(page, "a", "--wl-action-pressed")).toBe(defaults.colors.light["action-hover"]);
  await update(page, "a", { mode: "dark", config: { ...base, colors: { light: { action: "#0e7c66" } } } });
  await settle(page);
  expect(await v(page, "a", "--wl-action")).toBe(defaults.colors.dark.action);
  await update(page, "a", { mode: "light", config: { ...base, colors: { light: { action: "#0e7c66", link: "#123456", focus: "#654321" } } } });
  await settle(page);
  expect(await v(page, "a", "--wl-link")).toBe("#123456");
  expect(await v(page, "a", "--wl-focus")).toBe("#654321");
  await update(page, "a", { mode: "light", config: { ...base, colors: { light: { action: "#0e7c66" } } } });
  await settle(page);
  expect(await v(page, "a", "--wl-link")).toBe(defaults.colors.light.link);
  expect(await v(page, "a", "--wl-focus")).toBe(defaults.colors.light.focus);
  await update(page, "a", { mode: "dark", config: { ...base, colors: { dark: { action: "#abcdef" } } } });
  await settle(page);
  expect(await v(page, "a", "--wl-action")).toBe("#abcdef");
  await update(page, "a", { mode: "light", config: { ...base, colors: { dark: { action: "#abcdef" } } } });
  await settle(page);
  expect(await v(page, "a", "--wl-action")).toBe(defaults.colors.light.action);
});

test("fonts and logos from the consumer's files; removal restores defaults; text fallback without a logo", async ({ page }) => {
  await harness(page);
  await mount(page, "a", "slot-a", { mode: "light" });
  await settle(page);
  await expect(page.locator("#root-a .wl-brand")).toHaveText("Root a");
  // The example configures the display role (Marquee's Manrope headings) with its own file.
  const defaultFont = await page.locator("#a-display").evaluate((e) => getComputedStyle(e).fontFamily);
  expect(defaultFont).toMatch(/^"?wds-marquee-default-manrope"?,/);
  await update(page, "a", { mode: "light", config: example, assetBase: "/design/" });
  await page.waitForFunction(() => [...document.fonts].some((f) => f.family.startsWith("wds-marquee-font-") && f.status === "loaded") || document.fonts.ready);
  await page.evaluate(() => document.fonts.ready);
  const fam = await page.locator("#a-display").evaluate((e) => getComputedStyle(e).fontFamily);
  expect(fam).toMatch(/^"?wds-marquee-font-[0-9a-f]{8}"?, "?wds-marquee-default-noto-sans-sc"?, "?wds-marquee-default-noto-sans-devanagari"?, system-ui, sans-serif$/);
  expect(await page.locator("#a-ui").evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^"?wds-marquee-default-dm-sans"?,/);
  expect(fam).not.toContain("Example Sans");
  expect(await page.evaluate(() => [...document.fonts].filter((f) => f.family.startsWith("wds-marquee-font-")).map((f) => f.status))).toContain("loaded");
  const mark = page.locator("#root-a .wl-logo-mark"), word = page.locator("#root-a .wl-logo-wordmark");
  await expect(mark).toHaveAttribute("src", /\/design\/logo\/mark\.svg$/);
  await expect(word).toHaveAttribute("src", /wordmark-light\.svg$/);
  await expect(page.locator("#root-a .wl-brand")).toHaveAttribute("aria-label", "Example App home");
  expect(await mark.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await update(page, "a", { mode: "dark", config: example, assetBase: "/design/" });
  await expect(word).toHaveAttribute("src", /wordmark-dark\.svg$/);
  await update(page, "a", { mode: "light", config: { ...base, logo: { wordmark: "logo/wordmark-light.svg" } }, assetBase: "/design/" });
  await expect(page.locator("#root-a .wl-logo-mark")).toHaveCount(0);
  await expect(word).toHaveAttribute("src", /wordmark-light\.svg$/);
  await expect(page.locator("#root-a .wl-brand")).toHaveAttribute("aria-label", "Root a");
  await update(page, "a", { mode: "light" });
  await settle(page);
  await expect(page.locator("#root-a .wl-brand")).toHaveText("Root a");
  expect(await page.locator("#a-display").evaluate((e) => getComputedStyle(e).fontFamily)).toBe(defaultFont);
  expect(await page.evaluate(() => (window as any).harness.faceSets())).toEqual({});
});

test("structural diagnostics only: wrong types, unknown keys and roles, unresolved and missing assets; defaults kept", async ({ page }) => {
  await harness(page);
  const bad = { system: "folio", extra: 1, colors: { light: { action: 12, nope: "#000", link: "not a colour at all" }, sepia: {} },
    fonts: { ui: { family: "X", files: [{ src: "fonts/missing.woff2" }] }, display: { files: [] } }, logo: { mark: "logo/mark.svg", alt: 3 } };
  await mount(page, "a", "slot-a", { mode: "light", config: bad }); // no assetBase
  await settle(page);
  const keys = await page.evaluate(() => (window as any).harness.diagnostics.map((d: any) => d.key));
  for (const k of ["extra", "system", "systemVersion", "colors.light.action", "colors.light.nope", "colors.sepia", "fonts.ui.files[0].src", "fonts.ui", "fonts.display", "logo.mark", "logo.alt"]) expect(keys, k).toContain(k);
  expect(await v(page, "a", "--wl-action")).toBe(defaults.colors.light.action);
  expect(keys).not.toContain("colors.light.link");
  expect(await v(page, "a", "--wl-link")).toBe("not a colour at all"); // used as written; the browser decides
  await update(page, "a", { mode: "light", config: { ...base, fonts: { ui: { family: "X", files: [{ src: "fonts/missing.woff2" }] } } }, assetBase: "/design/" });
  await page.waitForFunction(() => (window as any).harness.diagnostics.some((d: any) => /failed to load/.test(d.message)), null, { timeout: 5000 });
});

test("no request other than the page's own assets", async ({ page }) => {
  const requests = await harness(page);
  await mount(page, "a", "slot-a", { mode: "light", config: example, assetBase: "/design/" });
  await page.waitForTimeout(500);
  const foreign = requests.filter((u) => !u.startsWith("http://127.0.0.1:5192/"));
  expect(foreign).toEqual([]);
  expect(requests.some((u) => /\/api\//.test(u))).toBe(false);
});

// Review R2 on #5: each font role keeps or restores its own default, independently of ui.
test("fonts: ui alone leaves display and code at their defaults; each role is set and removed independently", async ({ page }) => {
  await harness(page);
  const fam = (id: string, el: string) => page.locator(`#${id}-${el}`).evaluate((e) => getComputedStyle(e).fontFamily);
  await mount(page, "a", "slot-a", { mode: "light" });
  await page.waitForTimeout(50);
  const initial = { ui: await fam("a", "ui"), display: await fam("a", "display"), code: await fam("a", "code"), prose: await fam("a", "prose") };
  expect(initial.display).toMatch(/^"?wds-marquee-default-manrope"?,/);
  expect(initial.code).toMatch(/^"?wds-marquee-default-dm-sans"?,/);
  const file = (q: string) => ({ family: "Example Sans", files: [{ src: `fonts/example-sans.woff2?${q}` }] });
  const set = (fonts: object) => update(page, "a", { mode: "light", assetBase: "/design/", config: { ...base, fonts } });
  // ui only
  await set({ ui: file("ui") });
  await page.waitForTimeout(100);
  expect(await fam("a", "ui")).toMatch(/^"?wds-marquee-font-/);
  expect(await fam("a", "display")).toBe(initial.display);
  expect(await fam("a", "code")).toBe(initial.code);
  expect(await fam("a", "prose")).toBe(initial.prose);
  // explicit display and code, then remove each one alone
  await set({ ui: file("ui"), display: file("display"), code: file("code") });
  await page.waitForTimeout(100);
  const [u, d, c] = [await fam("a", "ui"), await fam("a", "display"), await fam("a", "code")];
  for (const f of [u, d, c]) expect(f).toMatch(/^"?wds-marquee-font-/);
  expect(new Set([u, d, c]).size).toBe(3);
  await set({ ui: file("ui"), code: file("code") });
  await page.waitForTimeout(100);
  expect(await fam("a", "display")).toBe(initial.display);
  expect(await fam("a", "code")).toBe(c);
  await set({ ui: file("ui") });
  await page.waitForTimeout(100);
  expect(await fam("a", "code")).toBe(initial.code);
  expect(await fam("a", "ui")).toBe(u);
  await set({ display: file("display") });
  await page.waitForTimeout(100);
  expect(await fam("a", "ui")).toBe(initial.ui);
  expect(await fam("a", "display")).toBe(d);
  expect(await fam("a", "code")).toBe(initial.code);
  await update(page, "a", { mode: "light" });
  await page.waitForTimeout(100);
  expect({ ui: await fam("a", "ui"), display: await fam("a", "display"), code: await fam("a", "code"), prose: await fam("a", "prose") }).toEqual(initial);
});

// Review R3 on #5: a failed asset restores the affected default, is reported structurally, and the
// root recovers when a valid configuration arrives; other roots and host-owned fonts are untouched.
test("asset failure: missing font and logo files fall back to defaults, are reported, and recover", async ({ page }) => {
  await harness(page);
  // A font owned by the host page, outside Console.
  await page.evaluate(async () => { const f = new FontFace("Host Face", "url(/design/fonts/example-sans.woff2?host)"); document.fonts.add(f); await f.load(); (window as any).__hostFace = f; });
  const fam = (id: string, el = "ui") => page.locator(`#${id}-${el}`).evaluate((e) => getComputedStyle(e).fontFamily);
  const keys = () => page.evaluate(() => (window as any).harness.diagnostics.map((d: any) => `${d.id}:${d.key}`));
  const missing = { ...base, fonts: { ui: { family: "Example Sans", files: [{ src: "fonts/missing-ui.woff2" }] }, display: { family: "Example Sans", files: [{ src: "fonts/example-sans.woff2?display" }] } },
    logo: { mark: "logo/missing-mark.svg", wordmark: { light: "logo/missing-word.svg", dark: "logo/wordmark-dark.svg" }, alt: "Broken logo" } };
  await mount(page, "a", "slot-a", { mode: "light" });
  await page.waitForTimeout(50);
  const defaults = { ui: await fam("a"), display: await fam("a", "display") };
  await mount(page, "b", "slot-b", { mode: "light", config: example, assetBase: "/design/" });
  await update(page, "a", { mode: "light", config: missing, assetBase: "/design/" });
  await page.waitForFunction(() => (window as any).harness.diagnostics.some((d: any) => d.key === "fonts.ui.files[0].src"));
  await expect(page.locator("#root-a .wl-brand")).toHaveText("Root a");
  expect(await keys()).toEqual(expect.arrayContaining(["a:fonts.ui.files[0].src", "a:logo.mark", "a:logo.wordmark.light"]));
  expect(await fam("a")).toBe(defaults.ui); // failed ui role: default restored
  expect(await fam("a", "display")).toMatch(/^"?wds-marquee-font-/); // the valid display file is unaffected
  await expect(page.locator("#root-a .wl-brand")).toHaveAttribute("aria-label", "Broken logo");
  // Other root (example configuration: display file) and host font untouched.
  expect(await fam("b", "display")).toMatch(/^"?wds-marquee-font-/);
  expect(await page.locator("#root-b .wl-logo-mark").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  expect(await keys()).not.toEqual(expect.arrayContaining([expect.stringMatching(/^b:/)]));
  expect(await page.evaluate(() => [...document.fonts].includes((window as any).__hostFace) && (window as any).__hostFace.status)).toBe("loaded");
  // Dark wordmark is valid: the dark logo shows the wordmark only (the mark stays dropped).
  await update(page, "a", { mode: "dark", config: missing, assetBase: "/design/" });
  await expect(page.locator("#root-a .wl-logo-wordmark")).toHaveAttribute("src", /wordmark-dark\.svg$/);
  await expect(page.locator("#root-a .wl-logo-mark")).toHaveCount(0);
  // Recovery: a valid configuration replaces the failed files.
  await update(page, "a", { mode: "light", config: example, assetBase: "/design/" });
  await expect(page.locator("#root-a .wl-logo-mark")).toHaveAttribute("src", /\/logo\/mark\.svg$/);
  await expect.poll(() => page.locator("#root-a .wl-logo-wordmark").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  expect(await fam("a", "display")).toMatch(/^"?wds-marquee-font-/);
  expect(await fam("a", "display")).toBe(await fam("b", "display")); // same face set as root b, shared
  // Replacement by a failing file again, then removal: defaults each time.
  await update(page, "a", { mode: "light", config: { ...base, fonts: { ui: { family: "X", files: [{ src: "fonts/missing-again.woff2" }] } } }, assetBase: "/design/" });
  await expect.poll(() => fam("a")).toBe(defaults.ui);
  await expect(page.locator("#root-a .wl-brand")).toHaveText("Root a");
  await update(page, "a", { mode: "light" });
  await page.waitForTimeout(50);
  expect({ ui: await fam("a"), display: await fam("a", "display") }).toEqual(defaults);
  expect(await fam("b", "display")).toMatch(/^"?wds-marquee-font-/);
  expect(await page.evaluate(() => (window as any).__hostFace.status)).toBe("loaded");
});

test("asset failure shared by two roots: both fall back and both are told", async ({ page }) => {
  await harness(page);
  const cfg = { ...base, fonts: { ui: { family: "Same", files: [{ src: "fonts/missing-shared.woff2" }] } } };
  await mount(page, "a", "slot-a", { mode: "light" });
  await page.waitForTimeout(50);
  const def = await page.locator("#a-ui").evaluate((e) => getComputedStyle(e).fontFamily);
  await update(page, "a", { mode: "light", config: cfg, assetBase: "/design/" });
  await page.waitForFunction(() => (window as any).harness.diagnostics.some((d: any) => d.id === "a" && d.key === "fonts.ui.files[0].src"));
  await mount(page, "b", "slot-b", { mode: "dark", config: cfg, assetBase: "/design/" });
  await page.waitForFunction(() => (window as any).harness.diagnostics.some((d: any) => d.id === "b" && d.key === "fonts.ui.files[0].src"));
  await expect.poll(() => page.locator("#b-ui").evaluate((e) => getComputedStyle(e).fontFamily)).toBe(def);
  expect(await page.locator("#a-ui").evaluate((e) => getComputedStyle(e).fontFamily)).toBe(def);
});

// Review on #5: distinct regular, bold, italic and subset files are selected by their descriptors,
// shown by glyph metrics against reference faces of the same files, and a subset loads only when used.
test("fonts: distinct regular, bold, italic and subset files are selected by descriptors", async ({ page }) => {
  await harness(page);
  await mount(page, "a", "slot-a", { mode: "light", assetBase: "/design/", config: { ...base, fonts: { ui: { family: "Faces", files: [
    { src: "fonts/example-sans.woff2", weight: "400", style: "normal", unicodeRange: "U+0000-00FF" },
    { src: "fonts/test-bold.woff2", weight: "700", style: "normal", unicodeRange: "U+0000-00FF" },
    { src: "fonts/test-italic.woff2", weight: "400", style: "italic", unicodeRange: "U+0000-00FF" },
    { src: "fonts/test-cyrillic.woff2", weight: "400", style: "normal", unicodeRange: "U+0400-045F" },
  ] } } } });
  await page.waitForTimeout(100);
  const faces = () => page.evaluate(() => Object.fromEntries([...document.fonts].filter((f) => f.family.replace(/"/g, "").startsWith("wds-marquee-font-")).map((f) => [`${f.weight}/${f.style}/${f.unicodeRange}`, f.status])));
  // Reference faces of the same files under page-level names (the test page is the host here).
  await page.evaluate(async () => {
    const add = async (family: string, file: string, d: FontFaceDescriptors = {}) => { const f = new FontFace(family, `url(/design/fonts/${file})`, d); document.fonts.add(f); await f.load(); };
    await add("RefRegular", "example-sans.woff2"); await add("RefBold", "test-bold.woff2", { weight: "700" });
    await add("RefItalic", "test-italic.woff2", { style: "italic" }); await add("RefCyr", "test-cyrillic.woff2");
  });
  const measure = (text: string, family: string, weight = "400", style = "normal") => page.evaluate(async ([t, f, w, s]) => {
    const el = document.createElement("span");
    Object.assign(el.style, { fontFamily: f, fontWeight: w, fontStyle: s, fontSize: "40px", whiteSpace: "nowrap", position: "absolute" });
    el.textContent = t;
    document.getElementById("a-main")!.append(el);
    el.getBoundingClientRect(); // layout first, so that a lazily loaded face starts loading
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => r(null)));
    const width = el.getBoundingClientRect().width; el.remove(); return width;
  }, [text, family, weight, style] as const);
  const latin = "Quick Wizard 0123";
  expect(await measure(latin, "var(--wl-font-ui)")).toBeCloseTo(await measure(latin, "RefRegular"), 1);
  expect(await faces()).toMatchObject({ "400/normal/U+400-45F": "unloaded" }); // subset not used yet, not loaded
  expect(await measure(latin, "var(--wl-font-ui)", "700")).toBeCloseTo(await measure(latin, "RefBold", "700"), 1);
  expect(await measure(latin, "var(--wl-font-ui)", "400", "italic")).toBeCloseTo(await measure(latin, "RefItalic", "400", "italic"), 1);
  const cyr = "Приветмир"; // no space: U+0020 belongs to the Latin range, served by the regular file
  expect(await measure(cyr, "var(--wl-font-ui)")).toBeCloseTo(await measure(cyr, "RefCyr"), 1);
  expect(await faces()).toMatchObject({ "400/normal/U+400-45F": "loaded" });
  // The faces really differ, so equal widths identify the file.
  const widths = [await measure(latin, "RefRegular"), await measure(latin, "RefBold", "700"), await measure(latin, "RefItalic", "400", "italic")];
  expect(new Set(widths.map((w) => w.toFixed(1))).size).toBe(3);
});

// Marquee role independence (C1/C2): link never follows action, focus never follows ink; shadows are
// configurable roles applied exactly as written per mode, and each omitted one keeps its own default.
// Tiles animate their shadow over --wl-motion, so shadow reads wait for the transition (expect.poll).
test("independent roles and shadows: link not from action, focus not from ink, shadow-card and shadow-pop as written, removal", async ({ page }) => {
  await harness(page);
  const state = () => page.evaluate(() => {
    const link = document.getElementById("a-link")!, tile = document.querySelector("#root-a .wl-tile")!, card = document.querySelector("#root-a .wl-card-section")!;
    return { link: getComputedStyle(link).color, outline: getComputedStyle(link).outlineColor, ink: getComputedStyle(document.getElementById("a-ui")!).color,
      tile: getComputedStyle(tile).boxShadow, card: getComputedStyle(card).boxShadow };
  });
  await mount(page, "a", "slot-a", { mode: "light" });
  await settle(page);
  await page.locator("#a-primary").focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); // keyboard modality
  await page.locator("#a-link").focus();
  const DEF = await state();
  expect(DEF).toEqual({ link: "rgb(163, 54, 26)", outline: "rgb(25, 24, 29)", ink: "rgb(25, 24, 29)",
    tile: "rgba(25, 24, 29, 0.08) 0px 2px 8px 0px", card: "rgba(25, 24, 29, 0.08) 0px 2px 8px 0px" });
  // action and ink set: link and focus keep their own defaults.
  await update(page, "a", { mode: "light", config: { ...base, colors: { light: { action: "#0000ff", "action-hover": "#000088", ink: "#333333" } } } });
  await settle(page);
  await expect.poll(state).toEqual({ ...DEF, ink: "rgb(51, 51, 51)" });
  await expect.poll(() => page.locator("#a-primary").evaluate((b) => getComputedStyle(b).backgroundColor)).toBe("rgb(0, 0, 255)"); // buttons animate colours
  // Shadows as written (any CSS shadow syntax), light only; dark keeps its defaults.
  const shadows = { ...base, colors: { light: { "shadow-card": "0 0 0 3px rgb(255 0 0)", "shadow-pop": "none" } } };
  await update(page, "a", { mode: "light", config: shadows });
  await settle(page);
  expect(await v(page, "a", "--wl-shadow-card")).toBe("0 0 0 3px rgb(255 0 0)");
  await expect.poll(state).toMatchObject({ tile: "rgb(255, 0, 0) 0px 0px 0px 3px", card: "rgb(255, 0, 0) 0px 0px 0px 3px" });
  await page.locator("#root-a .wl-tile").hover();
  await expect.poll(() => page.locator("#root-a .wl-tile").evaluate((e) => getComputedStyle(e).boxShadow)).toBe("none");
  await page.mouse.move(0, 0);
  await update(page, "a", { mode: "dark", config: shadows });
  await settle(page);
  expect(await v(page, "a", "--wl-shadow-card")).toBe(defaults.colors.dark["shadow-card"]);
  await expect.poll(() => page.locator("#root-a .wl-tile").evaluate((e) => getComputedStyle(e).boxShadow)).toBe("rgba(0, 0, 0, 0.4) 0px 2px 10px 0px");
  // Removal restores every default; nothing was reported.
  await update(page, "a", { mode: "light" });
  await settle(page);
  await page.locator("#a-link").focus();
  await expect.poll(state).toEqual(DEF);
  expect(await page.evaluate(() => (window as any).harness.diagnostics)).toEqual([]);
});

test("Folio's panel roles are not Marquee roles: reported as unknown and not applied; a Console-targeted file reports system", async ({ page }) => {
  await harness(page);
  await mount(page, "a", "slot-a", { mode: "light", config: { ...base, colors: { light: { panel: "#152e37", "on-panel": "#edf6ee" } } } });
  await settle(page);
  let keys = await page.evaluate(() => (window as any).harness.diagnostics.map((d: any) => d.key));
  expect(keys).toEqual(expect.arrayContaining(["colors.light.panel", "colors.light.on-panel"]));
  expect(await v(page, "a", "--wl-panel")).toBe("");
  await update(page, "a", { mode: "light", config: { system: "console", systemVersion: "0.1.0" } });
  await settle(page);
  keys = await page.evaluate(() => (window as any).harness.diagnostics.map((d: any) => d.key));
  expect(keys).toContain("system");
});

// Review F-R1 on #5: an invalid font declaration (missing or empty family, empty files) is reported
// structurally and the role keeps its default; family-only and family-with-file stay valid. Non-empty
// values are used as written (never trimmed or judged).
test("fonts: empty family or empty files keep the role's default and are reported; valid forms apply", async ({ page }) => {
  await harness(page);
  const fam = (el: string) => page.locator(`#a-${el}`).evaluate((e) => getComputedStyle(e).fontFamily);
  const keys = () => page.evaluate(() => (window as any).harness.diagnostics.map((d: any) => d.key));
  await mount(page, "a", "slot-a", { mode: "light" });
  await settle(page);
  const def = { ui: await fam("ui"), display: await fam("display") };
  await update(page, "a", { mode: "light", assetBase: "/design/", config: { ...base, fonts: {
    ui: { family: "", files: [{ src: "fonts/example-sans.woff2" }] }, display: { family: "Example", files: [] } } } });
  await settle(page);
  expect(await fam("ui")).toBe(def.ui);
  expect(await fam("display")).toBe(def.display);
  expect(await keys()).toEqual(expect.arrayContaining(["fonts.ui.family", "fonts.display.files"]));
  // Valid: family only (installed or host-loaded font, used as written, spaces kept) and family with a file.
  await update(page, "a", { mode: "light", assetBase: "/design/", config: { ...base, fonts: {
    ui: { family: " Host Face " }, display: { family: "Example", files: [{ src: "fonts/example-sans.woff2" }] } } } });
  await settle(page);
  expect(await fam("ui")).toMatch(/^" Host Face ",/);
  expect(await fam("display")).toMatch(/^"?wds-marquee-font-[0-9a-f]{8}"?,/);
});
