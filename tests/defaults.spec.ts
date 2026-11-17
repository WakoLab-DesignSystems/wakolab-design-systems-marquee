// Shipped defaults on the Folio demo (standard INDEPENDENCE_CHECK §2 "Shipped defaults"; CHECKLIST).
// Structure copied from WakoLab-DesignSystems/wakolab-design-systems-console at
// 018fe3214e0a118162d202c2f39f1236f37b1936, tests/defaults.spec.ts; every expected value is Folio's own
// (src/styles/tokens.css, from the frontend's Folio blocks at e492bec). Folio has no keyboard layer.
import { test, expect } from "@playwright/test";
import { axe, noOverflow, open } from "./helpers";

const screens = ["overview", "collection", "article", "form", "message", "states", "components", "registration"];
for (const mode of ["light", "dark"])
  test(`${mode}: every demo screen is axe A/AA clean and reflows from 320px`, async ({ page }) => {
    for (const screen of screens) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await open(page, `screen=${screen}&mode=${mode}&config=default`);
      await expect(page.locator('[data-wds="folio"]')).toHaveAttribute("data-mode", mode);
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
    await expect(page.locator('[data-wds="folio"]')).toHaveAttribute("data-mode", "dark");
    await expect(page).toHaveURL(/mode=dark&config=example/);
  }
  await page.getByRole("navigation", { name: "Demo screens" }).getByRole("link", { name: "Article", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Coastal temperatures");
  await expect(page.locator('[data-wds="folio"]')).toHaveAttribute("data-mode", "dark");
  await expect(page.locator(".wl-logo-mark")).toBeVisible(); // the example configuration is applied again
  // Review F-R2 on #5: the editorial frame's home link keeps mode and configuration.
  await page.getByRole("navigation", { name: "Demo screens" }).getByRole("link", { name: "Editorial frame", exact: true }).click();
  await page.locator(".registration-page").waitFor();
  await page.getByRole("link", { name: "Field Lab, overview" }).click();
  await expect(page).toHaveURL(/#screen=overview&mode=dark&config=example$/);
  await expect(page.locator('[data-wds="folio"]')).toHaveAttribute("data-mode", "dark");
  await expect(page.getByRole("heading", { level: 1, name: "Folio" })).toBeVisible();
  await expect(page.locator(".wl-logo-mark")).toBeVisible();
});

test("identity: Folio tokens, sans UI with a serif display, radii 8/12/pill, light-only card shadow, 150 ms motion, sticky filters and side card", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "screen=collection&mode=light&config=default");
  const s = await page.evaluate(() => {
    const root = document.querySelector('[data-wds="folio"]')!;
    const cs = (sel: string, pseudo?: string) => getComputedStyle(document.querySelector(sel)!, pseudo);
    return {
      bg: getComputedStyle(root).backgroundColor, row: getComputedStyle(root).getPropertyValue("--wl-row-height").trim(),
      motion: getComputedStyle(root).getPropertyValue("--wl-motion").trim(), dur: getComputedStyle(root).getPropertyValue("--wl-dur-base").trim(),
      ui: cs(".wl-entry-meta").fontFamily, h1: cs("h1").fontFamily, h1Weight: cs("h1").fontWeight, h1Tracking: cs("h1").letterSpacing, h1Size: cs("h1").fontSize,
      title: cs(".wl-entry-title").fontFamily, group: cs(".wl-group-title").textTransform,
      control: cs('input[type="search"]').borderTopLeftRadius, chip: cs('[aria-pressed]').borderTopLeftRadius,
      sticky: cs(".wl-folio-filters").position,
    };
  });
  expect(s.bg).toBe("rgb(250, 249, 245)");
  expect(s.row).toBe("56px");
  expect(s.dur).toBe("150ms");
  expect(s.ui).toMatch(/^"?wds-folio-default-dm-sans"?,/);
  expect(s.h1).toMatch(/^"?wds-folio-default-source-serif-4"?,/);
  expect(s.title).toMatch(/^"?wds-folio-default-source-serif-4"?,/);
  expect(s.h1Weight).toBe("600");
  expect(parseFloat(s.h1Tracking)).toBeCloseTo(-0.01 * parseFloat(s.h1Size), 1);
  expect(s.group).toBe("uppercase");
  expect(s.control).toBe("8px");
  expect(s.chip).toBe("999px");
  expect(s.sticky).toBe("sticky");
  await open(page, "screen=article&mode=light&config=default");
  const light = await page.evaluate(() => ({ radius: getComputedStyle(document.querySelector(".wl-facts")!).borderTopLeftRadius,
    shadow: getComputedStyle(document.querySelector(".wl-panel")!).boxShadow, side: getComputedStyle(document.querySelector(".wl-project-side")!).position }));
  expect(light.radius).toBe("12px");
  expect(light.shadow).toContain("rgba(21, 46, 55, 0.06)");
  expect(light.side).toBe("sticky");
  await open(page, "screen=article&mode=dark&config=default");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".wl-panel")!).boxShadow)).toBe("none");
  await page.setViewportSize({ width: 800, height: 900 });
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".wl-project-side")!).position)).toBe("static");
});

test("editorial panel: shipped panel, on-panel and panel-accent defaults in both modes, focus outline inside the panel, default monogram", async ({ page }) => {
  for (const mode of ["light", "dark"]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, `screen=registration&mode=${mode}&config=default`);
    const s = await page.evaluate(() => {
      const aside = document.querySelector(".registration-editorial")!;
      return { bg: getComputedStyle(aside).backgroundColor, ink: getComputedStyle(aside).color, surface: aside.getAttribute("data-surface"),
        eyebrow: getComputedStyle(aside.querySelector(".editorial-eyebrow")!).color,
        art: getComputedStyle(aside.querySelector(".editorial-art")!).borderTopColor, mono: aside.querySelector(".editorial-monogram")!.textContent };
    });
    expect(s).toEqual({ bg: "rgb(21, 46, 55)", ink: "rgb(237, 246, 238)", surface: "dark", eyebrow: "rgb(206, 241, 197)", art: "rgb(206, 241, 197)", mono: "F" });
  }
  // Focus inside the panel uses panel-accent (harness: a link inside the panel).
  await page.goto("/harness/index.html");
  await page.evaluate(() => (window as any).harness.ready);
  await page.evaluate(() => (window as any).harness.mount("a", "slot-a", { mode: "light" }));
  await page.locator("#a-primary").focus(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); // keyboard modality
  await page.locator("#a-panel-link").focus();
  expect(await page.locator("#a-panel-link").evaluate((e) => getComputedStyle(e).outlineColor)).toBe("rgb(206, 241, 197)");
  await page.locator("#a-link").focus(); // outside the panel: the focus role
  expect(await page.locator("#a-link").evaluate((e) => getComputedStyle(e).outlineColor)).toBe("rgb(35, 107, 84)");
});

test("confirmation dialog, backdrop scrim and focus return, light and dark", async ({ page }) => {
  for (const [mode, scrim] of [["light", "rgba(21, 46, 55, 0.45)"], ["dark", "rgba(0, 0, 0, 0.6)"]]) {
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

test("reduced motion: no animation in the root; dialog appears without animation; 150 ms otherwise", async ({ browser }) => {
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
  expect(await p2.locator("dialog[open]").evaluate((d) => [getComputedStyle(d).animationName, getComputedStyle(d).animationDuration])).toEqual(["wds-folio-wl-rise", "0.15s"]);
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

// The parity fixture's form, component sheet, registration frame and overlays rendered with Folio
// only (no frontend modules): axe A/AA and reflow, light and dark. Icon slots stay empty here.
for (const mode of ["light", "dark"])
  test(`${mode}: parity fixture screens are axe A/AA clean and reflow from 320px`, async ({ page }) => {
    for (const screen of ["registration", "form", "components", "overlays"]) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/parity/fixture/index.html?screen=${screen}&mode=${mode}`);
      await expect(page.locator(`[data-wds="folio"][data-mode="${mode}"]`)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await axe(page), screen).toEqual([]);
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await noOverflow(page), `${screen} overflow at ${width}`).toBe(true);
      }
    }
  });
