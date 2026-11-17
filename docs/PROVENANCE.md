# Provenance: source → destination

Marquee was extracted for [#1](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-marquee/issues/1) following the standard at `c2ca848d0b44c62a2864f1c23d99b7ec7d34bdc1` ([KIT_PROPOSAL §8](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/c2ca848d0b44c62a2864f1c23d99b7ec7d34bdc1/docs/KIT_PROPOSAL.md), [CONFIGURATION](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/c2ca848d0b44c62a2864f1c23d99b7ec7d34bdc1/docs/CONFIGURATION.md), [CHECKLIST](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/c2ca848d0b44c62a2864f1c23d99b7ec7d34bdc1/docs/CHECKLIST.md)).

**Sources**
- **Design source:** WakoLab/wakolab-front at `e492bec9ced8893d6940879aa8186ac75a48a272`, read only. Nothing in the frontend was changed.
- **Mechanisms:** WakoLab-DesignSystems/wakolab-design-systems-folio at `0856c723bcf1047b61b093b9bf92d36d71f7a402` (accepted), which copied them from WakoLab-DesignSystems/wakolab-design-systems-console at `018fe3214e0a118162d202c2f39f1236f37b1936` (accepted). They are copied with attribution, never imported, as KIT_PROPOSAL §8 requires; Marquee has no dependency on either repository.
- **History:** commit `707aaab` is the verbatim copy from Folio; the later commits are the Marquee adaptations, so they can be reviewed as a diff.
- **File headers:** every copied file starts with a line naming Folio's commit and path, followed by its earlier provenance (frontend and Console). Folio names were replaced by Marquee names mechanically; references to Folio's own reviews (for example "folio#5") were kept as written.

**Kinds of file**
- **Copied:** the source's code, with only the listed changes.
- **Adapted:** markup, class names and behaviour are kept, while product inputs become props.
- **Original:** new code for standalone use.

## Identity (confirmed against the source)

Checked against the `[data-direction="marquee"]` blocks of `design-system/themes.css` (lines 161–237), the Marquee rules of `catalog.css` and `compositions.css`, `compositions/MarqueeHome.tsx` and `compositions/projects.tsx` (`MarqueeProject`). Each item matches KIT_PROPOSAL §8 and the batch request; no conflict was found:
- **Shelves of three tiles:** one shelf per category facet, `items.slice(0, 3)`, and a ghost "See all" button only when a shelf has more than three items (`MarqueeHome.tsx`); a filtered view is one tile grid.
- **Covers and initials:** `Cover` renders the image, or initials on a dotted ground (`.wl-cover--none`); text sits under the cover (`MarqueeTile`).
- **Bounded 21:9 banner:** `.wl-banner .wl-cover { aspect-ratio: 21 / 9; max-height: 360px }`, and a 96 px initials band without an image (`.wl-banner--none`).
- **Form on a card:** `.wl-marquee .wl-form` with surface, 16 px radius and `shadow-card`.
- **Large headings:** `.wl-marquee h1` `clamp(2.25rem, 5vw, 3rem)` weight 800, −0.02em; detail and form titles `clamp(2rem, 5vw, 3rem)`.
- **Fonts:** DM Sans for ui and prose, Manrope for display (`--wl-font-display`), heading weight 800 and tracking −0.015em.
- **Shadows in light and dark:** both modes define `--wl-shadow-card` and `--wl-shadow-pop` (light `rgb(25 24 29 / 0.08)` and `/ 0.25`, dark `rgb(0 0 0 / 0.4)` and `/ 0.6`).
- **Hover lift and reduced motion:** `.wl-tile:hover { transform: translateY(var(--wl-hover-lift)) }` with `--wl-hover-lift: -3px` and `--wl-motion: var(--wl-dur-slow)` (180 ms); `@media (prefers-reduced-motion: reduce) { .wl-tile:hover { transform: none } }`.
- **Independent roles:** `--wl-link` (`#a3361a` / `#ff9d7d`) differs from `--wl-action` (`#b23a1c` / `#ff8c66`); `--wl-focus` has the same default as `--wl-ink` but is a separate declaration.
- **`accent`** (`#f2b33d`, both modes) is used only by Console's classes (`.wl-prompt`, `.wl-marker`, the row marker) in `catalog.css`; no Marquee element uses it, so it has **no visible effect** in Marquee. It is still accepted by the configuration and set on the root.
- **No system-specific roles:** Marquee's source has no panel or other system literal; Folio's three panel roles are not carried over.

## Components (`src/components/`)

Copied from Folio, which copied them from Console; they are the frontend's `web/src/components/ui/*`, unchanged except for:
- Dialog: the dead `backdrop:bg-panel/60` utility is removed (E2);
- Popover: event and focus ownership (R3).

The icons file (`icons.tsx`) keeps the wrapper and the icon names only; **no path data** (E4).

## Parts (`src/parts/`)

| Destination | Source | Kind | Changes |
|---|---|---|---|
| `collection.tsx` | `web/src/features/catalog/parts.tsx` (CategoryChips, Cover, ProjectLink, CatalogStatus with tile skeletons, LoadMore), via Folio | Adapted | Unchanged from Folio |
| `page.tsx` | `project-parts.tsx` (Facts, MessageBlock, BackToProjects, ProjectLoading, ProjectProblem), via Folio | Adapted | Unchanged from Folio |
| `shell.tsx` | `parts.tsx` (Brand, tool triggers, mode part of AppearanceMenu), via Folio | Adapted | LogoSlot uses the source's **bold** brand variant (`wl-brand wl-brand--bold`, label only, as `MarqueeHeader`); ToolButton gains `hideValue` (the source's LanguageMenu `compact`: value visually hidden), used with `compact` as in the source's `Tools compact`; ModeMenu |

## Compositions

| Destination | Source | Kind | Changes |
|---|---|---|---|
| `src/compositions/index.tsx` | `compositions/shells.tsx` (MarqueeHeader, MarqueeShell), `shared.tsx` (Page), `MarqueeHome.tsx` (MarqueeHome, MarqueeTile), `projects.tsx` (MarqueeProject), `pages.tsx` (form framing, MessagePage) | Adapted (new for Marquee; structure follows Folio's file) | MarqueeHeader (logo, search, tools), MarqueeShell, Page, CollectionLayout, HighlightSection, Shelf, TileGrid, TileContent, DetailLayout, CardSection, Panel, FormPage, MessagePage. Same DOM, classes and order as the source; content is supplied through slots. No keyboard layer (none in the source) |
| `src/compositions/registration.tsx` | `web/src/features/RegistrationShell.tsx`, via Folio's RegistrationFrame and EditorialPanel | Copied | Comments only: the editorial side keeps the source's `data-surface="dark"` attribute, which no Marquee rule uses; the monogram defaults to the first letter of `label` (the source hard-codes "W") |

## Root and configuration

| Destination | Source | Kind | Changes |
|---|---|---|---|
| `src/root/MarqueeRoot.tsx`, `context.ts` | Folio `FolioRoot.tsx`, `context.ts` | Copied | Marquee names; root `data-wds="marquee"`; every font role falls back to `var(--wl-fallback-sans)` |
| `src/root/config.ts` | Folio `config.ts` | Copied | System `marquee`; **no declared roles** (Folio's panel roles are reported as unknown); the F-R1 font contract and the R3 asset fallbacks are kept unchanged |
| `src/root/fonts.ts` | Folio `fonts.ts` | Copied | Family prefix `wds-marquee-font-` |
| `config.default.json` | Generated from `tokens.css` | Copied values | 25 roles per mode, `action-pressed` omitted (follows the effective hover), system `marquee` |
| `config.schema.json` | Folio's schema | Copied | Panel roles removed |

## Styles (`src/styles/`)

| Destination | Source | Kind | Changes |
|---|---|---|---|
| `tokens.css` | `design-system/themes.css` lines 161–237; `:root` block of `theme.css` | Copied | Root selector; WakoLab `--wl-agent*` removed; default font aliases (`wds-marquee-default-*`); `--wl-action-pressed`; `--wl-font-code` (own default); fallback stack and durations |
| `theme.css` | `design-system/theme.css`, via Folio and Console | Copied | Folio's panel mapping and its `[data-surface="dark"]` focus rule removed; agent roles removed |
| `base.css`, `global-rules.css`, `root.css` | `web/src/style.css`, `compositions.css`, via Folio and Console | Copied | Folio → Marquee in comments |
| `marquee-parts.css` | `design-system/catalog.css` | Copied | Shared parts, the "C · Marquee" block, Marquee responsive, page and theme-framing rules, reduced motion; removed source lines are listed in the file |
| `registration.css` | `design-system/compositions.css` lines 2–28, 70–89, 97–100, 115–117, 143–160 | Copied | `[data-direction="marquee"]` prefixes dropped |
| `marquee.css` | Composition of `web/src/style.css`, via Folio and Console | Adapted | Entry for the build |

The build (`scripts/build.mjs`, copied from Folio) prefixes every selector with `[data-wds="marquee"]`, maps `:root`/`html`/`body` to the root, renames layers, keyframes and `@property` names with `wds-marquee-`, and ships DM Sans, Manrope, Noto Sans SC and Noto Sans Devanagari under `wds-marquee-default-*` names.

## Not extracted

- **Product content** that the frontend composes into Marquee's slots: JoinPanel, Access, membership, roles, stages, rewards, repositories, members, tools, catalog contracts, API ports, i18n, the appearance preference key, and the profile-page rules.
- **Console- and Folio-specific rules** and the development gallery.
- **Icon artwork** (E4).

## Examples and checks

**Copied from Folio and adapted, or original:**
- `examples/demo`: presentation page and screens with a menu (shelves, highlighted section, banner, chips, section cards, form card); hash state kept by the menu and home links.
- `examples/config`: example configuration (action, link and `shadow-card` per mode, a display font file, logos).
- `examples/harness`: test harness (a tile and a section card replace Folio's editorial panel).
- `examples/parity`: parity candidates following the prototype's Marquee DOM, with the fixture texts copied from what the frontend renders.
- `tests/*.spec.ts`: expected values are Marquee's own.
- `scripts/*`, including `check-artwork.mjs` with the same one-way icon hashes.
