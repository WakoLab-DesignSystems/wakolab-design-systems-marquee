// Icon artwork exclusion check (standard EXTRACTION_MATRIX §10, E4 at 6dc2a7a; review R1 on #5).
// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// scripts/check-artwork.mjs, unchanged (same excluded frontend icons, same hash file).
// Original code. Fails when:
//   1. any tracked text file, or any file of the npm package, contains SVG path data whose hash
//      matches an excluded frontend icon (scripts/excluded-icon-hashes.json holds only hashes);
//   2. the shipped documentation or package contains SVG path data at all (consumers supply icons;
//      the package and its documentation must not carry any).
// The synthetic example logos (examples/public/design/logo/*.svg) are original artwork, are not
// shipped, and are only subject to check 1.
// Usage: node scripts/check-artwork.mjs [--package-dir <dir>]   (default: this repository; the
// package file list comes from `npm pack --dry-run --json --ignore-scripts`, so build first).
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const dir = arg("--package-dir", ".");
const { hashes } = JSON.parse(readFileSync(new URL("./excluded-icon-hashes.json", import.meta.url), "utf8"));
const excluded = new Map(Object.entries(hashes).map(([name, h]) => [h, name]));
const BINARY = /\.(woff2?|ttf|otf|png|jpe?g|gif|webp|ico|tgz)$/i;

const sha = (s) => createHash("sha256").update(s.replace(/\s+/g, " ").trim()).digest("hex");
// Runs of SVG path grammar starting with a moveto. Every suffix that starts with a moveto is also
// hashed, so a copied path is found inside a longer string.
const RUN = /[Mm][0-9MmLlHhVvCcSsQqTtAaZz .,\-]{5,}/g;
function pathRuns(text) {
  const out = [];
  for (const m of text.matchAll(RUN)) {
    const run = m[0];
    for (let i = 0; i < run.length; i++) if (run[i] === "M" || run[i] === "m") {
      const tail = run.slice(i);
      for (let j = tail.length; j > 5; j--) out.push(tail.slice(0, j)); // every prefix: quotes or prose may follow
    }
  }
  return out;
}
// "Looks like path data": a moveto with two numbers followed by at least one more drawing command.
const LOOKS_LIKE_PATH = /[Mm]\s*-?\d*\.?\d+[ ,]-?\d*\.?\d+\s*(?:[LlHhVvCcSsQqTtAaZz]\s*-?\d|[Zz])/;

const tracked = execFileSync("git", ["ls-files"], { cwd: dir, encoding: "utf8" }).split("\n").filter(Boolean);
const packaged = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: dir, encoding: "utf8" }))[0].files.map((f) => f.path);
const DOCS = /^(README\.md|AGENTS\.md|AGENTS-SYNC\.md|CONTRIBUTING\.md|THIRD_PARTY_NOTICES\.md|docs\/.*\.md)$/;

const problems = [];
let scanned = 0;
for (const file of new Set([...tracked, ...packaged])) {
  if (BINARY.test(file) || file === "scripts/excluded-icon-hashes.json" || !existsSync(join(dir, file))) continue;
  const text = readFileSync(join(dir, file), "utf8");
  scanned++;
  const hits = new Set(pathRuns(text).map((run) => excluded.get(sha(run))).filter(Boolean));
  for (const hit of hits) problems.push(`${file}: contains the excluded "${hit}" icon path data`);
  if ((packaged.includes(file) || DOCS.test(file)) && LOOKS_LIKE_PATH.test(text)) {
    const at = text.slice(0, text.search(LOOKS_LIKE_PATH)).split("\n").length;
    problems.push(`${file}:${at}: shipped documentation or package contains SVG path data`);
  }
}
if (problems.length) { console.error("Artwork exclusion check failed:\n" + [...new Set(problems)].join("\n")); process.exit(1); }
console.log(`PASS  icon artwork excluded — ${scanned} text files (${tracked.length} tracked, ${packaged.length} packaged) scanned against ${excluded.size} excluded icon hashes; no SVG path data in documentation or package`);
