import type { CurrencyCode, Scenario } from '@/types/pricing';
import { formatMoney, formatPercent } from '@/lib/currency';
import { t } from '@/lib/i18n';

/**
 * The same costs at three margins.
 *
 * A scenario the rates make unsolvable is simply absent — the engine returns
 * only what it can price, and an empty row would be a number the tool does
 * not actually have.
 */
export default function ScenarioTable({
  scenarios,
  currency,
  currentMarginPct,
}: {
  scenarios: Scenario[];
  currency: CurrencyCode;
  /** Marks the row that matches what the user asked for. */
  currentMarginPct: number;
}) {
  if (scenarios.length === 0) return null;

  return (
    <section className="panel mt-8 p-5 sm:p-6">
      <h2 className="section-title">{t.scenarios.legend}</h2>
      <p className="mt-2 text-xs leading-snug text-muted">{t.scenarios.hint}</p>

      {/*
        A table is the honest element here: three rows compared on four
        columns. It scrolls in its own box rather than pushing the page.

        The box is focusable and labelled: on a narrow screen it scrolls, and
        a scrollable region a keyboard cannot reach is content a keyboard
        cannot read.
      */}
      <div
        className="mt-4 overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={t.scenarios.legend}
      >
        <table className="w-full min-w-[26rem] border-collapse text-sm">
          <caption className="sr-only">{t.scenarios.legend}</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-2 pr-4 font-medium text-muted">
                {t.scenarios.scenario}
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium text-muted">
                {t.scenarios.margin}
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium text-muted">
                {t.scenarios.price}
              </th>
              <th scope="col" className="py-2 text-right font-medium text-muted">
                {t.scenarios.profit}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {scenarios.map((scenario) => {
              const isCurrent = Math.abs(scenario.marginPct - currentMarginPct) < 0.005;
              return (
                <tr key={scenario.id} className={isCurrent ? 'bg-accent-soft' : undefined}>
                  <th scope="row" className="py-2.5 pr-4 text-left font-medium">
                    {t.scenarios.names[scenario.id]}
                    {isCurrent ? (
                      <span className="ml-2 font-normal text-muted">({t.scenarios.current})</span>
                    ) : null}
                  </th>
                  <td className="py-2.5 pr-4 text-right font-mono">
                    {formatPercent(scenario.marginPct, currency)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono">
                    {formatMoney(scenario.result.suggestedPrice, currency)}
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    {formatMoney(scenario.result.netProfit, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
