import type { PricingInput, PricingResult } from '@/types/pricing';
import type { EngineProblem } from '@/domain/pricing';
import { formatMoney, formatPercent } from '@/lib/currency';
import { t } from '@/lib/i18n';

function Row({
  label,
  hint,
  value,
  tone = 'neutral',
}: {
  label: string;
  hint?: string;
  value: string;
  tone?: 'neutral' | 'positive' | 'negative';
}) {
  const toneClass =
    tone === 'positive' ? 'text-positive' : tone === 'negative' ? 'text-negative' : 'text-ink';

  return (
    /*
     * A divided list rather than a card each: these are rows of a ledger,
     * and elevation would imply a hierarchy that is not there.
     *
     * The dt and dd are direct children of a single div, which is the only
     * wrapper a dl permits. Nesting them deeper is what axe flags as a
     * broken definition list.
     */
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="min-w-0 text-sm text-muted">
        {label}
        {hint ? <span className="mt-0.5 block text-xs leading-snug">{hint}</span> : null}
      </dt>
      <dd className={`shrink-0 font-mono text-sm ${toneClass}`}>{value}</dd>
    </div>
  );
}

export default function ResultsPanel({
  input,
  result,
  problems,
  priceable,
}: {
  input: PricingInput;
  result: PricingResult | null;
  problems: EngineProblem[];
  /** False when nothing has a cost yet, which is not an error. */
  priceable: boolean;
}) {
  const { currency } = input;

  return (
    <section className="panel p-5 sm:p-6" aria-live="polite">
      <h2 className="section-title">{t.results.legend}</h2>

      {problems.length > 0 ? (
        <div className="mt-4 rounded-field border border-negative/30 bg-negative/5 p-4">
          {problems.map((problem) => (
            <p
              key={problem.code}
              data-testid="engine-problem"
              className="text-sm leading-relaxed text-negative"
            >
              {problem.message}
            </p>
          ))}
        </div>
      ) : !priceable || !result ? (
        <p className="mt-4 text-sm text-muted">{t.results.empty}</p>
      ) : (
        <>
          {/* The one figure the whole tool exists to produce, sized to say so. */}
          <div className="mt-4">
            <div className="text-sm text-muted">{t.results.suggestedPrice}</div>
            <div
              data-testid="suggested-price"
              className="mt-1 text-4xl font-semibold leading-none tracking-tight text-accent sm:text-5xl"
            >
              {formatMoney(result.suggestedPrice, currency)}
            </div>
            {input.name ? <p className="mt-2 text-sm text-muted">{input.name}</p> : null}
          </div>

          <dl className="mt-6 divide-y divide-line border-t border-line">
            <Row
              label={t.results.totalCost}
              value={formatMoney(result.totalCost, currency)}
            />
            <Row
              label={`${t.results.rates} (${formatPercent(result.totalRatePct, currency)})`}
              value={`- ${formatMoney(result.taxAmount, currency)}`}
            />
            <Row
              label={t.results.revenueAfterRates}
              value={formatMoney(result.revenueAfterRates, currency)}
            />
            <Row
              label={t.results.netProfit}
              value={formatMoney(result.netProfit, currency)}
              tone={result.netProfit > 0 ? 'positive' : result.netProfit < 0 ? 'negative' : 'neutral'}
            />
            <Row
              label={t.results.effectiveMargin}
              value={formatPercent(result.effectiveMarginPct, currency)}
            />
            <Row
              label={t.results.markup}
              value={
                result.markupPct === null
                  ? t.results.noMarkup
                  : formatPercent(result.markupPct, currency)
              }
            />
            <Row
              label={t.results.breakEven}
              hint={t.results.breakEvenHint}
              value={formatMoney(result.breakEvenPrice, currency)}
            />
          </dl>
        </>
      )}
    </section>
  );
}
