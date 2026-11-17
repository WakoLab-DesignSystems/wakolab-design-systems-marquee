# Identity

Marquee is a **bold, visual discovery** system: covers first, large heavy headings, raised cards.

- **Type:** DM Sans for the interface and prose; **Manrope** at weight **800** for display (page titles, shelf and section headings, tile titles, the brand). Page titles use −0.02em tracking; the heading token is −0.015em.
- **Large headings:** collection title `clamp(2.25rem, 5vw, 3rem)`; detail and form titles `clamp(2rem, 5vw, 3rem)`; section and shelf headings 1.375rem.
- **Collection as shelves:** one shelf per category with **at most three tiles** and a "See all" action when the category has more; a filtered or searched collection becomes one wrapping tile grid (1, 2 then 3 columns at 0 / 40rem / 64rem). No carousel, no autoplay.
- **Tiles:** a cover (an image, or initials on a dotted ground) with the text **under** the image, never on it: heavy title, a two-line tagline, a meta line. Tiles are raised with `shadow-card` and lift by 3 px with `shadow-pop` on hover.
- **Detail:** a **bounded 21:9 banner** (at most 360 px high, nothing drawn on it) when an image exists, otherwise a 96 px initials band; path, large title, lead and **chips**; a side panel, sticky from 64rem; body content in raised **section cards**.
- **Form:** large heading, and the form itself sits on a **raised card**.
- **Search** lives in the top bar.
- **Geometry and depth:** large radii (10 px controls, 16 px cards, 12 px covers, pill chips), **card shadows in both light and dark mode**, 180 ms motion.
- **Brand:** the logo slot's text fallback is the product label in Manrope 800 at 1.5rem.

Consumers may change any configurable value; these rules describe the defaults.
