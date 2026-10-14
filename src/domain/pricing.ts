import type {
  Cents,
  DiscountResult,
  PricingInput,
  PricingResult,
  Scenario,
} from '@/types/pricing';

/**
 * The pricing engine.
 *
 * Every function here is pure and takes integer cents. Prices are rounded
 * *up* to the cent: rounding down would hand back a price that delivers
 * slightly less than the margin that was asked for, which is the one direction
 * a pricing tool must never err in.
 */

/** Guards every number that reaches arithmetic. */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function ceilToCent(value: number): Cents {
  if (!Number.isFinite(value) || value <= 0) return 0;
  // A float like 2399.9999999997 is 2400 in intent; nudge before ceiling so
  // binary representation does not add a spurious cent.
  const corrected = Math.round(value * 1e6) / 1e6;
  return Math.ceil(corrected);
}

function roundToCent(value: number): Cents {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

/** C: every unit cost added together. */
export function totalCost(input: PricingInput): Cents {
  return (
    Math.max(0, input.variableCost) +
    Math.max(0, input.fixedCostShare) +
    Math.max(0, input.otherCosts)
  );
}

/** t, as a percentage: every rate charged as a share of the price. */
export function totalRatePct(input: PricingInput): number {
  return (
    Math.max(0, input.paymentFeePct) +
    Math.max(0, input.commissionPct) +
    Math.max(0, input.otherTaxesPct)
  );
}

export type EngineProblem =
  | { code: 'rates-too-high'; message: string }
  | { code: 'margin-impossible'; message: string };

/**
 * Why a price cannot be produced. The two denominators are the only things
 * that can make this unsolvable, and each has its own explanation.
 */
export function engineProblems(input: PricingInput): EngineProblem[] {
  const t = totalRatePct(input) / 100;
  const m = Math.max(0, input.desiredMarginPct) / 100;
  const problems: EngineProblem[] = [];

  if (1 - t <= 0) {
    problems.push({
      code: 'rates-too-high',
      message:
        'The rates add up to 100% or more of the price, so no price covers them. Nothing is left over at any price.',
    });
    return problems;
  }

  if (1 - t - m <= 0) {
    problems.push({
      code: 'margin-impossible',
      message: `Rates take ${(t * 100).toFixed(2)}% of the price, so a net margin of ${(m * 100).toFixed(2)}% leaves nothing for cost. Lower the margin or the rates.`,
    });
  }

  return problems;
}

export function calculate(input: PricingInput): PricingResult | null {
  if (engineProblems(input).length > 0) return null;

  const C = totalCost(input);
  const ratePct = totalRatePct(input);
  const t = ratePct / 100;
  const m = Math.max(0, input.desiredMarginPct) / 100;

  // P = C / (1 - t - m)
  const suggestedPrice = ceilToCent(C / (1 - t - m));
  // Peq = C / (1 - t)
  const breakEvenPrice = ceilToCent(C / (1 - t));

  const taxAmount = roundToCent(suggestedPrice * t);
  const revenueAfterRates = roundToCent(suggestedPrice * (1 - t));
  const netProfit = revenueAfterRates - C;

  return {
    totalCost: C,
    totalRatePct: ratePct,
    suggestedPrice,
    breakEvenPrice,
    taxAmount,
    revenueAfterRates,
    netProfit,
    // A zero price would make this a division by zero; report zero instead.
    effectiveMarginPct: suggestedPrice > 0 ? (netProfit / suggestedPrice) * 100 : 0,
    // Nothing to mark up when there is no cost.
    markupPct: C > 0 && suggestedPrice > 0 ? (suggestedPrice / C - 1) * 100 : null,
  };
}

/** Applies a percentage discount and says what it does to the profit. */
export function applyDiscount(
  result: PricingResult,
  discountPct: number,
): DiscountResult | null {
  if (!isFiniteNumber(discountPct)) return null;

  const d = Math.min(100, Math.max(0, discountPct)) / 100;
  const t = result.totalRatePct / 100;

  const finalPrice = roundToCent(result.suggestedPrice * (1 - d));
  const taxAmount = roundToCent(finalPrice * t);
  const revenueAfterRates = roundToCent(finalPrice * (1 - t));
  const netProfit = revenueAfterRates - result.totalCost;

  return {
    discountPct: d * 100,
    finalPrice,
    taxAmount,
    revenueAfterRates,
    netProfit,
    effectiveMarginPct: finalPrice > 0 ? (netProfit / finalPrice) * 100 : 0,
    profitDelta: netProfit - result.netProfit,
    outcome: netProfit > 0 ? 'profit' : netProfit === 0 ? 'break-even' : 'loss',
  };
}

/** How far each scenario moves the desired margin, in percentage points. */
export const SCENARIO_SHIFTS = { conservative: 5, base: 0, aggressive: -5 } as const;

/**
 * Three priced scenarios off the same costs, differing only in the margin
 * asked for. The margin is reported alongside each one, so the comparison is
 * never a label without a number behind it.
 */
export function buildScenarios(input: PricingInput): Scenario[] {
  const defs: { id: Scenario['id']; label: string }[] = [
    { id: 'conservative', label: 'Conservative' },
    { id: 'base', label: 'Base' },
    { id: 'aggressive', label: 'Aggressive' },
  ];

  const scenarios: Scenario[] = [];
  for (const def of defs) {
    const marginPct = Math.max(0, input.desiredMarginPct + SCENARIO_SHIFTS[def.id]);
    const result = calculate({ ...input, desiredMarginPct: marginPct });
    if (result) scenarios.push({ id: def.id, label: def.label, marginPct, result });
  }
  return scenarios;
}
