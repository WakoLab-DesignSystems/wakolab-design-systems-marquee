// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at 0856c723bcf1047b61b093b9bf92d36d71f7a402, tests/defaults.spec.ts; Folio names → Marquee names (Marquee adaptations noted where they apply).
// Shipped defaults on the Marquee demo (standard INDEPENDENCE_CHECK §2 "Shipped defaults"; CHECKLIST).
// Structure copied from WakoLab-DesignSystems/wakolab-design-systems-console at
// 018fe3214e0a118162d202c2f39f1236f37b1936, tests/defaults.spec.ts; every expected value is Marquee's own
// (src/styles/tokens.css, from the frontend's Marquee blocks at e492bec). Marquee has no keyboard layer.
import { test, expect } from "@playwright/test";
import { axe, noOverflow, open } from "./helpers";

const screens = ["overview", "collection", "article", "form", "message", "states", "components", "registration"];
for (const mode of ["light", "dark"])
  test(`${mode}: every demo screen is axe A/AA clean and reflows from 320px`, async ({ page }) => {
    for (const screen of screens) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await open(page, `screen=${screen}&mode=${mode}&config=default`);
      await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", mode);
      expect(await axe(page), `${screen}`).toEqual([]);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await noOverflow(page), `${screen} overflow at ${width}`).toBe(true);
      }
    }
  });

test("menu: reaches every screen, marks the active one, keeps mode and configuration, survives a reload", async ({ page }) => {
  await open(page, "screen=overview&mode=dark&config=example");
  for (const label of ["Collection", "Article", "Form", "Message", "States", "Components", "Editorial frame", "Overview"]) {
    const link = page.getByRole("navigation", { name: "Demo screens" }).getByRole("link", { name: label, exact: true });
    await link.click();
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", "dark");
    await expect(page).toHaveURL(/mode=dark&config=example/);
  }
  await page.getByRole("navigation", { name: "Demo screens" }).getByRole("link", { name: "Article", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Coastal temperatures");
  await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", "dark");
  await expect(page.locator(".wl-logo-mark")).toBeVisible(); // the example configuration is applied again
  // Review F-R2 on #5: the editorial frame's home link keeps mode and configuration.
  await page.getByRole("navigation", { name: "Demo screens" }).getByRole("link", { name: "Editorial frame", exact: true }).click();
  await page.locator(".registration-page").waitFor();
  await page.getByRole("link", { name: "Field Lab, overview" }).click();
  await expect(page).toHaveURL(/#screen=overview&mode=dark&config=example$/);
  await expect(page.locator('[data-wds="marquee"]')).toHaveAttribute("data-mode", "dark");
  await expect(page.getByRole("heading", { level: 1, name: "Marquee" })).toBeVisible();
  await expect(page.locator(".wl-logo-mark")).toBeVisible();
});

test("identity: Marquee tokens, DM Sans UI with Manrope 800 display, radii 10/16/pill and 12 covers, 180 ms motion, shelves of three tiles", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "screen=collection&mode=light&config=default");
  const s = await page.evaluate(() => {
    const root = document.querySelector('[data-wds="marquee"]')!;
    const cs = (sel: string) => getComputedStyle(document.querySelector(sel)!);
    return {
      bg: getComputedStyle(root).backgroundColor, row: getComputedStyle(root).getPropertyValue("--wl-row-height").trim(),
      motion: getComputedStyle(root).getPropertyValue("--wl-motion").trim(), lift: getComputedStyle(root).getPropertyValue("--wl-hover-lift").trim(),
      ui: cs(".wl-entry-meta").fontFamily, h1: cs("h1").fontFamily, h1Weight: cs("h1").fontWeight, h1Tracking: cs("h1").letterSpacing, h1Size: cs("h1").fontSize,
      title: cs(".wl-tile-title").fontFamily, titleWeight: cs(".wl-tile-title").fontWeight,
      control: cs('input[type="search"]').borderTopLeftRadius, chip: cs('[aria-pressed]').borderTopLeftRadius,
      tile: cs(".wl-tile").borderTopLeftRadius, cover: cs(".wl-tile .wl-cover").borderTopLeftRadius,
      shadow: cs(".wl-tile").boxShadow, columns: cs(".wl-shelf .wl-tiles").gridTemplateColumns.split(" ").length,
      search: !!document.querySelector(".wl-topbar .wl-topbar-search input[type=search]"),
      shelves: [...document.querySelectorAll(".wl-shelf")].map((sh) => [sh.querySelector("h2")!.textContent, sh.querySelectorAll(".wl-tile").length, sh.querySelector(".wl-shelf-head button")?.textContent ?? null]),
    };
  });
  expect(s.bg).toBe("rgb(244, 242, 239)");
  expect(s.row).toBe("56px");
  expect(s.motion).toBe("180ms");
  expect(s.lift).toBe("-3px");
  expect(s.ui).toMatch(/^"?wds-marquee-default-dm-sans"?,/);
  expect(s.h1).toMatch(/^"?wds-marquee-default-manrope"?,/);
  expect(s.title).toMatch(/^"?wds-marquee-default-manrope"?,/);
  expect([s.h1Weight, s.titleWeight]).toEqual(["800", "800"]);
  expect(parseFloat(s.h1Size)).toBe(48); // clamp(2.25rem, 5vw, 3rem) at 1280px
  expect(parseFloat(s.h1Tracking)).toBeCloseTo(-0.02 * parseFloat(s.h1Size), 1);
  expect([s.control, s.chip, s.tile, s.cover]).toEqual(["10px", "999px", "16px", "12px"]);
  expect(s.shadow).toContain("rgba(25, 24, 29, 0.08)");
  expect(s.columns).toBe(3);
  expect(s.search).toBe(true);
  // Shelves of at most three tiles; "See all" only when a shelf has more.
  expect(s.shelves).toEqual([["Science", 3, "See all Science"], ["Civic", 1, null], ["Culture", 1, null]]);
  await page.getByRole("button", { name: "See all Science" }).click();
  await expect(page.locator(".wl-shelf")).toHaveCount(0);
  await expect(page.locator('section[aria-label="Datasets"] .wl-tile')).toHaveCount(5);
  // Card shadow in dark mode too.
  await open(page, "screen=collection&mode=dark&config=default");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".wl-tile")!).boxShadow)).toContain("rgba(0, 0, 0, 0.4)");
});

test("hover lift: a tile rises by 3 px and takes the pop shadow; reduced motion keeps it in place", async ({ browser }) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    const ctx = await browser.newContext({ reducedMotion, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await open(page, "screen=collection&mode=light&config=default");
    const tile = page.locator(".wl-shelf .wl-tile").first();
    expect(await tile.evaluate((e) => getComputedStyle(e).transitionDuration)).toBe(reducedMotion === "reduce" ? "0s" : "0.18s, 0.18s");
    await tile.hover();
    await expect.poll(() => tile.evaluate((e) => getComputedStyle(e).transform)).toBe(reducedMotion === "reduce" ? "none" : "matrix(1, 0, 0, 1, 0, -3)");
    await expect.poll(() => tile.evaluate((e) => getComputedStyle(e).boxShadow)).toContain("rgba(25, 24, 29, 0.25)");
    await ctx.close();
  }
});

test("detail and form: bounded 21:9 banner or a 96 px initials band, chips, sticky side from 64rem, form on a raised card", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "screen=article&mode=light&config=default");
  const d = await page.evaluate(() => {
    const banner = document.querySelector(".wl-banner")!;
    const band = banner.querySelector(".wl-cover")!.getBoundingClientRect().height;
    banner.classList.remove("wl-banner--none"); // the same banner with an image
    const cover = getComputedStyle(banner.querySelector(".wl-cover")!);
    const out = { band, none: true, ratio: cover.aspectRatio, max: cover.maxHeight, radius: getComputedStyle(banner).borderTopLeftRadius,
      chips: [...document.querySelectorAll(".wl-chips span")].map((c) => c.textContent),
      side: getComputedStyle(document.querySelector(".wl-project-side")!).position, h1: getComputedStyle(document.querySelector("h1")!).fontWeight,
      card: getComputedStyle(document.querySelector(".wl-card-section")!).boxShadow };
    banner.classList.add("wl-banner--none");
    return out;
  });
  expect(d).toEqual({ band: 96, none: true, ratio: "21 / 9", max: "360px", radius: "16px", chips: ["Sensors", "CSV", "Weekly checks"], side: "sticky", h1: "800",
    card: expect.stringContaining("rgba(25, 24, 29, 0.08)") });
  await page.setViewportSize({ width: 800, height: 900 });
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".wl-project-side")!).position)).toBe("static");
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "screen=form&mode=dark&config=default");
  const f = await page.evaluate(() => { const c = getComputedStyle(document.querySelector(".wl-form")!); return [c.borderTopLeftRadius, c.backgroundColor, c.boxShadow]; });
  expect(f).toEqual(["16px", "rgb(24, 24, 28)", expect.stringContaining("rgba(0, 0, 0, 0.4)")]);
});

test("registration frame: Marquee editorial side and monogram tile, default focus = ink, link independent of action", async ({ page }) => {
  const expected = {
    light: { bg: "rgb(235, 231, 226)", ink: "rgb(25, 24, 29)", eyebrow: "rgb(178, 58, 28)", art: "rgb(178, 58, 28)", artInk: "rgb(255, 255, 255)" },
    dark: { bg: "rgb(35, 35, 41)", ink: "rgb(243, 241, 237)", eyebrow: "rgb(255, 140, 102)", art: "rgb(255, 140, 102)", artInk: "rgb(29, 12, 6)" },
  };
  for (const mode of ["light", "dark"] as const) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, `screen=registration&mode=${mode}&config=default`);
    const s = await page.evaluate(() => {
      const aside = document.querySelector(".registration-editorial")!;
      const art = aside.querySelector(".editorial-art")!;
      return { bg: getComputedStyle(aside).backgroundColor, ink: getComputedStyle(aside).color,
        eyebrow: getComputedStyle(aside.querySelector(".editorial-eyebrow")!).color,
        art: getComputedStyle(art).backgroundColor, artInk: getComputedStyle(art).color, mono: aside.querySelector(".editorial-monogram")!.textContent };
    });
    expect(s).toEqual({ ...expected[mode], mono: "F" });
  }
  await page.goto("/harness/index.html");
  await page.evaluate(() => (window as any).harness.ready);
  await page.evaluate(() => (window as any).harness.mount("a", "slot-a", { mode: "light" }));
  await page.locator("#a-primary").focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); // keyboard modality
  await page.locator("#a-link").focus();
  const link = await page.locator("#a-link").evaluate((e) => [getComputedStyle(e).outlineColor, getComputedStyle(e).color]);
  expect(link).toEqual(["rgb(25, 24, 29)", "rgb(163, 54, 26)"]); // focus default = ink; link (#a3361a) is not action (#b23a1c)
});

test("confirmation dialog, backdrop scrim and focus return, light and dark", async ({ page }) => {
  for (const [mode, scrim] of [["light", "rgba(25, 24, 29, 0.5)"], ["dark", "rgba(0, 0, 0, 0.65)"]]) {
    await open(page, `screen=article&mode=${mode}&config=default`);
    await page.locator("#request").focus(); await page.keyboard.press("Enter");
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Not now" })).toBeFocused();
    expect(await dialog.evaluate((d) => getComputedStyle(d, "::backdrop").backgroundColor)).toBe(scrim);
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await expect(page.locator("#request")).toBeFocused();
  }
});

test("tabs move with arrow keys", async ({ page }) => {
  await open(page, "screen=components&mode=light&config=default");
  await page.getByRole("tab", { name: "Summary" }).focus(); await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "History" })).toHaveAttribute("aria-selected", "true");
});

test("popover: Escape inside closes and returns focus; outside pointer-down closes without moving focus", async ({ page }) => {
  await open(page, "screen=components&mode=light&config=default");
  await page.locator("#more-actions").click();
  await expect(page.getByRole("group", { name: "More actions" })).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "More actions" })).toHaveCount(0);
  await expect(page.locator("#more-actions")).toBeFocused();
  await page.locator("#more-actions").click();
  await page.mouse.click(5, 300);
  await expect(page.getByRole("group", { name: "More actions" })).toHaveCount(0);
});

test("reduced motion: no animation in the root; dialog appears without animation; 180 ms otherwise", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await open(page, "screen=components&mode=light&config=default");
  await page.locator("#dialog-btn").click();
  expect(await page.locator("dialog[open]").evaluate((d) => getComputedStyle(d).animationName)).toBe("none");
  await page.keyboard.press("Escape");
  await open(page, "screen=states&mode=dark&config=default");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await ctx.close();
  const p2 = await browser.newPage();
  await open(p2, "screen=components&mode=light&config=default");
  await p2.locator("#dialog-btn").click();
  expect(await p2.locator("dialog[open]").evaluate((d) => [getComputedStyle(d).animationName, getComputedStyle(d).animationDuration])).toEqual(["wds-marquee-wl-rise", "0.18s"]);
  await p2.close();
});

test("toast does not take focus; busy button keeps its name", async ({ page }) => {
  await open(page, "screen=components&mode=light&config=default");
  await page.locator("#toast-btn").click();
  await expect(page.getByText("Saved. This message is not urgent.")).toBeVisible();
  await expect(page.locator("#toast-btn")).toBeFocused();
  await expect(page.getByRole("button", { name: "Saving" })).toHaveAttribute("aria-busy", "true");
});

test("icons: rendered icon slots carry no path data and are marked missing (package and documentation: scripts/check-artwork.mjs)", async ({ page }) => {
  await open(page, "screen=components&mode=light&config=default");
  const r = await page.evaluate(() => ({ svgs: document.querySelectorAll("svg[data-icon]").length, missing: document.querySelectorAll("svg[data-icon-missing]").length, paths: document.querySelectorAll("svg[data-icon] path").length }));
  expect(r.svgs).toBeGreaterThan(0);
  expect(r.missing).toBe(r.svgs);
  expect(r.paths).toBe(0);
});

// The parity fixture's form, component sheet, registration frame and overlays rendered with Marquee
// only (no frontend modules): axe A/AA and reflow, light and dark. Icon slots stay empty here.
for (const mode of ["light", "dark"])
  test(`${mode}: parity fixture screens are axe A/AA clean and reflow from 320px`, async ({ page }) => {
    for (const screen of ["registration", "form", "components", "overlays"]) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/parity/fixture/index.html?screen=${screen}&mode=${mode}`);
      await expect(page.locator(`[data-wds="marquee"][data-mode="${mode}"]`)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await axe(page), screen).toEqual([]);
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await noOverflow(page), `${screen} overflow at ${width}`).toBe(true);
      }
    }
  });
