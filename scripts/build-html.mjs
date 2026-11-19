// Builds marquee-kit.html: the demo (examples/demo) as one self-contained HTML file that opens from
// file:// with no network request (standard DIRECTIONS §4 and KIT_PROPOSAL §2 at
// 8e3b818ece8dbb57f48a2dc779ee743fe441aba4).
// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at a6b153fbc9a7cd4c879ccf569345c5088680b3f5,
// scripts/build-html.mjs; Folio names → Marquee names (output file, alias, build constant, meta names,
// banner); no other change.
//
//   npm run kit            (builds dist/ first, then this script)
//
// One demo source: the same examples/demo/main.tsx as `npm run example`; only the "marquee-demo-env"
// module differs (env/offline.ts embeds the example configuration and its files). Scripts, styles,
// every default font, the example font and logos are inlined as data: URLs.
//
// Reproducible (KIT_PROPOSAL §2): the output depends only on the committed sources, the lockfile and
// the toolchain (Node 24, the locked Vite). It embeds the source commit (git HEAD) and the standard
// commit, and nothing else that varies: no timestamp, no machine path. The script refuses to run on a
// working tree with uncommitted changes, so that the embedded SHA really is the source; `--allow-dirty`
// builds a preview whose SHA is marked "-dirty" (never committed).
//
// The page also carries a Content-Security-Policy that allows only inline code and data:/blob: URLs,
// so a request outside the file cannot happen even by mistake.
import { build } from "vite";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(root, "marquee-kit.html");
const STANDARD = "8e3b818ece8dbb57f48a2dc779ee743fe441aba4";
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

const dirty = git("status", "--porcelain", "--untracked-files=no", "--", ".", ":(exclude)marquee-kit.html") !== "";
const allowDirty = process.argv.includes("--allow-dirty");
if (dirty && !allowDirty) {
  console.error("build-html: the working tree has uncommitted changes; commit the source first (or pass --allow-dirty for a local preview).");
  process.exit(1);
}
const sha = git("rev-parse", "HEAD") + (dirty ? "-dirty" : "");

const result = await build({
  configFile: false,
  root: resolve(root, "examples/demo"),
  base: "./",
  logLevel: "warn",
  publicDir: false,
  esbuild: { jsx: "automatic", legalComments: "none" },
  define: { __MARQUEE_SOURCE_SHA__: JSON.stringify(sha) },
  resolve: {
    alias: [
      { find: /^wakolab-design-systems-marquee\/marquee\.css$/, replacement: resolve(root, "dist/marquee.css") },
      { find: /^wakolab-design-systems-marquee$/, replacement: resolve(root, "dist/index.js") },
      { find: /^marquee-demo-env$/, replacement: resolve(root, "examples/demo/env/offline.ts") },
    ],
  },
  build: {
    write: false,
    assetsInlineLimit: () => true,
    cssCodeSplit: false,
    modulePreload: false,
    reportCompressedSize: false,
    rollupOptions: { input: resolve(root, "examples/demo/index.html"), output: { inlineDynamicImports: true } },
  },
});

const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output);
const html = outputs.find((o) => o.fileName.endsWith(".html"));
const scripts = outputs.filter((o) => o.type === "chunk");
const styles = outputs.filter((o) => o.type === "asset" && o.fileName.endsWith(".css"));
const others = outputs.filter((o) => o !== html && !scripts.includes(o) && !styles.includes(o));
if (!html || scripts.length !== 1 || styles.length !== 1 || others.length) {
  throw new Error(`build-html: expected one HTML page, one script and one stylesheet, got ${outputs.map((o) => o.fileName).join(", ")}`);
}
const js = scripts[0].code.replace(/<\/script/gi, "<\\/script");
const css = String(styles[0].source).replace(/<\/style/gi, "<\\/style");

let page = String(html.source);
const scriptTag = /<script type="module" crossorigin src="[^"]+"><\/script>\n?/;
const styleTag = /<link rel="stylesheet" crossorigin href="[^"]+">\n?/;
if (!scriptTag.test(page) || !styleTag.test(page)) throw new Error("build-html: unexpected page structure");
page = page.replace(scriptTag, "").replace(styleTag, "");
const csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data: blob:; media-src 'none'; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
const head = [
  `<meta http-equiv="Content-Security-Policy" content="${csp}">`,
  `<meta name="marquee-kit-source" content="${sha}">`,
  `<meta name="marquee-kit-standard" content="${STANDARD}">`,
  `<style>${css}</style>`,
].join("\n");
// Replacer functions: the bundled code contains "$&"-like sequences that string replacements would expand.
page = page.replace("<head>\n", () => `<head>\n${head}\n`).replace("</body>", () => `<script type="module">${js}</script>\n</body>`);
const banner = `<!-- Marquee kit: single offline HTML file. Generated by scripts/build-html.mjs from WakoLab-DesignSystems/wakolab-design-systems-marquee at ${sha} (standard ${STANDARD}). Do not edit: rebuild with \`npm run kit\` from that commit. Licences: see the page's Licences section, THIRD_PARTY_NOTICES.md and licenses/ in the repository. -->`;
if (!page.startsWith("<!doctype html>\n")) throw new Error("build-html: unexpected page start");
page = page.replace("<!doctype html>\n", () => `<!doctype html>\n${banner}\n`);
if (/(?:src|href)=["'](?!data:|blob:|#)[^"']/i.test(page.replace(/<script type="module">[\s\S]*<\/script>/, "").replace(/<style>[\s\S]*?<\/style>/, ""))) {
  throw new Error("build-html: the page still references an external file");
}
const bytes = Buffer.from(page, "utf8");
writeFileSync(OUT, bytes);
console.log(`marquee-kit.html: ${bytes.length} bytes, sha256 ${createHash("sha256").update(bytes).digest("hex")}, source ${sha}`);
