// Vite config for the examples (demo, test harness, parity pages). They import the BUILT package:
// the package name is aliased to ../dist, so `npm run build` must run first.
// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// examples/vite.config.ts. Changes for Folio: package and stylesheet names; the example configuration
// folder is examples/config (standard template layout) and is served at /design/ by a small middleware;
// test font files come from Folio's declared font packages.
import { defineConfig, type Plugin } from "vite";
import { resolve, extname, normalize } from "node:path";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";

const root = resolve(__dirname);
const dist = resolve(__dirname, "../dist");
const design = resolve(root, "config");
// The example configuration references a local font file. It is copied from the declared
// @fontsource-variable/dm-sans package (OFL-1.1) so that no font binary is committed twice.
const fontDir = resolve(design, "fonts");
mkdirSync(fontDir, { recursive: true });
const pkgFile = (pkg: string, file: string) => resolve(__dirname, `../node_modules/@fontsource-variable/${pkg}/files/${file}`);
for (const [pkg, file, name] of [
  ["dm-sans", "dm-sans-latin-wght-normal.woff2", "example-sans.woff2"],
  // Distinct faces for the font-selection test (tests/config.spec.ts): italic, a visibly different
  // bold face and a Cyrillic subset, from the declared OFL packages.
  ["dm-sans", "dm-sans-latin-wght-italic.woff2", "test-italic.woff2"],
  ["source-serif-4", "source-serif-4-latin-wght-normal.woff2", "test-bold.woff2"],
  ["source-serif-4", "source-serif-4-cyrillic-wght-normal.woff2", "test-cyrillic.woff2"],
]) if (existsSync(pkgFile(pkg, file))) copyFileSync(pkgFile(pkg, file), resolve(fontDir, name));

const TYPES: Record<string, string> = { ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
// Serves examples/config at /design/ (read at each request, so edits show after a reload).
const designFolder = (): Plugin => ({
  name: "folio-design-folder",
  configureServer(server) {
    server.middlewares.use("/design", (req, res, next) => {
      const path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(/^([/\\])+/, "");
      const file = resolve(design, path);
      if (!file.startsWith(design) || !existsSync(file) || !statSync(file).isFile()) return next();
      res.setHeader("Content-Type", TYPES[extname(file)] ?? "application/octet-stream");
      res.end(readFileSync(file));
    });
  },
});

export default defineConfig({
  root,
  publicDir: false,
  plugins: [designFolder()],
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      { find: /^wakolab-design-systems-folio\/folio\.css$/, replacement: resolve(dist, "folio.css") },
      { find: /^wakolab-design-systems-folio$/, replacement: resolve(dist, "index.js") },
      { find: /^parity-sys$/, replacement: resolve(root, "parity/fixture/folio-sys.tsx") },
    ],
  },
  server: { host: "127.0.0.1", port: 5191, strictPort: true, fs: { allow: [resolve(__dirname, "..")] } },
  preview: { host: "127.0.0.1", port: 5191, strictPort: true },
  build: { outDir: resolve(__dirname, "../.example-dist"), emptyOutDir: true,
    rollupOptions: { input: { demo: resolve(root, "demo/index.html"), harness: resolve(root, "harness/index.html"),
      parity: resolve(root, "parity/index.html"), fixture: resolve(root, "parity/fixture/index.html") } } },
});
