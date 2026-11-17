/* Icon slot for Folio.
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path); Console → Folio in comments.
 * Wrapper copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272,
 * web/src/components/ui/icons.tsx (the <svg> element and its attributes, and the icon names).
 * The SVG path data is NOT copied: its provenance is unresolved (standard EXTRACTION_MATRIX §10, E4;
 * console#1, folio#1). Consumers pass their own icon set (name → SVG path data) to <FolioRoot icons>.
 * Without a path for a name, the wrapper renders empty at the same size and carries
 * data-icon-missing: the layout is kept, no glyph is drawn and no substitute artwork is used.
 */
import { createContext, useContext, type SVGProps } from "react";
export const iconNames = ["search","x","check","chevronRight","chevronLeft","chevronDown","human","agent","lock","repo","clock","alert","info","offline","mail","globe","sun","moon","palette","spark","play","doc","external","list","user"] as const;
export type IconName = (typeof iconNames)[number];
/** Icon name → SVG path data ("d" attribute) on a 24×24 grid, drawn with a 1.75 stroke. */
export type IconSet = Partial<Record<IconName, string>>;
const IconSetContext = createContext<IconSet>({});
export const IconSetProvider = IconSetContext.Provider;
export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  const d = useContext(IconSetContext)[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      data-icon={name} data-icon-missing={d ? undefined : ""} {...rest}>
      {d ? <path d={d} /> : null}
    </svg>
  );
}
