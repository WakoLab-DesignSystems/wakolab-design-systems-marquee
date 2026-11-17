/* Neutral shell parts.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272,
 * web/src/features/catalog/parts.tsx: Brand (variant "serif"), the `.wl-tool` trigger markup of
 * AppearanceMenu/LanguageMenu/AccountArea, and the mode part of AppearanceMenu
 * (standard EXTRACTION_MATRIX §5.3, §5.7 M3).
 * Changes for standalone use:
 *  - Brand becomes a logo slot: without logo files the text fallback is identical to the source's
 *    serif brand (the label in the display face); with files it renders the configured mark and/or wordmark.
 *    A file that fails to load is reported (logo.mark, logo.wordmark, logo.wordmark.light|dark)
 *    and dropped as if omitted; with nothing left the text fallback returns; a new file is retried.
 *    The hard-coded product name is replaced by the `label` prop.
 *  - Tool triggers take their icon, label and value as props (no i18n, theme list or account logic).
 *  - The mode menu takes its labels as props and controls the Folio root's mode only.
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936,
 * src/parts/shell.tsx. Changes for Folio: the Brand variant is "serif" (class wl-brand--serif, no prompt
 * glyph), as FolioHeader uses it in the source; Console names → Folio names.
 */
import { useEffect, useId, useState, type ReactNode, type Ref } from "react";
import { Popover } from "../components";
import { Icon, type IconName } from "../components/icons";
import { useFolio } from "../root/context";
import type { Mode } from "../root/context";

/** Logo slot (source: Brand, variant "serif"). */
export function LogoSlot({ label, accessibleName, href = "./", onHome }: {
  /** Product label shown by the text fallback, and the default accessible name. */
  label: string;
  /** Accessible name of the link; defaults to the configured `logo.alt`, then to `label`. */
  accessibleName?: string;
  href?: string; onHome?: () => void;
}) {
  const { logo, resolvedMode, report } = useFolio();
  const [broken, setBroken] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => setBroken(new Set()), [logo]); // a new logo configuration is tried afresh
  const name = accessibleName ?? logo.alt ?? label;
  const wordKey = logo.wordmark ? (typeof logo.wordmark === "string" ? "logo.wordmark" : `logo.wordmark.${resolvedMode}`) : "";
  const wordSrc = logo.wordmark ? (typeof logo.wordmark === "string" ? logo.wordmark : logo.wordmark[resolvedMode]) : undefined;
  const mark = logo.mark && !broken.has(logo.mark) ? logo.mark : undefined;
  const word = wordSrc && !broken.has(wordSrc) ? wordSrc : undefined;
  const fail = (key: string, src: string) => {
    report({ key, message: `logo file failed to load: ${src}; ${key} is treated as omitted` });
    setBroken((s) => new Set(s).add(src));
  };
  const hasLogo = Boolean(mark || word);
  return (
    <a href={href} className={`wl-brand wl-brand--serif${hasLogo ? " wl-brand--logo" : ""}${mark ? " wl-brand--has-mark" : ""}`} aria-label={name}
      onClick={(e) => { if (!onHome) return; e.preventDefault(); onHome(); }}>
      {hasLogo ? (
        <>
          {mark && <img key={mark} className="wl-logo-mark" src={mark} alt="" onError={() => fail("logo.mark", mark)} />}
          {word && <img key={word} className="wl-logo-wordmark" src={word} alt="" onError={() => fail(wordKey, word)} />}
        </>
      ) : (
        <span aria-hidden="true">{label}</span>
      )}
    </a>
  );
}

/** Header tool trigger (source: `.wl-tool` buttons of the header menus). */
export function ToolButton({ icon, label, value, compact, valueLang, ...rest }: {
  icon?: IconName; label: string; value?: ReactNode; compact?: boolean; valueLang?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <button type="button" className="wl-tool" {...rest}>
      {icon && <Icon name={icon} />}<span className={compact ? "sr-only" : ""}>{label}</span>
      {value !== undefined && <span className="wl-tool-value" lang={valueLang}>{value}</span>}
    </button>
  );
}

/** Light / dark / system menu for the Folio root (source: the mode fieldset of AppearanceMenu). */
export function ModeMenu({ label, modeLabel, labels, compact, value }: {
  label: string; modeLabel: string; labels: Record<Mode, string>; compact?: boolean; value?: ReactNode;
}) {
  const { mode, setMode } = useFolio();
  const name = useId();
  return (
    <Popover label={label} trigger={(p) => (
      <button {...p} ref={p.ref as Ref<HTMLButtonElement>} type="button" className="wl-tool">
        <Icon name="palette" /><span className={compact ? "sr-only" : ""}>{label}</span>
        <span className="wl-tool-value">{value ?? labels[mode]}</span>
      </button>
    )}>
      {() => (
        <fieldset className="grid gap-1">
          <legend className="wl-label mb-1">{modeLabel}</legend>
          <div className="wl-segmented">
            {(["light", "dark", "system"] as Mode[]).map((m) => (
              <label key={m} className="wl-option">
                <input type="radio" name={name + "-mode"} checked={mode === m} onChange={() => setMode(m)} />
                <Icon name={m === "light" ? "sun" : m === "dark" ? "moon" : "spark"} size={16} />
                <span>{labels[m]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </Popover>
  );
}
