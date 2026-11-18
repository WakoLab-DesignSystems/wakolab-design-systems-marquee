# Agent instructions

These instructions are sufficient to work in this repository **without cloning any other repository**.

## Scope

This repository is the **Marquee** design system. It must stay **autonomous**: everything needed to build, test and use Marquee lives here. Do not add a dependency, submodule, script, path or instruction that requires another WakoLab or WakoLab-DesignSystems repository. If a component already exists elsewhere, copy it here and record its provenance (repository, path, commit) in the file or in a notice. Third-party packages are allowed and must be declared explicitly.

## Before you change anything

1. Read [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS-SYNC.md](AGENTS-SYNC.md).
2. Inspect the current branch, open pull requests and the issue you work on. Preserve other people's work.
3. For each issue, create a dedicated branch from the current `dev` and open a pull request against `dev`; do not merge, tag, release or change repository settings unless the issue explicitly authorizes it.

## Working rules

- **Configuration model.** Consumers set explicit light and dark colour values per role and reference their own font and logo files. Apply values exactly as written; omitted keys keep Marquee's defaults. Do not add colour derivation, contrast warnings, rejection or approval of consumer choices.
- **Defaults are verified.** Accessibility and contrast checks apply to Marquee's shipped defaults and examples.
- **Identity.** Keep Marquee's defaults recognisable (a bold, expressive system: sans interface type with a heavy display face, 56px minimum rows, large radii, card shadows and 180ms motion with a small hover lift); do not police what consumers change.
- **Product logic stays out.** No API calls, authentication, catalog or application routes; examples use synthetic data.
- The [standard repository](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard) gives general directions. Linking to it is fine; depending on it is not.
- Keep provenance for copied code and assets, and keep third-party licences and notices. The repository's MIT licence does not relicense them.
- Distinguish verified facts, proposals and decisions. Never claim a check, release or behaviour you did not observe.
- Documentation, code comments and issues are in English.
- No secrets, personal data or private conversation content in commits or logs.

## Using Marquee in another project (agents)

1. Add the package from a clone or a pinned Git commit (see [README.md](README.md#independent-use)); do not copy files out of `src/`.
2. Import `wakolab-design-systems-marquee/marquee.css` once and render every Marquee screen inside `MarqueeRoot`. Do not style `html` or `body` for Marquee, and do not target Marquee's internal classes from the host.
3. Put the consumer's choices in a `design-config.json` (explicit colours per mode, including `link`, `focus`, `shadow-card` and `shadow-pop` if wanted, and the consumer's own font and logo files) and pass it as `config`, with `assetBase` for relative paths. Do not compute colours from other colours and do not "fix" values the consumer chose. Marquee declares no system-specific roles.
4. Supply icon paths through `MarqueeRoot icons` from a source whose licence the consumer has confirmed. Marquee ships none.
5. Product logic (data loading, routes, authentication, i18n) stays in the consuming app; pass texts and data as props and slots.
6. Start from the demo (`examples/demo`), the design rules (`docs/rules/`) and `design-system.json`.

## Working on the extracted code

- Files copied or adapted from the WakoLab frontend, Folio or Console start with their sources (repository, path, commit) and changes; keep these headers accurate and update [docs/PROVENANCE.md](docs/PROVENANCE.md) when you change the mapping.
- Run `npm run build`, `npm run check` and `npm test` before proposing a change; run `npm run consumer` when packaging, dependencies or exports change, and `npm run parity` (with the frontend baselines) when visible output changes. No pixel tolerance is granted, and no exception accepted for Console or Folio applies to Marquee.
- Do not add icon artwork until its provenance and licence are settled in an issue.
- `marquee-kit.html` is generated: never edit it. When the demo or the package changes, commit the source, then run `npm run kit` and commit the regenerated file alone (two commits; no amend or force-push). In a clean clone at the source commit it embeds, `npm ci && npm run kit` must give the same bytes.

Follow the integration and promotion gates in [CONTRIBUTING.md](CONTRIBUTING.md#integration-and-promotion). Orc authorizes the reviewed HEAD and Rel executes the merge; integration does not grant staging, release or production approval.

## Coordination

Record agent-to-agent messages in `.a2a/` following [AGENTS-SYNC.md](AGENTS-SYNC.md). Report each handoff in the related issue or pull request as well: Git does not notify anyone.
