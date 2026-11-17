// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at 0856c723bcf1047b61b093b9bf92d36d71f7a402, scripts/check-schema.mjs; Folio names → Marquee names (Marquee adaptations noted where they apply).
// Structural contract of config.schema.json (standard CONFIGURATION §1 and §3 at c2ca848; review F-R1 on #5).
// Original code. Validates the shipped defaults and the example, then positive and negative font
// declarations with JSON Schema draft 2020-12 (ajv). Only structure is checked; no value is judged.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";

const schema = JSON.parse(readFileSync("config.schema.json", "utf8"));
const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
const json = (f) => JSON.parse(readFileSync(f, "utf8"));
const base = { system: "marquee", systemVersion: "0.1.0" };
const ok = (name, doc) => { assert.ok(validate(doc), `${name} should be valid: ${JSON.stringify(validate.errors)}`); };
const bad = (name, doc) => { assert.ok(!validate(doc), `${name} should be rejected`); };

ok("config.default.json", json("config.default.json"));
ok("examples/config/design-config.json", json("examples/config/design-config.json"));
ok("fonts omitted", { ...base });
ok("family only (installed or host-loaded font)", { ...base, fonts: { ui: { family: "Example Sans" } } });
ok("family with one file", { ...base, fonts: { display: { family: "Example Serif", files: [{ src: "fonts/x.woff2" }] } } });
ok("one-character family", { ...base, fonts: { ui: { family: "X" } } });
ok("link independent of action, configurable shadows", { ...base, colors: { light: { action: "#000", link: "#111", "shadow-card": "none", "shadow-pop": "0 1px 2px red" } } });
bad("missing family", { ...base, fonts: { ui: { files: [{ src: "fonts/x.woff2" }] } } });
bad("empty family", { ...base, fonts: { ui: { family: "" } } });
bad("empty files", { ...base, fonts: { ui: { family: "Example", files: [] } } });
bad("file without src", { ...base, fonts: { ui: { family: "Example", files: [{}] } } });
bad("Folio panel role (not a Marquee role)", { ...base, colors: { light: { panel: "#000" } } });
console.log("PASS  configuration schema — defaults and example valid; 5 positive and 5 negative font/role cases as specified");
