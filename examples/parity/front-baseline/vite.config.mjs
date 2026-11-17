// Builds the BASELINE side of the parity fixture from a separate, read-only checkout of
// Copied from wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936
// (examples/parity/front-baseline/vite.config.mjs), unchanged; the Folio direction comes from fixture/index.html.
// WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272. Nothing is written into that
// checkout: the build output and a two-line stylesheet go to the given output folder.
//   FRONT=<checkout> OUT=<folder> node <FRONT>/node_modules/vite/bin/vite.js build --config examples/parity/front-baseline/vite.config.mjs
// The checkout must have its own dependencies installed (`npm ci` there). Original code.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FRONT = resolve(process.env.FRONT ?? "");
const OUT = resolve(process.env.OUT ?? "");
if (!process.env.FRONT || !process.env.OUT) throw new Error("set FRONT (frontend checkout) and OUT (output folder)");
const here = dirname(fileURLToPath(import.meta.url));
const frontRequire = createRequire(join(FRONT, "package.json"));
const tailwindcss = (await import(frontRequire.resolve("@tailwindcss/vite"))).default;
mkdirSync(OUT, { recursive: true });
const css = join(OUT, "front-style.css");
writeFileSync(css, `@import ${JSON.stringify(join(FRONT, "web/src/style.css"))};\n@source ${JSON.stringify(join(FRONT, "web/src"))};\n`);
const mod = (name) => dirname(frontRequire.resolve(`${name}/package.json`));

export default {
  root: resolve(here, "../fixture"),
  base: "./",
  configFile: false,
  plugins: [tailwindcss()],
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      { find: /^parity-sys$/, replacement: join(here, "front-sys.tsx") },
      { find: /^parity-front-css$/, replacement: css },
      { find: /^@front\//, replacement: join(FRONT, "web/src") + "/" },
      { find: /^react-dom(\/.*)?$/, replacement: mod("react-dom") + "$1" },
      { find: /^react(\/.*)?$/, replacement: mod("react") + "$1" },
    ],
  },
  build: { outDir: join(OUT, "site"), emptyOutDir: true },
  logLevel: "warn",
};
