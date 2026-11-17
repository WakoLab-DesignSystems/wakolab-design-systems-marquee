# Accessibility

Verified on the **shipped defaults and the demo**, never on consumer values:
- **Contrast:** 48 colour pairs pass in both modes (`scripts/theme-tokens.mjs`).
- **Automated audit:** every demo screen and the parity fixture screens are axe-clean for WCAG 2.2 A/AA in light and dark (`tests/defaults.spec.ts`).
- **Reflow:** no horizontal overflow from 320 px.
- **Keyboard and focus:**
  - focus is visible (default `focus` equals `ink`, a separate role);
  - dialogs move focus inside and return it to the trigger;
  - popovers close with Escape, also inside a dialog;
  - tabs move with the arrow keys.
- **Reduced motion:** honoured inside the root, including the tile hover lift.

**Limits:**
- Screen-reader behaviour was not tested with real assistive technology.
- Icon slots are empty unless the consumer supplies icons; every icon is decorative or paired with text.
- Tile text sits under the cover, never on it, so cover images do not affect text contrast.
