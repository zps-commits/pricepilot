import Field from '@/components/ui/Field';
import CurrencyToggle from '@/components/ui/CurrencyToggle';
import { t } from '@/lib/i18n';
import type { FormState } from '@/lib/form';
import type { CurrencyCode } from '@/types/pricing';

type Errors = Partial<Record<keyof FormState, string>>;

export default function CalculatorForm({
  form,
  errors,
  onChange,
}: {
  form: FormState;
  errors: Errors;
  onChange: <K extends keyof FormState>(name: K, value: FormState[K]) => void;
}) {
  const symbol = form.currency === 'BRL' ? 'R$' : '$';

  return (
    /* No onSubmit: the result is live, so there is nothing to submit. A form
       element here would invite an Enter press that does nothing. */
    <div className="space-y-8">
      <section className="panel p-5 sm:p-6">
        <h2 className="section-title">{t.costs.legend}</h2>

        <Field
          label={t.costs.name}
          value={form.name}
          onChange={(value) => onChange('name', value)}
          placeholder={t.costs.namePlaceholder}
          numeric={false}
          className="mt-4"
        />

        <div className="mt-5 grid items-start gap-5 sm:grid-cols-2">
          <Field
            label={t.costs.variableCost}
            hint={t.costs.variableCostHint}
            value={form.variableCost}
            error={errors.variableCost}
            onChange={(value) => onChange('variableCost', value)}
            prefix={symbol}
            placeholder="0.00"
          />
          <Field
            label={t.costs.fixedCostShare}
            hint={t.costs.fixedCostShareHint}
            value={form.fixedCostShare}
            error={errors.fixedCostShare}
            onChange={(value) => onChange('fixedCostShare', value)}
            prefix={symbol}
            placeholder="0.00"
          />
          <Field
            label={t.costs.otherCosts}
            hint={t.costs.otherCostsHint}
            value={form.otherCosts}
            error={errors.otherCosts}
            onChange={(value) => onChange('otherCosts', value)}
            prefix={symbol}
            placeholder="0.00"
          />
        </div>
      </section>

      <section className="panel p-5 sm:p-6">
        <h2 className="section-title">{t.rates.legend}</h2>
        <p className="mt-2 text-xs leading-snug text-muted">{t.rates.hint}</p>

        <div className="mt-4 grid items-start gap-5 sm:grid-cols-2">
          <Field
            label={t.rates.paymentFee}
            value={form.paymentFeePct}
            error={errors.paymentFeePct}
            onChange={(value) => onChange('paymentFeePct', value)}
            suffix="%"
            placeholder="0"
          />
          <Field
            label={t.rates.commission}
            value={form.commissionPct}
            error={errors.commissionPct}
            onChange={(value) => onChange('commissionPct', value)}
            suffix="%"
            placeholder="0"
          />
          <Field
            label={t.rates.otherTaxes}
            value={form.otherTaxesPct}
            error={errors.otherTaxesPct}
            onChange={(value) => onChange('otherTaxesPct', value)}
            suffix="%"
            placeholder="0"
          />
          <Field
            label={t.rates.margin}
            value={form.desiredMarginPct}
            error={errors.desiredMarginPct}
            onChange={(value) => onChange('desiredMarginPct', value)}
            suffix="%"
            placeholder="0"
          />
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <CurrencyToggle
            value={form.currency}
            onChange={(code: CurrencyCode) => onChange('currency', code)}
          />
        </div>
      </section>
    </div>
  );
}
