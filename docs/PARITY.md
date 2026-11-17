# Visual parity with the frontend (EXTRACTION_MATRIX §8)

Evidence for review of [#1](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-marquee/issues/1); not an acceptance decision.

**The strict gate (no difference except listed deliberate ones) does not pass.** The script reports every nonzero pixel as a failure, and six cases keep small **stable** differences whose cause is not identified. They are handed to Orc with localized evidence (below). No threshold was changed, and **no exception granted to Console or Folio applies to Marquee**.

## Run 1 — Des, candidate built from the sources at `3cb527b`

**Code.** The candidate is the package built from `src/` at `3cb527bbb772e70ced0a607966ba015aaac8595f`; later commits change documentation and evidence only.

**Environment.** The capture settings of `scripts/parity.mjs`, copied from Folio (itself from Console) with attribution:
- Chromium 153.0.8010.12 with Playwright 1.56.1;
- 360/768/1024/1440 px wide, 900 px high, full page;
- device scale factor 1, reduced motion;
- fonts awaited, and native selects laid out again after the fonts load, on both sides;
- animations disabled.

**Reference controls.** `--control`: every case was captured again in a second, separate browser launch, to compare baseline against baseline, candidate against candidate, and the second baseline against the second candidate.

**Baselines.** WakoLab/wakolab-front at `e492bec`, read only, from a separate checkout; nothing was written into it.
- Prototype screens (Marquee direction): collection (shelves of tiles, search in the top bar), detail (initials band, card section), not-found, message (the MVP "propose" page), loading (tile skeletons), unavailable, and the session dialog open over the collection.
- Fixture screens: `examples/parity/fixture` rendered with the frontend's own modules, through `examples/parity/front-baseline`:
  - a real neutral form (Marquee's form card);
  - the component sheet;
  - a destructive confirmation dialog;
  - the registration frame (the frontend's real `RegistrationShell`);
  - **an open Popover with a visible Toast** (`overlays`).

**Candidates.**
- `examples/parity`, with the same synthetic texts as the prototype (`examples/parity/fixtures.ts`), using `MarqueeHeader` (logo, search, compact tools), `CollectionLayout`, `Shelf`, `TileContent`, `DetailLayout`, `CardSection` and `MessagePage`;
- the same fixture rendered with the built package (`marquee-sys.tsx`).

**Product content in slots.** The detail side panel holds the frontend's JoinPanel and Access markup, styled by `examples/parity/parity.css`. Those rules stay in the frontend and are not part of the package.

**Registration frame.** It uses `EditorialPanel` with the label "WakoLab"; its default monogram renders the same "W" as the source's hard-coded letter.

**Icons.**
- The frontend's icon paths are read from the separate checkout at run time and injected into the candidates only. Nothing is written to this repository.
- Crops of differing areas are masked wherever an icon `<svg>` lies. No crop intersected an icon in this run, so nothing was masked.
- Full-page images are not committed, because they contain the icon artwork.

### Result

96 comparisons (12 screens × 4 widths × 2 modes). Page sizes are equal in all of them. Cells: differing pixels in the first launch, with the largest per-channel difference out of 255.

| Screen | Light 360 | Light 768 | Light 1024 | Light 1440 | Dark 360 | Dark 768 | Dark 1024 | Dark 1440 |
|---|---|---|---|---|---|---|---|---|
| collection | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| detail | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| notFound | 0 | 0 | 0 | 0 | 9 (≤1) | 0 | 0 | 0 |
| message | 0 | 0 | 0 | 0 | 9 (≤1) | 0 | 0 | 0 |
| loading | 0 | 0 | 0 | 0 | 0 | 29 (≤4) | 0 | 0 |
| unavailable | 0 | 0 | 0 | 0 | 0 | 29 (≤4) | 4 (≤1) | 4 (≤1) |
| dialog | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| form | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| components | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| confirm | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| registration | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| overlays | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Exact counts per launch:**
- first launch: **90 of 96** pixel-identical;
- second launch: **90 of 96** pixel-identical, with the same six cases and the same counts;
- identical in both launches: **90** cases.

**Reference controls:** baseline against baseline is 0 in all 96 cases, and candidate against candidate is 0 in all 96 cases. No case varies on the reference side in this run; the six differences are **stable**.

### Stable differences (for Orc)

| Case | Pixels | Max delta | Clusters (x0,y0–x1,y1) | Element under the pixels (candidate) |
|---|---|---|---|---|
| notFound / dark / 360 | 9 | 1 | 16,74–17,77; 16,102–17,104 | Left rounded edge of the top-bar search input (10 px radius, `control` border) |
| message / dark / 360 | 9 | 1 | same as notFound | Same search input edge |
| loading / dark / 768 | 29 | 4 | 16,229–18,246; 88,246–101,246; 159,246–171,246; 283,246–295,246; 388,246 | Left rounded edge of the pressed "All" category chip, and one-pixel runs at y = 246 across the rounded ends of neighbouring chips (chip row 216–260) |
| unavailable / dark / 768 | 29 | 4 | same as loading / dark / 768 | Same chip edges |
| unavailable / dark / 1024 | 4 | 1 | 33,255–34,257 | Left rounded edge of the pressed "All" category chip |
| unavailable / dark / 1440 | 4 | 1 | same as 1024 | Same chip edge |

- Every differing pixel is on the anti-aliased edge of a rounded control; colours differ by 1 to 4 out of 255.
- All six are in dark mode, on prototype screens. The same elements render identically on the collection and dialog screens, in both modes and at every width.
- Evidence: [`docs/parity/run-1/differences/`](parity/run-1/differences) (every differing pixel with both colours) and [`docs/parity/run-1/evidence/`](parity/run-1/evidence) (8× crops: baseline | candidate | difference). The full table with controls is in [`docs/parity/run-1/report.md`](parity/run-1/report.md).
- **Not done:** no further investigation, as the batch instructs. The cause is not identified, nothing is claimed about it, and no exception is requested here; the decision belongs to Orc.

### Fixes made before this run

These came from the first comparisons in this batch and are part of the reviewed code:
- **Host page margin.** A provenance line inserted after a one-line CSS comment fell outside the comment and swallowed the following `body { margin: 0; }` rule of the parity and demo pages; the candidate page started 8 px lower. The line is now its own comment (examples only; not in the package).
- **Compact header tools.** Marquee's header uses the source's `Tools compact`: the appearance label and the language value are visually hidden. `ToolButton` gained `hideValue` for the latter; the parity candidate and the demo use both.

## How to reproduce

1. Check out WakoLab/wakolab-front at `e492bec9ced8893d6940879aa8186ac75a48a272` in a separate folder, run `npm ci` there, and serve the prototype: `npm run prototype -- --port 5174`.
2. Build the fixture baseline from that checkout: `FRONT=<checkout> OUT=<folder> node <checkout>/node_modules/vite/bin/vite.js build --config examples/parity/front-baseline/vite.config.mjs`, and serve `<folder>/site` on port 5175.
3. In this repository: `npm run build`, then `npx vite --config examples/vite.config.ts` (port 5192; run 1 used port 5193 with `--candidate` and `--fixture-candidate`, because a Docker check was using 5192).
4. `node scripts/parity.mjs --icons <checkout>/web/src/components/ui/icons.tsx --control`.
