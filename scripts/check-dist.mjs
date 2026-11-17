// Closure and independence checks on the built package (standard INDEPENDENCE_CHECK §2 at 6dc2a7a).
// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// scripts/check-dist.mjs; Folio file names, root and prefix.
// Original code. Run after `npm run build`.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const results = [];
const ok = (name, detail = "") => results.push(`PASS  ${name}${detail ? " — " + detail : ""}`);

// 1. No inter-repository dependency.
assert.ok(!existsSync(".gitmodules"), "no .gitmodules");
const manifests = ["package.json", ...(existsSync("package-lock.json") ? ["package-lock.json"] : [])];
for (const f of manifests) {
  const text = readFileSync(f, "utf8");
  assert.ok(!/github\.com[/:]WakoLab(-DesignSystems)?\//i.test(text), `${f}: no WakoLab Git URL`);
  assert.ok(!/"(file|link|workspace):/i.test(text) && !/"\.\.\//.test(text), `${f}: no file:, link:, workspace: or ../ reference`);
}
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
assert.ok(!pkg.workspaces, "no workspaces");
ok("no inter-repository dependency", manifests.join(", "));

// 2. Declared dependencies: dist/index.js imports only React and itself.
const js = readFileSync("dist/index.js", "utf8");
const imports = [...js.matchAll(/^\s*import\s[^"']*["']([^"']+)["']/gm), ...js.matchAll(/^\s*export\s[^"']*from\s*["']([^"']+)["']/gm)].map((m) => m[1]);
const allowed = new Set(["react", "react-dom", "react/jsx-runtime"]);
const extra = imports.filter((s) => !allowed.has(s) && !s.startsWith("./"));
assert.deepEqual(extra, [], "dist/index.js imports only react, react-dom, react/jsx-runtime");
ok("declared dependencies", `imports: ${[...new Set(imports)].join(", ")}`);

// 3. Stylesheet: no @import; every font url exists in dist/fonts.
const css = readFileSync("dist/folio.css", "utf8");
assert.ok(!/@import/.test(css), "no @import in dist/folio.css");
const urls = [...css.matchAll(/url\(\.\/fonts\/([^)]+)\)/g)].map((m) => m[1]);
for (const u of urls) assert.ok(existsSync(join("dist/fonts", u)), `font file ${u}`);
ok("stylesheet self-contained", `${urls.length} font files referenced and present`);

// 4. Scoped CSS and global symbols (from the build audit).
const audit = JSON.parse(readFileSync("dist/css-audit.json", "utf8"));
assert.equal(audit.unscopedSelectors.length, 0, "every selector starts with the Folio root");
for (const n of [...audit.layers, ...audit.keyframes, ...audit.properties.map((p) => p.slice(2)), ...audit.fontFaces]) assert.ok(n.startsWith("wds-folio-"), `global name ${n}`);
assert.deepEqual(audit.other, [], "no other global symbol");
assert.ok(!/(^|[\s,}])(:root|html|body)\s*[{,]/m.test(css.replace(/\/\*[\s\S]*?\*\//g, "")), "no rule targets :root, html or body");
ok("scoped CSS and prefixed global names", `layers ${audit.layers.length}, keyframes ${audit.keyframes.length}, @property ${audit.properties.length}, font families ${audit.fontFaces.length}`);

// 5. Closed styling: every class used in src/**/*.tsx is defined in dist/folio.css.
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".tsx")) files.push(p); } })("src");
const escape = (c) => c.replace(/[^a-zA-Z0-9_-]/g, (ch) => "\\" + ch).replace(/^(\d)/, "\\3$1 ");
// Hook classes with no rule of their own. All but wl-logo-mark (new, styled through
// `.wl-brand--logo img`) also have no rule in the source stylesheets at wakolab-front e492bec.
// Folio adds wl-mine-entry (no rule anywhere in the source), registration-page and page-heading (rules
// only in the source's Console and Marquee blocks, not copied).
const HOOKS = new Set(["wl-empty", "wl-search", "wl-chip", "wl-tabs", "wl-popover", "wl-project", "wl-wide-page", "wl-logo-mark",
  "wl-mine-entry", "registration-page", "page-heading"]);
const missing = new Set();
let used = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    const text = (m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, (expr) => " " + [...expr.matchAll(/"([^"]*)"/g)].filter((x) => !/[=!]==\s*$/.test(expr.slice(0, x.index))).map((x) => x[1]).join(" ") + " ");
    for (const cls of text.split(/\s+/).filter(Boolean)) {
      used++;
      if (HOOKS.has(cls)) continue;
      if (!css.includes("." + escape(cls))) missing.add(`${cls} (${f})`);
    }
  }
}
assert.deepEqual([...missing], [], "every class used by the components is defined in dist/folio.css");
ok("closed styling", `${used} class uses in ${files.length} files; ${HOOKS.size} hook classes without rules of their own`);

// 6. ESM import order: importing ConfirmDialog alone works.
const mod = await import(new URL("../dist/index.js", import.meta.url));
assert.equal(typeof mod.ConfirmDialog, "function"); assert.equal(typeof mod.FolioRoot, "function");
ok("ESM order", "ConfirmDialog and FolioRoot import from dist/index.js");

// 7. Configuration files.
const def = JSON.parse(readFileSync("config.default.json", "utf8"));
assert.equal(def.system, "folio"); assert.ok(JSON.parse(readFileSync("config.schema.json", "utf8")).properties.colors);
ok("configuration files", "config.default.json and config.schema.json present");

console.log(results.join("\n"));
