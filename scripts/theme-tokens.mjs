// Contrast check of Folio's SHIPPED DEFAULTS only (consumer configurations are never checked).
// Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272, scripts/theme-tokens.mjs.
// Changes for standalone use: Folio palettes only (src/styles/tokens.css), with the Folio-declared panel pairs; the agent pairs are
// dropped (product roles); no tokens.json export (config.default.json holds the defaults and is
// checked against the stylesheet here); values that are var() references are skipped as pairs.
// Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
// scripts/theme-tokens.mjs; Folio root selector, panel pairs added, comments stripped from blocks.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const css = readFileSync("src/styles/tokens.css", "utf8");
const tokens = {};
for (const match of css.matchAll(/\[data-wds="folio"\]\[data-mode="(\w+)"\]\s*\{([^}]*)\}/g))
  tokens[match[1]] = Object.fromEntries([...match[2].replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/--wl-([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
assert.deepEqual(Object.keys(tokens).sort(), ["dark", "light"], "light and dark palettes");
const defaults = JSON.parse(readFileSync("config.default.json", "utf8"));
for (const mode of ["light", "dark"])
  for (const [role, value] of Object.entries(defaults.colors[mode])) assert.equal(tokens[mode][role], value, `config.default.json ${mode}.${role} matches tokens.css`);
const luminance = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const pairs = [
  ["ink", "bg", 4.5], ["ink", "surface", 4.5], ["ink", "surface-2", 4.5],
  ["muted", "bg", 4.5], ["muted", "surface", 4.5], ["muted", "surface-2", 4.5],
  ["on-action", "action", 4.5], ["on-action", "action-hover", 4.5],
  ["action", "surface", 4.5], ["action", "bg", 4.5],
  ["control", "surface", 3], ["control", "bg", 3], ["focus", "surface", 3], ["focus", "bg", 3],
  ["danger", "surface", 4.5], ["on-danger", "danger", 4.5], ["link", "bg", 4.5], ["link", "surface", 4.5],
  ["warning", "surface", 4.5], ["success", "surface", 4.5],
  ...["danger", "success", "warning", "info"].map((t) => [t, `${t}-soft`, 4.5]),
  // Folio editorial panel (declared roles): text, eyebrow text and focus outline on the panel.
  ["on-panel", "panel", 4.5], ["panel-accent", "panel", 4.5],
];
let count = 0;
for (const [mode, values] of Object.entries(tokens)) {
  assert.deepEqual(Object.keys(values).sort(), Object.keys(tokens.light).sort(), `${mode} token completeness`);
  for (const [fg, bg, min] of pairs) {
    assert.match(values[fg], /^#[a-f0-9]{6}$/i); assert.match(values[bg], /^#[a-f0-9]{6}$/i);
    const [a, b] = [luminance(values[fg]), luminance(values[bg])].sort((x, y) => y - x);
    assert.ok((a + 0.05) / (b + 0.05) >= min, `${mode} ${fg}/${bg} below ${min}`);
    count++;
  }
}
console.log(`Shipped defaults: light and dark palettes complete, config.default.json matches, ${count} contrast pairs pass.`);
