import type { CurrencyCode, PricingInput } from '@/types/pricing';
import { inputToCents, parsePercent } from '@/lib/currency';

/**
 * The form holds raw strings, not numbers.
 *
 * Anything else fights the person typing: a numeric state cannot hold "12,"
 * or "0." or an empty field, so it either rewrites what they typed mid-keystroke
 * or refuses the character. Parsing happens on read instead.
 */
export type FormState = {
  name: string;
  currency: CurrencyCode;
  variableCost: string;
  fixedCostShare: string;
  otherCosts: string;
  paymentFeePct: string;
  commissionPct: string;
  otherTaxesPct: string;
  desiredMarginPct: string;
};

export type MoneyFieldName = 'variableCost' | 'fixedCostShare' | 'otherCosts';
export type PercentFieldName =
  | 'paymentFeePct'
  | 'commissionPct'
  | 'otherTaxesPct'
  | 'desiredMarginPct';

export const MONEY_FIELDS: readonly MoneyFieldName[] = [
  'variableCost',
  'fixedCostShare',
  'otherCosts',
];

export const PERCENT_FIELDS: readonly PercentFieldName[] = [
  'paymentFeePct',
  'commissionPct',
  'otherTaxesPct',
  'desiredMarginPct',
];

/**
 * Opens with a worked default rather than an empty form, so the first thing
 * the user sees is the tool doing its job. The numbers are deliberately round
 * and obviously illustrative, not a claim about any real business.
 */
export const DEFAULT_FORM: FormState = {
  name: '',
  currency: 'BRL',
  variableCost: '20.00',
  fixedCostShare: '8.00',
  otherCosts: '2.00',
  paymentFeePct: '3',
  commissionPct: '12',
  otherTaxesPct: '5',
  desiredMarginPct: '30',
};

export const EMPTY_FORM: FormState = {
  ...DEFAULT_FORM,
  name: '',
  variableCost: '',
  fixedCostShare: '',
  otherCosts: '',
  paymentFeePct: '',
  commissionPct: '',
  otherTaxesPct: '',
  desiredMarginPct: '',
};

/** An empty field reads as zero; that is what "I have no other costs" means. */
function cents(raw: string): number {
  if (raw.trim() === '') return 0;
  return inputToCents(raw) ?? 0;
}

function percent(raw: string): number {
  if (raw.trim() === '') return 0;
  return parsePercent(raw) ?? 0;
}

export function toPricingInput(form: FormState): PricingInput {
  return {
    name: form.name.trim(),
    currency: form.currency,
    variableCost: cents(form.variableCost),
    fixedCostShare: cents(form.fixedCostShare),
    otherCosts: cents(form.otherCosts),
    paymentFeePct: percent(form.paymentFeePct),
    commissionPct: percent(form.commissionPct),
    otherTaxesPct: percent(form.otherTaxesPct),
    desiredMarginPct: percent(form.desiredMarginPct),
  };
}

/**
 * Per-field validation, separate from the engine's own problems: this catches
 * what cannot be a cost or a rate at all, before any arithmetic runs.
 */
export function fieldError(form: FormState, name: keyof FormState): string | null {
  if (name === 'name' || name === 'currency') return null;
  const raw = form[name];
  if (raw.trim() === '') return null;

  const isMoney = (MONEY_FIELDS as readonly string[]).includes(name);
  const parsed = isMoney ? inputToCents(raw) : parsePercent(raw);

  if (parsed === null) return 'Enter a number.';
  if (parsed < 0) return isMoney ? 'A cost cannot be negative.' : 'A rate cannot be negative.';
  if (!isMoney && parsed > 100) return 'Enter a rate of 100% or less.';
  return null;
}

export function formErrors(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  for (const name of [...MONEY_FIELDS, ...PERCENT_FIELDS]) {
    const error = fieldError(form, name);
    if (error) errors[name] = error;
  }
  return errors;
}

/** True when there is enough to price: something has to cost something. */
export function hasCost(form: FormState): boolean {
  const input = toPricingInput(form);
  return input.variableCost + input.fixedCostShare + input.otherCosts > 0;
}
