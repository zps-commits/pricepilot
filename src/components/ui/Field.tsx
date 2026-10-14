import { useId } from 'react';

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Sits under the field, always visible. Not a tooltip: it explains the field. */
  hint?: string;
  error?: string | null;
  /** A currency symbol, before the number. */
  prefix?: string;
  /** A percent sign, after the number. */
  suffix?: string;
  placeholder?: string;
  numeric?: boolean;
  className?: string;
};

/**
 * One labeled control.
 *
 * The hint is rendered, not hidden behind a question mark: the whole difficulty
 * of a pricing tool is knowing which box a given cost goes in, so the
 * explanation has to be on screen while the person is typing.
 */
export default function Field({
  label,
  value,
  onChange,
  hint,
  error,
  prefix,
  suffix,
  placeholder,
  numeric = true,
  className,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // Both are joined so the error never replaces the explanation in the
  // accessible name chain — a screen reader user needs the hint most at the
  // moment the value is wrong.
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>

      <div className="field-shell" data-invalid={error ? 'true' : 'false'}>
        {prefix ? (
          <span className="field-adornment" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          className={numeric ? 'field-bare' : 'field-bare font-sans'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={numeric ? 'decimal' : undefined}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
        {suffix ? (
          <span className="field-adornment" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-snug text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-negative">
          {error}
        </p>
      ) : null}
    </div>
  );
}
