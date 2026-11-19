// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at 0856c723bcf1047b61b093b9bf92d36d71f7a402, examples/env.d.ts; Folio names → Marquee names (Marquee adaptations noted where they apply).
declare module "*.css";
// Added for the single HTML file (#6), as in Folio a6b153fbc9a7cd4c879ccf569345c5088680b3f5, examples/env.d.ts.
declare module "*?inline" { const url: string; export default url; }
declare module "*?raw" { const text: string; export default text; }
