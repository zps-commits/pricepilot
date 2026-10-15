import { useId } from "react";
import type { CurrencyCode, DiscountResult } from "@/types/pricing";
import { formatMoney, formatPercent } from "@/lib/currency";
import { t } from "@/lib/i18n";

const TONE: Record<DiscountResult["outcome"], string> = {
  profit: "text-positive",
  "break-even": "text-muted",
  loss: "text-negative",
};

/**
 * "What if I knock 15% off?" — the question every pricing conversation ends
 * on. The slider is the control because the useful action is sweeping until
 * the profit line turns, not entering one exact figure.
 */
export default function DiscountControl({
  value,
  onChange,
  discount,
  currency,
}: {
  /** Whole percent, 0 to 100. */
  value: number;
  onChange: (next: number) => void;
  discount: DiscountResult | null;
  currency: CurrencyCode;
}) {
  const id = useId();

  return (
    <section className="panel mt-6 bg-accent-soft p-5 sm:p-6">
      <h2 className="section-title">{t.discount.legend}</h2>

      <div className="mt-4 flex items-center gap-4">
        <label htmlFor={id} className="sr-only">
          {t.discount.label}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer accent-accent-deep"
        />
        {/* A visual echo of the slider, which announces its own value. Left
            out of the accessibility tree so the figure is not read twice. */}
        <span
          aria-hidden="true"
          className="w-14 shrink-0 text-right font-mono text-sm"
        >
          {value}%
        </span>
      </div>

      <div aria-live="polite">
        {discount ? (
          <dl className="mt-5 divide-y divide-line border-t border-line">
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted">{t.discount.finalPrice}</dt>
              <dd className="font-mono text-sm">
                {formatMoney(discount.finalPrice, currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted">{t.discount.profit}</dt>
              <dd className={`font-mono text-sm ${TONE[discount.outcome]}`}>
                {formatMoney(discount.netProfit, currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted">{t.discount.change}</dt>
              {/* The sign is explicit: a profit that merely shrank still reads
                as a loss of profit, and the arithmetic should say which. */}
              <dd className="font-mono text-sm">
                {discount.profitDelta > 0 ? "+" : ""}
                {formatMoney(discount.profitDelta, currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted">
                {t.results.effectiveMargin}
              </dt>
              <dd className="font-mono text-sm">
                {formatPercent(discount.effectiveMarginPct, currency)}
              </dd>
            </div>
          </dl>
        ) : null}

        {discount ? (
          <p
            data-testid="discount-outcome"
            className={`mt-4 text-sm font-medium ${TONE[discount.outcome]}`}
          >
            {t.discount.outcome[discount.outcome]}
          </p>
        ) : null}
      </div>
    </section>
  );
}
