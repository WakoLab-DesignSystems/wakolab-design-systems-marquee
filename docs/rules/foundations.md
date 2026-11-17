# Foundations

## Colour roles
- The common roles of the standard's CONFIGURATION §2: `bg`, `surface`, `surface-2`, `ink`, `muted`, `border`, `control`, `action`, `action-hover`, `action-pressed`, `on-action`, `link`, `focus`, `accent`, status pairs, `on-danger`, `scrim`, `shadow-card`, `shadow-pop`. Defaults are in [config.default.json](../../config.default.json).
- Marquee declares **no system-specific roles** (Folio's `panel` roles are reported as unknown).
- Each omitted role keeps its own same-mode default; nothing follows another role. The only exception is `action-pressed`, which follows the effective `action-hover`.
- **Independent roles worth noting:**
  - `link` (light `#a3361a`, dark `#ff9d7d`) is its own role: configuring `action` does not change links;
  - `focus` defaults to the same value as `ink` (light `#19181d`, dark `#f3f1ed`) but is a separate role: configuring `ink` does not change the focus outline.
- `accent` (`#f2b33d`) is accepted but has **no visible effect** in Marquee: in the source only Console's classes use it. The `code` font role likewise has no visible consumer.

## Typography
- `ui` and `prose`: DM Sans, then the shared fallback (Noto Sans SC, Noto Sans Devanagari, system-ui, sans-serif).
- `display`: Manrope, then the same shared fallback; headings at weight 800.
- `code`: DM Sans (no visible consumer).
- Interface size 16 px; prose with a 1.65 line height and a 68-character measure.

## Spacing, radius, elevation, density
- Radii: controls 10 px, cards 16 px, covers 12 px, chips pill (999 px).
- Shadows, in **both modes**:
  - `shadow-card`: light `0 2px 8px rgb(25 24 29 / 0.08)`, dark `0 2px 10px rgb(0 0 0 / 0.4)`;
  - `shadow-pop` (tile hover, overlays): light `0 24px 60px rgb(25 24 29 / 0.25)`, dark `0 24px 60px rgb(0 0 0 / 0.6)`.
- Scrim: light `rgb(25 24 29 / 0.5)`, dark `rgb(0 0 0 / 0.65)`.
- Row-height token 56 px; interactive controls at least 44 px high.
- Collection content up to 1440 px wide; side padding 16 px, 32 px from 64rem. Detail grid: content and a 380 px side column from 64rem.

## Focus
- 2 px outline in `focus`, offset 2 px, on keyboard focus.

## Icons
- Components keep icon slots; Marquee ships **no icon artwork**. Supply your own icon set (see the README).
