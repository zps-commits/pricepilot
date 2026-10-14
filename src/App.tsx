import { useCallback, useState } from 'react';
import CalculatorForm from '@/components/calculator/CalculatorForm';
import DiscountControl from '@/components/results/DiscountControl';
import ResultsPanel from '@/components/results/ResultsPanel';
import ScenarioTable from '@/components/scenarios/ScenarioTable';
import { applyDiscount, buildScenarios, calculate, engineProblems } from '@/domain/pricing';
import { formatMoney } from '@/lib/currency';
import { DEFAULT_FORM, formErrors, hasCost, toPricingInput, type FormState } from '@/lib/form';
import { t } from '@/lib/i18n';

export default function App() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  /* Kept out of the form: a discount is a question about the result, not an
     input to the price the tool recommends. */
  const [discountPct, setDiscountPct] = useState(0);

  const setField = useCallback(
    <K extends keyof FormState>(name: K, value: FormState[K]) => {
      setForm((current) => ({ ...current, [name]: value }));
    },
    [],
  );

  // Derived on every render rather than stored. The whole calculation is a few
  // divisions; caching it would only add a way for it to go stale.
  const errors = formErrors(form);
  const input = toPricingInput(form);
  const priceable = Object.keys(errors).length === 0 && hasCost(form);
  const problems = Object.keys(errors).length === 0 ? engineProblems(input) : [];
  const result = priceable && problems.length === 0 ? calculate(input) : null;
  const discount = result ? applyDiscount(result, discountPct) : null;
  const scenarios = result ? buildScenarios(input) : [];

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
          <h1 className="text-lg font-semibold tracking-tight">{t.appName}</h1>
          <p className="mt-1 max-w-prose text-sm text-muted">{t.tagline}</p>
        </div>
      </header>

      {/* Bottom padding reserves room for the mobile price bar. */}
      <main className="mx-auto max-w-5xl px-5 pb-28 pt-8 sm:px-8 lg:pb-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-10">
          <CalculatorForm form={form} errors={errors} onChange={setField} />

          {/* Not sticky: with the discount panel the column is taller than a
              short viewport, and a pinned column would put its own bottom out
              of reach. */}
          <div>
            <ResultsPanel
              input={input}
              result={result}
              problems={problems}
              priceable={priceable}
            />

            {result ? (
              <DiscountControl
                value={discountPct}
                onChange={setDiscountPct}
                discount={discount}
                currency={form.currency}
              />
            ) : null}
          </div>
        </div>

        <ScenarioTable
          scenarios={scenarios}
          currency={form.currency}
          currentMarginPct={input.desiredMarginPct}
        />

        <p className="mt-10 max-w-prose text-xs leading-relaxed text-muted">{t.disclaimer}</p>
      </main>

      {/*
        On a phone the form is taller than the screen, so the figure being
        changed would otherwise be scrolled out of sight while typing.
        aria-hidden: the results panel already announces the same value.
      */}
      {result ? (
        <div
          aria-hidden="true"
          className="price-bar fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 backdrop-blur-sm lg:hidden"
        >
          <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-4 px-5 py-3.5 sm:px-8">
            <span className="text-sm text-muted">{t.results.suggestedPrice}</span>
            <span className="text-xl font-semibold text-accent">
              {formatMoney(result.suggestedPrice, form.currency)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
