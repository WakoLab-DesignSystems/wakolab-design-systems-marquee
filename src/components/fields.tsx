/* Copied from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
 * Copied from WakoLab-DesignSystems/wakolab-design-systems-console at 018fe3214e0a118162d202c2f39f1236f37b1936 (same path), unchanged.
 * Source: web/src/components/ui/fields.tsx
 * Changes for standalone use: none.
 */
import {
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
export function TextField({
  label,
  hint,
  error,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  const generated = useId();
  const key = id || generated;
  return (
    <div className="space-y-2 min-w-0">
      <label className="block font-medium" htmlFor={key}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        {...props}
        id={key}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${key}-hint` : undefined}
        className="min-h-11 rounded-control border border-control-border bg-surface w-full min-w-0 p-3 text-base disabled:bg-surface-subtle aria-invalid:border-danger"
      />
      {(hint || error) && (
        <p id={`${key}-hint`} className={error ? "text-danger" : "text-muted"}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
export function CodeField(props: Parameters<typeof TextField>[0]) {
  return (
    <TextField
      {...props}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      minLength={6}
      maxLength={6}
    />
  );
}
export function Select({
  label,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const generated = useId();
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id || generated} className="block font-medium">
        {label}
      </label>
      <select
        {...props}
        id={id || generated}
        className="min-h-11 w-full min-w-0 rounded-control border border-control-border bg-surface p-2"
      >
        {children}
      </select>
    </div>
  );
}
export function ChoiceGroup({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const name = useId();
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="font-medium mb-2">{label}</legend>
      {options.map((o) => (
        <label
          key={o.value}
          className="flex min-h-11 gap-3 items-center rounded-control border border-control-border p-3 has-checked:bg-surface-subtle"
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
export function Checkbox({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-3 min-h-11">
      <input {...props} type="checkbox" />
      {label}
    </label>
  );
}
