import type { CurrencyCode } from '@/types/pricing';
import { t } from '@/lib/i18n';

const OPTIONS: readonly { code: CurrencyCode; label: string }[] = [
  { code: 'BRL', label: 'R$ BRL' },
  { code: 'USD', label: '$ USD' },
];

/**
 * Switches which currency the figures are labeled in. It does not convert,
 * and the hint says so, because a currency switch that silently left the
 * numbers alone would otherwise read as a conversion bug.
 */
export default function CurrencyToggle({
  value,
  onChange,
}: {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
}) {
  return (
    <div>
      <div className="section-title mb-1.5">{t.currency.legend}</div>
      <div
        role="group"
        aria-label={t.currency.legend}
        className="inline-flex rounded-field border border-line-strong bg-surface p-0.5"
      >
        {OPTIONS.map((option) => {
          const active = option.code === value;
          return (
            <button
              key={option.code}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.code)}
              className={`pressable rounded-[0.375rem] px-3 py-1.5 font-mono text-xs ${
                active ? 'bg-accent text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs leading-snug text-muted">{t.currency.hint}</p>
    </div>
  );
}
