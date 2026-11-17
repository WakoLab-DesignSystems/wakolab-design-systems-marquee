# Compositions

| Composition | Slots | Invariants |
| --- | --- | --- |
| `MarqueeShell` + `MarqueeHeader` | logo, search, tools | Sticky top bar on the page background; bold brand, search field, compact tools |
| `CollectionLayout` | title, lead, action, highlight, label, filters, count, children | Intro row (large title and lead, optional action at the end), optional highlighted section, then the catalog section: chips, live count, state, shelves or a tile grid, more |
| `HighlightSection` + `TileGrid highlight` | heading, status, tiles, more | A highlighted section above the catalog with large tiles |
| `Shelf` | heading, action ("See all"), up to three tiles | Heading and action on one row; tiles in 1, 2 then 3 columns |
| `TileGrid` + `TileContent` | cover, title, summary, meta | Wrap each tile in `ItemLink className="wl-tile"` inside `<li className="min-w-0">`; text under the cover |
| `DetailLayout` + `CardSection` | back, banner, path, title, lead, chips, side, sections, problem | Banner across the grid (21:9 up to 360 px, or a 96 px initials band), head and body on the left, side column of 380 px sticky from 64rem; sections are raised cards |
| `FormPage` | back, title, lead, form | Large title; the `.wl-form` sits on a raised card |
| `MessagePage` | icon, title, body, action | Message in the form frame |
| `RegistrationFrame` + `EditorialPanel` | brand, tools, heading texts, editorial content (eyebrow, title, text, monogram, footer), steps, form, status, footnote | Transparent layout with a bordered editorial card on `surface-2` and a raised workspace card; from 64rem the editorial card is split 2:1 with a monogram tile on `action` (the monogram defaults to the first letter of the label) |
