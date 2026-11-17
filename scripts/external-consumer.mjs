// External consumer check (standard INDEPENDENCE_CHECK §1–§3 and EXTRACTION_MATRIX S3 at 6dc2a7a).
// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// scripts/external-consumer.mjs. Changes for Folio: names, example configuration path, the font
// assertions (the example configures display), and the panel-role assertion.
// Original code. Steps, all outside this working copy:
//   1. clone the repository (default: this repository's committed HEAD) into an empty temporary folder;
//   2. in the clone: npm ci (runs `prepare`, which builds), npm run check, check-dist, theme-tokens, npm pack;
//   3. two neutral consumer apps (Vite + React 19.2.0, no WakoLab code), one installing the packed
//      tarball and one installing the clone as a Git dependency (git+file:, built by `prepare`);
//   4. each app is built, served and checked in Chromium: default and configured colours per mode,
//      the consumer's own font and logo, the text fallback, no request outside the app.
// Usage: node scripts/external-consumer.mjs [--source <git url or path>] [--ref <branch|commit>] [--keep]
import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const source = arg("--source", here);
const ref = arg("--ref", null);
const keep = process.argv.includes("--keep");
const work = mkdtempSync(join(tmpdir(), "folio-consumer-"));
const sh = (cmd, args, cwd) => { console.log(`$ (${cwd.replace(work, "<tmp>")}) ${cmd} ${args.join(" ")}`); return execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8", env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } }); };
const results = [];
const pass = (name, detail = "") => { results.push(`PASS  ${name}${detail ? " — " + detail : ""}`); console.log(results.at(-1)); };

// 1–2. Isolated clone, install, build and package checks.
const clone = join(work, "folio");
sh("git", ["clone", "--quiet", "--no-local", ...(ref ? ["--branch", ref] : []), source, clone], work);
const head = sh("git", ["rev-parse", "HEAD"], clone).trim();
pass("isolated clone", `${source === here ? "local repository" : source} at ${head}`);
sh("npm", ["ci", "--no-audit", "--no-fund"], clone);
if (!existsSync(join(clone, "dist/index.js")) || !existsSync(join(clone, "dist/folio.css"))) throw new Error("prepare did not build dist/");
pass("npm ci builds through prepare", "dist/index.js and dist/folio.css present");
sh("npm", ["run", "--silent", "check"], clone); pass("type check");
console.log(sh("node", ["scripts/check-dist.mjs"], clone));
console.log(sh("node", ["scripts/theme-tokens.mjs"], clone));
console.log(sh("node", ["scripts/check-artwork.mjs"], clone));
pass("package checks in the clone", "check-dist, theme-tokens, check-artwork");
const tgz = sh("npm", ["pack", "--silent", "--ignore-scripts", "--pack-destination", work], clone).trim().split("\n").at(-1);
const listing = JSON.parse(sh("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], clone))[0].files.map((f) => f.path);
for (const required of ["dist/index.js", "dist/index.d.ts", "dist/folio.css", "config.default.json", "config.schema.json", "THIRD_PARTY_NOTICES.md", "LICENSE"]) if (!listing.includes(required)) throw new Error(`package is missing ${required}`);
if (listing.some((f) => /^(src|examples|tests|scripts)\//.test(f))) throw new Error("package ships sources, examples, tests or scripts");
pass("npm pack", `${tgz}, ${listing.length} files`);

// 3. Neutral consumer apps.
const fontSrc = join(clone, "node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2");
function makeApp(name, dependency) {
  const app = join(work, name);
  mkdirSync(join(app, "src"), { recursive: true });
  writeFileSync(join(app, "package.json"), JSON.stringify({
    name: `neutral-${name}`, private: true, type: "module",
    dependencies: { react: "19.2.0", "react-dom": "19.2.0", "wakolab-design-systems-folio": dependency },
    devDependencies: { vite: "7.3.7" },
  }, null, 2));
  writeFileSync(join(app, "vite.config.js"), `export default { esbuild: { jsx: "automatic" }, server: { port: 0 }, preview: { host: "127.0.0.1" } };\n`);
  writeFileSync(join(app, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Neutral consumer</title>
<style>body{margin:0;font-family:Georgia,serif;background:#fafafa;color:#111}.grid{display:grid;grid-template-columns:1fr 1fr}</style></head>
<body><p id="host">Host page content</p><div class="grid"><div id="a"></div><div id="b"></div></div><script type="module" src="/src/main.jsx"></script></body></html>\n`);
  writeFileSync(join(app, "src/main.jsx"), `import { createRoot } from "react-dom/client";
import { FolioRoot, FolioShell, FolioHeader, LogoSlot, Page, Button, KeyValueList, ModeMenu, RegistrationFrame, EditorialPanel } from "wakolab-design-systems-folio";
import "wakolab-design-systems-folio/folio.css";
const config = await fetch("/design/design-config.json").then((r) => r.json());
function App({ id, mode, cfg }) {
  return (
    <FolioRoot id={"root-" + id} mode={mode} config={cfg} assetBase="/design/">
      <FolioShell header={<FolioHeader logo={<LogoSlot label={"Neutral " + id} href="#" />} tools={<ModeMenu label="Theme" modeLabel="Mode" labels={{ light: "Light", dark: "Dark", system: "System" }} />} />}>
        <Page><h1 id={id + "-title"}>Inventory</h1><Button id={id + "-primary"}>Add item</Button>
          <KeyValueList items={[{ key: "Owner", value: "Team A" }, { key: "Updated", value: "Today" }]} />
          <aside data-surface="dark" className="registration-editorial" id={id + "-panel"}><EditorialPanel label={"Neutral " + id} title="Panel" /></aside></Page>
      </FolioShell>
    </FolioRoot>
  );
}
createRoot(document.getElementById("a")).render(<App id="a" mode="light" cfg={config} />);
createRoot(document.getElementById("b")).render(<App id="b" mode="dark" />);
window.__ready = true;
`);
  mkdirSync(join(app, "public/design/fonts"), { recursive: true });
  cpSync(join(here, "examples/config/logo"), join(app, "public/design/logo"), { recursive: true });
  cpSync(join(here, "examples/config/design-config.json"), join(app, "public/design/design-config.json"));
  cpSync(fontSrc, join(app, "public/design/fonts/example-sans.woff2"));
  sh("npm", ["install", "--no-audit", "--no-fund"], app);
  sh("npx", ["vite", "build", "--logLevel", "warn"], app);
  return app;
}

const require = createRequire(join(clone, "package.json"));
const { chromium } = require("@playwright/test");
const { default: config } = await import(join(here, "examples/config/design-config.json"), { with: { type: "json" } });
const { default: defaults } = await import(join(clone, "config.default.json"), { with: { type: "json" } });

async function serveAndCheck(name, app) {
  const port = 5300 + Math.floor(Math.random() * 500);
  const server = spawn("npx", ["vite", "preview", "--port", String(port), "--strictPort"], { cwd: app, stdio: "ignore", detached: true });
  try {
    const url = `http://127.0.0.1:${port}/`;
    for (let i = 0; i < 100; i++) { try { if ((await fetch(url)).ok) break; } catch { /* starting */ } await new Promise((r) => setTimeout(r, 100)); }
    const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    const page = await browser.newPage();
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.goto(url);
    await page.waitForFunction(() => window.__ready && document.querySelector("#root-b"));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const read = (id, n) => page.evaluate(([i, p]) => getComputedStyle(document.getElementById("root-" + i)).getPropertyValue(p).trim(), [id, n]);
    for (const [role, value] of Object.entries(config.colors.light)) if ((await read("a", `--wl-${role}`)) !== value) throw new Error(`${name}: light ${role}`);
    if ((await read("a", "--wl-danger")) !== defaults.colors.light.danger || (await read("a", "--wl-surface")) !== defaults.colors.light.surface) throw new Error(`${name}: omitted roles`);
    if ((await read("b", "--wl-action")) !== defaults.colors.dark.action) throw new Error(`${name}: unconfigured root`);
    // The example configures the display role only: headings use the consumer's file, while the
    // omitted ui role keeps Folio's default; the unconfigured root keeps both defaults.
    const fam = await page.evaluate(() => getComputedStyle(document.getElementById("a-title")).fontFamily);
    const famUi = await page.evaluate(() => getComputedStyle(document.querySelector("#root-a .wl-home")).fontFamily);
    if (!/^"?wds-folio-default-dm-sans/.test(famUi)) throw new Error(`${name}: omitted ui role changed (${famUi})`);
    if (!/^"?wds-folio-font-[0-9a-f]{8}/.test(fam)) throw new Error(`${name}: configured font not used (${fam})`);
    const famB = await page.evaluate(() => getComputedStyle(document.getElementById("b-title")).fontFamily);
    if (!/^"?wds-folio-default-source-serif-4/.test(famB)) throw new Error(`${name}: default font (${famB})`);
    // Folio panel roles: the example sets panel in light; root b keeps the default.
    const panels = await page.evaluate(() => ["a", "b"].map((i) => getComputedStyle(document.getElementById(i + "-panel")).backgroundColor));
    if (JSON.stringify(panels) !== JSON.stringify(["rgb(44, 29, 20)", "rgb(21, 46, 55)"])) throw new Error(`${name}: panel roles ${panels}`);
    const logo = await page.evaluate(() => [...document.querySelectorAll("#root-a .wl-brand img")].map((i) => [i.getAttribute("src"), i.complete && i.naturalWidth > 0]));
    if (!logo.length || logo.some(([, ok]) => !ok)) throw new Error(`${name}: logo ${JSON.stringify(logo)}`);
    const textB = await page.locator("#root-b .wl-brand").innerText();
    if (!textB.includes("Neutral b")) throw new Error(`${name}: text fallback`);
    const host = await page.evaluate(() => [getComputedStyle(document.body).fontFamily, getComputedStyle(document.body).backgroundColor, getComputedStyle(document.getElementById("host")).color]);
    if (JSON.stringify(host) !== JSON.stringify(["Georgia, serif", "rgb(250, 250, 250)", "rgb(17, 17, 17)"])) throw new Error(`${name}: host changed ${host}`);
    const foreign = requests.filter((u) => !u.startsWith(url));
    if (foreign.length) throw new Error(`${name}: foreign requests ${foreign}`);
    await page.click("#a-primary");
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: join(work, `${name}.png`), fullPage: true });
    await browser.close();
    pass(`consumer (${name})`, `configured colours per mode, omitted roles default, display font ${fam.split(",")[0]}, ui font default, panel roles as configured and default, ${logo.length} logo images, text fallback, host untouched, ${requests.length} requests all same-origin`);
  } finally {
    try { process.kill(-server.pid); } catch { /* already stopped */ }
  }
}

await serveAndCheck("tarball", makeApp("tarball", `file:${join(work, tgz)}`));
await serveAndCheck("git", makeApp("git", `git+file://${clone}#${head}`));

console.log("\n" + results.join("\n"));
console.log(`\nWork folder: ${work}${keep ? "" : " (removed)"}`);
if (!keep) rmSync(work, { recursive: true, force: true });
