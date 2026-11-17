// Visual parity check (standard EXTRACTION_MATRIX §8; KIT_PROPOSAL §8, Folio). Original code, copied from
// WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936, scripts/parity.mjs.
// Changes for Folio: Folio direction in the baselines, Folio candidate URLs (port 5191) and icon hook.
//
// Compares Folio screens of the WakoLab frontend at e492bec9ced8893d6940879aa8186ac75a48a272
// (the baseline) with the same synthetic screens rendered by this package (the candidate), at 360,
// 768, 1024 and 1440 px, light and dark, in the same browser and fonts. Two baseline sources:
//
//  - prototype screens (collection, detail, notFound, message, loading, unavailable, dialog): the
//    frontend's review prototype, served from a read-only checkout
//    (`npm ci && npm run prototype -- --port 5174`, or a static build of vite.prototype.config.ts);
//    candidate: examples/parity (texts in examples/parity/fixtures.ts);
//  - fixture screens (form, components, confirm, registration, overlays): one fixture
//    (examples/parity/fixture) rendered twice, with the frontend's own modules (baseline, built by
//    examples/parity/front-baseline/vite.config.mjs from the checkout and served on :5175) and with
//    the built package (candidate, examples/parity/fixture/folio-sys.tsx).
//
//   npm run build && npx vite --config examples/vite.config.ts &      # candidates on :5191
//   node scripts/parity.mjs --icons <checkout>/web/src/components/ui/icons.tsx [--control]
//
// --icons reads the frontend's icon path data at run time and injects it into the candidate pages
// only for this comparison; nothing from it is written to this repository (E4).
// --control repeats every capture in a second, separate browser launch with the same settings and
// reports baseline-vs-baseline and candidate-vs-candidate differences next to the comparison.
//
// Every differing pixel counts (no tolerance). For each case the script writes (ignored by Git):
// baseline.png, candidate.png, diff.png (every differing pixel in red), side-by-side.png,
// differences.json (each differing pixel with both colours, and clusters with bounding boxes), and
// for each cluster an enlarged crop (baseline | candidate | difference) under parity-output/evidence/,
// with any area covered by an icon <svg> on either side masked in grey (icon artwork stays out of
// shared evidence); masked areas are listed in differences.json.
//
// Capture settings: Chromium from @playwright/test 1.56.1 (or CHROMIUM_PATH), viewport width as
// listed and height 900, device scale factor 1, reduced motion emulated, colour scheme = mode,
// network idle and document.fonts.ready awaited, native <select> controls laid out again after the
// fonts are ready (both sides), 250 ms settle, full-page screenshots with
// animations disabled and the caret hidden.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const BASELINE = arg("--baseline", "http://127.0.0.1:5174/prototype/index.html");
const CANDIDATE = arg("--candidate", "http://127.0.0.1:5191/parity/index.html");
const FIXTURE_BASELINE = arg("--fixture-baseline", "http://127.0.0.1:5175/index.html");
const FIXTURE_CANDIDATE = arg("--fixture-candidate", "http://127.0.0.1:5191/parity/fixture/index.html");
const OUT = arg("--out", "parity-output");
const ICONS = arg("--icons", null);
const CONTROL = process.argv.includes("--control");
const WIDTHS = (arg("--widths", "360,768,1024,1440")).split(",").map(Number);
const MODES = (arg("--modes", "light,dark")).split(",");
const ONLY = arg("--screens", null)?.split(",");

const SCREENS = {
  collection: { baseline: "" },
  detail: { baseline: "&view=project&slug=paperwars" },
  notFound: { baseline: "&view=missing" },
  message: { baseline: "&view=propose" },
  loading: { baseline: "&scenario=loading" },
  unavailable: { baseline: "&scenario=unavailable" },
  dialog: { baseline: "", openDialog: true },
  form: { fixture: true },
  components: { fixture: true },
  confirm: { fixture: true },
  registration: { fixture: true },
  // Review R4-C on #5: an open popover and a visible toast on one screen.
  overlays: { fixture: true, after: () => document.getElementById("fx-pop").click() },
};

function readIcons(file) {
  if (!file) return null;
  const src = readFileSync(file, "utf8");
  const block = /const paths = \{([\s\S]*?)\n\}( as const)?;/.exec(src);
  if (!block) throw new Error(`no icon path table found in ${file}`);
  return Object.fromEntries([...block[1].matchAll(/^\s*(\w+):\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]]));
}
const icons = readIcons(ICONS);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "evidence"), { recursive: true });
const launch = () => chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const browserA = await launch();
const browserB = CONTROL ? await launch() : null;
const version = browserA.version();

function urls(screen, spec, mode) {
  if (spec.fixture) return { baseline: `${FIXTURE_BASELINE}?screen=${screen}&mode=${mode}`, candidate: `${FIXTURE_CANDIDATE}?screen=${screen}&mode=${mode}`, baselineInit: null };
  return {
    baseline: `${BASELINE}?frame=1&lang=en${spec.baseline}`, candidate: `${CANDIDATE}?screen=${screen}&mode=${mode}`,
    baselineInit: { fn: (m) => { localStorage.setItem("wakolab_prototype_appearance_v1", JSON.stringify({ theme: "folio", mode: m })); localStorage.setItem("wakolab_locale", "en"); }, arg: mode },
  };
}
async function capture(browser, { url, mode, width, init, after }) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce", colorScheme: mode });
  if (init) await context.addInitScript(init.fn, init.arg);
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  // Native <select> controls keep the text position computed at their first layout; when that
  // happened before the web font loaded, the text sits 1 px off (observed on both sides, varying
  // with load timing). Lay them out again once fonts are ready, identically on both sides.
  await page.evaluate(() => document.querySelectorAll("select").forEach((s) => { s.style.display = "none"; void s.offsetHeight; s.style.display = ""; }));
  if (after) await page.evaluate(after);
  await page.waitForTimeout(250);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
  // Icon areas in page coordinates (full-page screenshots start at the document origin).
  const iconRects = await page.evaluate(() => [...document.querySelectorAll("svg")].map((s) => s.getBoundingClientRect())
    .filter((r) => r.width && r.height).map((r) => [Math.floor(r.left + scrollX), Math.floor(r.top + scrollY), Math.ceil(r.right + scrollX), Math.ceil(r.bottom + scrollY)]));
  await context.close();
  return { png, iconRects };
}

// Pixel comparison in the browser (no image dependency). Every differing pixel counts.
const diffPage = await (await browserA.newContext({ deviceScaleFactor: 1 })).newPage();
async function compare(a, b, { evidence = false, masks = [] } = {}) {
  return diffPage.evaluate(async ([a64, b64, evidence, masks]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + s; });
    const [A, B] = await Promise.all([load(a64), load(b64)]);
    const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
    const read = (img) => { const c = new OffscreenCanvas(w, h); const x = c.getContext("2d"); x.fillStyle = "#ff00ff"; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
    const pa = read(A), pb = read(B);
    const pixels = []; let maxDelta = 0, over16 = 0;
    for (let p = 0; p < pa.length; p += 4) {
      const d = Math.max(Math.abs(pa[p] - pb[p]), Math.abs(pa[p + 1] - pb[p + 1]), Math.abs(pa[p + 2] - pb[p + 2]));
      if (!d) continue;
      const i = p / 4;
      pixels.push([i % w, (i - (i % w)) / w, d, [pa[p], pa[p + 1], pa[p + 2]], [pb[p], pb[p + 1], pb[p + 2]]]);
      if (d > maxDelta) maxDelta = d; if (d > 16) over16++;
    }
    const result = { sizeA: [A.width, A.height], sizeB: [B.width, B.height], exact: pixels.length, over16, maxDelta };
    if (!evidence) return result;
    // Clusters: differing pixels within 12 px of each other.
    const clusters = [];
    for (const [x, y, d] of pixels) {
      let c = clusters.find((k) => x >= k.box[0] - 12 && x <= k.box[2] + 12 && y >= k.box[1] - 12 && y <= k.box[3] + 12);
      if (!c) { c = { box: [x, y, x, y], count: 0, maxDelta: 0 }; clusters.push(c); }
      c.box = [Math.min(c.box[0], x), Math.min(c.box[1], y), Math.max(c.box[2], x), Math.max(c.box[3], y)]; c.count++; c.maxDelta = Math.max(c.maxDelta, d);
    }
    const toB64 = async (c) => { const blob = await c.convertToBlob({ type: "image/png" }); const buf = new Uint8Array(await blob.arrayBuffer()); let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000)); return btoa(s); };
    const diff = new OffscreenCanvas(w, h), dx = diff.getContext("2d");
    dx.globalAlpha = 0.25; dx.drawImage(A, 0, 0); dx.globalAlpha = 1; dx.fillStyle = "#e60000";
    for (const [x, y] of pixels) dx.fillRect(x, y, 1, 1);
    const side = new OffscreenCanvas(w * 3 + 32, h), sx = side.getContext("2d");
    sx.fillStyle = "#808080"; sx.fillRect(0, 0, side.width, h);
    sx.drawImage(A, 0, 0); sx.drawImage(B, w + 16, 0); sx.drawImage(diff, 2 * w + 32, 0);
    const crops = [];
    const Z = 8;
    for (const c of clusters.slice(0, 12)) {
      const x0 = Math.max(0, c.box[0] - 6), y0 = Math.max(0, c.box[1] - 6), x1 = Math.min(w, c.box[2] + 7), y1 = Math.min(h, c.box[3] + 7);
      const cw = x1 - x0, ch = y1 - y0;
      const out = new OffscreenCanvas(cw * Z * 3 + 2 * Z, ch * Z), ox = out.getContext("2d");
      ox.imageSmoothingEnabled = false; ox.fillStyle = "#808080"; ox.fillRect(0, 0, out.width, out.height);
      [A, B, diff].forEach((img, k) => ox.drawImage(img, x0, y0, cw, ch, k * (cw * Z + Z), 0, cw * Z, ch * Z));
      const masked = [];
      for (const m of masks) {
        const mx0 = Math.max(x0, m[0]), my0 = Math.max(y0, m[1]), mx1 = Math.min(x1, m[2]), my1 = Math.min(y1, m[3]);
        if (mx0 >= mx1 || my0 >= my1) continue;
        masked.push([mx0, my0, mx1, my1]);
        for (let k = 0; k < 3; k++) { ox.fillStyle = "#9a9a9a"; ox.fillRect(k * (cw * Z + Z) + (mx0 - x0) * Z, (my0 - y0) * Z, (mx1 - mx0) * Z, (my1 - my0) * Z); }
      }
      crops.push({ region: [x0, y0, x1, y1], masked, png: await toB64(out) });
    }
    return { ...result, clusters, pixels: pixels.slice(0, 2000), diff: await toB64(diff), side: await toB64(side), crops };
  }, [a.toString("base64"), b.toString("base64"), evidence, masks]);
}

const rows = [];
for (const [screen, spec] of Object.entries(SCREENS)) {
  if (ONLY && !ONLY.includes(screen)) continue;
  for (const mode of MODES) for (const width of WIDTHS) {
    const name = `${screen}-${mode}-${width}`;
    const dir = join(OUT, name); mkdirSync(dir, { recursive: true });
    const u = urls(screen, spec, mode);
    const candInit = icons ? { fn: (set) => { window.__FOLIO_ICONS__ = set; }, arg: icons } : null;
    const after = spec.openDialog ? () => { const d = document.querySelector("dialog.wl-dialog"); d.showModal(); d.querySelector("[data-autofocus]")?.focus(); } : spec.after ?? null;
    const base = await capture(browserA, { url: u.baseline, mode, width, init: u.baselineInit, after });
    // spec.after (an interaction such as opening a popover) applies to both sides; the prototype
    // dialog is opened by script on the baseline only, since the candidate renders it open.
    const candAfter = spec.openDialog ? null : spec.after ?? null;
    const cand = await capture(browserA, { url: u.candidate, mode, width, init: candInit, after: candAfter });
    const r = await compare(base.png, cand.png, { evidence: true, masks: [...base.iconRects, ...cand.iconRects] });
    for (const [file, data] of [["baseline.png", base.png], ["candidate.png", cand.png], ["diff.png", Buffer.from(r.diff, "base64")], ["side-by-side.png", Buffer.from(r.side, "base64")]]) writeFileSync(join(dir, file), data);
    r.crops.forEach((c, i) => writeFileSync(join(OUT, "evidence", `${name}-cluster${i + 1}.png`), Buffer.from(c.png, "base64")));
    writeFileSync(join(dir, "differences.json"), JSON.stringify({ case: name, exact: r.exact, maxChannelDelta: r.maxDelta, clusters: r.clusters,
      crops: r.crops.map((c, i) => ({ file: `evidence/${name}-cluster${i + 1}.png`, region: c.region, maskedIconAreas: c.masked })),
      pixels: r.pixels.map(([x, y, d, a, b]) => ({ x, y, delta: d, baseline: a, candidate: b })) }, null, 1) + "\n");
    const row = { screen, mode, width, source: spec.fixture ? "fixture" : "prototype", baselineSize: r.sizeA, candidateSize: r.sizeB, differentExact: r.exact, differentOver16: r.over16, maxChannelDelta: r.maxDelta, clusters: r.clusters };
    if (browserB) {
      const base2 = await capture(browserB, { url: u.baseline, mode, width, init: u.baselineInit, after });
      const cand2 = await capture(browserB, { url: u.candidate, mode, width, init: candInit, after: candAfter });
      const bb = await compare(base.png, base2.png), cc = await compare(cand.png, cand2.png), bc2 = await compare(base2.png, cand2.png);
      Object.assign(row, { controlBaseline: bb.exact, controlCandidate: cc.exact, secondLaunch: bc2.exact, secondLaunchMaxDelta: bc2.maxDelta });
    }
    rows.push(row);
    console.log(`${name.padEnd(28)} ${r.sizeA.join("×").padEnd(10)} vs ${r.sizeB.join("×").padEnd(10)} exact ${String(r.exact).padStart(6)}  max delta ${String(r.maxDelta).padStart(3)}  clusters ${r.clusters.length}` +
      (browserB ? `  | control base/base ${row.controlBaseline}, cand/cand ${row.controlCandidate}, 2nd launch base/cand ${row.secondLaunch}` : ""));
  }
}
await browserA.close(); await browserB?.close();

const settings = { prototypeBaseline: BASELINE, prototypeCandidate: CANDIDATE, fixtureBaseline: FIXTURE_BASELINE, fixtureCandidate: FIXTURE_CANDIDATE, browser: `Chromium ${version}`, playwright: "1.56.1", viewportHeight: 900, deviceScaleFactor: 1, reducedMotion: "reduce", fullPage: true, animations: "disabled", control: CONTROL ? "second browser launch, same settings" : "off", icons: icons ? `injected into candidates at run time from the frontend checkout (${Object.keys(icons).length} names)` : "not injected" };
writeFileSync(join(OUT, "report.json"), JSON.stringify({ settings, rows }, null, 2) + "\n");
const md = [`# Visual parity report`, "", "```json", JSON.stringify(settings, null, 2), "```", "",
  `| Screen | Mode | Width | Sizes | Differing pixels | Max delta | Clusters (x0,y0–x1,y1: pixels)${CONTROL ? " | Base vs base | Cand vs cand | 2nd launch |" : " |"}`,
  `|---|---|---|---|---|---|---|${CONTROL ? "---|---|---|" : ""}`,
  ...rows.map((r) => `| ${r.screen} | ${r.mode} | ${r.width} | ${r.baselineSize.join("×")}${r.baselineSize.join() === r.candidateSize.join() ? "" : " vs " + r.candidateSize.join("×")} | ${r.differentExact} | ${r.maxChannelDelta} | ${r.clusters.map((c) => `${c.box[0]},${c.box[1]}–${c.box[2]},${c.box[3]}: ${c.count}`).join("; ")} |` +
    (CONTROL ? ` ${r.controlBaseline} | ${r.controlCandidate} | ${r.secondLaunch} |` : ""))].join("\n");
writeFileSync(join(OUT, "report.md"), md + "\n");
const failing = rows.filter((r) => r.differentExact > 0 || r.baselineSize.join() !== r.candidateSize.join());
console.log(`\n${rows.length} comparisons, ${rows.length - failing.length} identical, ${failing.length} with differences. Report: ${join(OUT, "report.md")}`);
process.exitCode = failing.length ? 1 : 0;
