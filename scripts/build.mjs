// Builds the Folio package (standard EXTRACTION_MATRIX §4, §9; KIT_PROPOSAL §8 at c2ca848).
// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at
// 018fe3214e0a118162d202c2f39f1236f37b1936, scripts/build.mjs. Changes for Folio: root selector
// [data-wds="folio"], prefix wds-folio-, Folio's default font packages, entry and output folio.css.
//   dist/index.js       ESM, React external          (Vite library mode)
//   dist/*.d.ts         type declarations             (tsc)
//   dist/folio.css    prebuilt, scoped stylesheet   (Tailwind CSS 4.1.16 + the scoping below)
//   dist/fonts/*        default font files            (copied from the declared @fontsource-variable packages)
//   dist/css-audit.json global-symbol audit of dist/folio.css
// Scoping: every selector is prefixed with the Folio root [data-wds="folio"]; :root, :host, html
// and body map to the root itself; cascade layers, @keyframes and @property names (with every
// reference) carry the wds-folio- prefix. Original code.
import { build } from "vite";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import selectorParser from "postcss-selector-parser";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ROOT = '[data-wds="folio"]';
const PREFIX = "wds-folio-";
const require = createRequire(import.meta.url);

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "fonts"), { recursive: true });

// 1. JavaScript
await build({
  root, logLevel: "warn", configFile: false,
  esbuild: { jsx: "automatic" },
  build: {
    outDir: dist, emptyOutDir: false, sourcemap: true, minify: false,
    lib: { entry: join(root, "src/index.ts"), formats: ["es"], fileName: () => "index.js" },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"] },
  },
});
// 2. Types
execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"), "-p", join(root, "tsconfig.build.json")], { stdio: "inherit" });

// 3. Default fonts: one internal family per default face package (all its faces and subsets).
const FONTS = [
  ["@fontsource-variable/dm-sans", "wds-folio-default-dm-sans"],
  ["@fontsource-variable/source-serif-4", "wds-folio-default-source-serif-4"],
  ["@fontsource-variable/noto-sans-sc", "wds-folio-default-noto-sans-sc"],
  ["@fontsource-variable/noto-sans-devanagari", "wds-folio-default-noto-sans-devanagari"],
];
let fontCss = "/* Default fonts (SIL Open Font License 1.1, see THIRD_PARTY_NOTICES.md), aliased to internal families. */\n";
for (const [pkg, family] of FONTS) {
  const dir = dirname(require.resolve(`${pkg}/package.json`));
  const version = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version;
  const css = readFileSync(join(dir, "index.css"), "utf8");
  const parsed = postcss.parse(css);
  parsed.walkAtRules("font-face", (rule) => {
    rule.walkDecls("font-family", (d) => { d.value = `"${family}"`; });
    rule.walkDecls("src", (d) => {
      d.value = d.value.replace(/url\(\.\/files\/([^)]+)\)/g, (_, file) => { copyFileSync(join(dir, "files", file), join(dist, "fonts", file)); return `url(./fonts/${file})`; });
    });
  });
  fontCss += `/* ${pkg}@${version} */\n` + parsed.toString() + "\n";
}

// 4. Stylesheet: Tailwind, then scoping.
const entry = join(root, "src/styles/folio.css");
const compiled = await postcss([tailwind({ base: join(root, "src"), optimize: false })]).process(readFileSync(entry, "utf8"), { from: entry });

const keyframes = new Set();
const properties = new Set();
compiled.root.walkAtRules((at) => {
  if (/^(-webkit-)?keyframes$/.test(at.name)) keyframes.add(at.params.trim());
  if (at.name === "property") properties.add(at.params.trim());
});
const renameKeyframe = (name) => (name.startsWith(PREFIX) ? name : PREFIX + name);
const renameProperty = (name) => "--" + PREFIX + name.slice(2);

const ROOT_NODE = selectorParser().astSync(ROOT).first.first;
const rootNode = () => ROOT_NODE.clone();
function scopeSelector(sel) {
  return selectorParser((selectors) => {
    selectors.each((s) => {
      const text = s.toString().trim();
      if (text.startsWith(ROOT)) return;
      const firstNode = s.first;
      // :root / :host / html / body → the Folio root itself
      if (firstNode && ((firstNode.type === "pseudo" && (firstNode.value === ":root" || firstNode.value === ":host")) || (firstNode.type === "tag" && (firstNode.value === "html" || firstNode.value === "body")))) {
        firstNode.replaceWith(rootNode());
        return;
      }
      s.prepend(selectorParser.combinator({ value: " " }));
      s.prepend(rootNode());
    });
  }).processSync(sel);
}

compiled.root.walkRules((rule) => {
  const parent = rule.parent;
  if (parent?.type === "atrule" && /keyframes$/.test(parent.name)) return;
  rule.selector = scopeSelector(rule.selector);
});
compiled.root.walkAtRules((at) => {
  if (/keyframes$/.test(at.name)) at.params = renameKeyframe(at.params.trim());
  if (at.name === "property") at.params = renameProperty(at.params.trim());
  if (at.name === "layer") at.params = at.params.split(",").map((n) => PREFIX + n.trim()).join(", ");
});
const kfRe = keyframes.size ? new RegExp(`(?<![\\w-])(${[...keyframes].map((k) => k.replace(/[-]/g, "\\-")).join("|")})(?![\\w-])`, "g") : null;
const propRe = properties.size ? new RegExp(`(?<![\\w-])(${[...properties].map((p) => p.replace(/[-]/g, "\\-")).join("|")})(?![\\w-])`, "g") : null;
compiled.root.walkDecls((d) => {
  if (kfRe && (/^(-webkit-)?animation(-name)?$/.test(d.prop) || d.prop.startsWith("--animate"))) d.value = d.value.replace(kfRe, (m) => renameKeyframe(m));
  if (propRe) {
    if (properties.has(d.prop)) d.prop = renameProperty(d.prop);
    d.value = d.value.replace(propRe, (m) => renameProperty(m));
  }
});

const header = `/* Folio design system — prebuilt, scoped stylesheet. Generated by scripts/build.mjs; do not edit.
 * Sources: src/styles/*.css (provenance in each file). Third-party notices: THIRD_PARTY_NOTICES.md. */\n`;
const css = header + fontCss + compiled.root.toString();
writeFileSync(join(dist, "folio.css"), css);

// 5. Audit of names CSS keeps global.
const audit = { root: ROOT, prefix: PREFIX, layers: [], keyframes: [], properties: [], fontFaces: [], other: [], unscopedSelectors: [] };
const out = postcss.parse(css);
out.walkAtRules((at) => {
  if (at.name === "layer") audit.layers.push(...at.params.split(",").map((s) => s.trim()));
  if (/keyframes$/.test(at.name)) audit.keyframes.push(at.params);
  if (at.name === "property") audit.properties.push(at.params);
  if (at.name === "font-face") at.walkDecls("font-family", (d) => audit.fontFaces.push(d.value.replace(/"/g, "")));
  if (["counter-style", "font-palette-values", "position-try"].includes(at.name)) audit.other.push(`@${at.name} ${at.params}`);
});
out.walkDecls("view-transition-name", (d) => audit.other.push(`view-transition-name: ${d.value}`));
out.walkRules((r) => {
  if (r.parent?.type === "atrule" && /keyframes$/.test(r.parent.name)) return;
  for (const s of r.selectors) if (!s.trim().startsWith(ROOT)) audit.unscopedSelectors.push(s);
});
for (const k of ["layers", "keyframes", "properties", "fontFaces"]) audit[k] = [...new Set(audit[k])].sort();
writeFileSync(join(dist, "css-audit.json"), JSON.stringify(audit, null, 2) + "\n");
const bad = [...audit.layers, ...audit.keyframes, ...audit.properties.map((p) => p.slice(2)), ...audit.fontFaces].filter((n) => !n.startsWith(PREFIX));
console.log(`folio.css: ${css.length} bytes; layers ${audit.layers.length}, keyframes ${audit.keyframes.length}, @property ${audit.properties.length}, font families ${audit.fontFaces.length}, unscoped selectors ${audit.unscopedSelectors.length}, unprefixed global names ${bad.length}`);
if (bad.length || audit.unscopedSelectors.length || audit.other.length) { console.error("Scoping audit failed", { bad, unscoped: audit.unscopedSelectors.slice(0, 10), other: audit.other }); process.exit(1); }
