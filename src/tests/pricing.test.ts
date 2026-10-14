import { describe, expect, it } from 'vitest';
import {
  applyDiscount,
  buildScenarios,
  calculate,
  engineProblems,
  totalCost,
  totalRatePct,
} from '@/domain/pricing';
import type { PricingInput } from '@/types/pricing';

/**
 * A worked example with round numbers, so every expectation below can be
 * checked by hand:
 *
 *   C = 20.00 + 5.00 + 5.00            = 30.00
 *   t = 3% + 7% + 10%                  = 20%
 *   m = 30%
 *   P   = 30 / (1 - 0.20 - 0.30)       = 60.00
 *   Peq = 30 / (1 - 0.20)              = 37.50
 *   rates        = 60 x 0.20           = 12.00
 *   after rates  = 60 x 0.80           = 48.00
 *   profit       = 48 - 30             = 18.00
 *   margin       = 18 / 60             = 30%
 *   markup       = (60 / 30) - 1       = 100%
 */
const base: PricingInput = {
  name: 'Worked example',
  currency: 'BRL',
  variableCost: 2000,
  fixedCostShare: 500,
  otherCosts: 500,
  paymentFeePct: 3,
  commissionPct: 7,
  otherTaxesPct: 10,
  desiredMarginPct: 30,
};

describe('1. cost total', () => {
  it('adds every unit cost', () => {
    expect(totalCost(base)).toBe(3000);
  });

  it('treats a negative cost as zero rather than a credit', () => {
    expect(totalCost({ ...base, otherCosts: -9999 })).toBe(2500);
  });
});

describe('2. rate total', () => {
  it('adds every rate charged on the price', () => {
    expect(totalRatePct(base)).toBe(20);
  });
});

describe('3. break-even price', () => {
  it('is the price at which profit is exactly zero', () => {
    expect(calculate(base)!.breakEvenPrice).toBe(3750);
  });

  it('leaves no profit when sold at it', () => {
    const atBreakEven = calculate({ ...base, desiredMarginPct: 0 })!;
    expect(atBreakEven.suggestedPrice).toBe(3750);
    expect(atBreakEven.netProfit).toBe(0);
  });
});

describe('4. target margin', () => {
  it('produces the price that delivers it', () => {
    expect(calculate(base)!.suggestedPrice).toBe(6000);
  });

  it('reports the margin it actually delivers', () => {
    expect(calculate(base)!.effectiveMarginPct).toBeCloseTo(30, 6);
  });
});

describe('5. markup', () => {
  it('is the step from cost to price', () => {
    expect(calculate(base)!.markupPct).toBeCloseTo(100, 6);
  });
});

describe('6. profit and revenue after rates', () => {
  it('takes the rates off the price before the cost', () => {
    const r = calculate(base)!;
    expect(r.taxAmount).toBe(1200);
    expect(r.revenueAfterRates).toBe(4800);
    expect(r.netProfit).toBe(1800);
  });
});

describe('7. rounding', () => {
  // C = 10.00, t = 10%, m = 25%  ->  10 / 0.65 = 15.3846...
  const awkward: PricingInput = {
    ...base,
    variableCost: 1000,
    fixedCostShare: 0,
    otherCosts: 0,
    paymentFeePct: 10,
    commissionPct: 0,
    otherTaxesPct: 0,
    desiredMarginPct: 25,
  };

  it('rounds the price up to the cent, never down', () => {
    expect(calculate(awkward)!.suggestedPrice).toBe(1539);
  });

  it('never lands under the margin that was asked for', () => {
    const r = calculate(awkward)!;
    expect(r.effectiveMarginPct).toBeGreaterThanOrEqual(25);
  });

  it('keeps every money value an integer number of cents', () => {
    const r = calculate(awkward)!;
    for (const value of [r.suggestedPrice, r.breakEvenPrice, r.taxAmount, r.revenueAfterRates, r.netProfit]) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe('8. zero rates', () => {
  it('prices from the margin alone', () => {
    // 10.00 / (1 - 0 - 0.20) = 12.50
    const r = calculate({ ...base, variableCost: 1000, fixedCostShare: 0, otherCosts: 0, paymentFeePct: 0, commissionPct: 0, otherTaxesPct: 0, desiredMarginPct: 20 })!;
    expect(r.suggestedPrice).toBe(1250);
    expect(r.taxAmount).toBe(0);
    expect(r.breakEvenPrice).toBe(1000);
  });
});

describe('9. zero margin', () => {
  it('prices at break-even and says the profit is zero', () => {
    const r = calculate({ ...base, desiredMarginPct: 0 })!;
    expect(r.suggestedPrice).toBe(r.breakEvenPrice);
    expect(r.netProfit).toBe(0);
    expect(r.effectiveMarginPct).toBe(0);
  });
});

describe('10. impossible margin', () => {
  it('refuses a margin the rates leave no room for', () => {
    const problems = engineProblems({ ...base, paymentFeePct: 50, commissionPct: 0, otherTaxesPct: 0, desiredMarginPct: 60 });
    expect(problems[0]?.code).toBe('margin-impossible');
    expect(calculate({ ...base, paymentFeePct: 50, commissionPct: 0, otherTaxesPct: 0, desiredMarginPct: 60 })).toBeNull();
  });

  it('refuses rates of 100% or more outright', () => {
    const problems = engineProblems({ ...base, paymentFeePct: 100, commissionPct: 0, otherTaxesPct: 0 });
    expect(problems[0]?.code).toBe('rates-too-high');
  });

  it('explains which one is the problem rather than failing silently', () => {
    expect(engineProblems({ ...base, paymentFeePct: 100 })[0]?.message).toMatch(/rates/i);
  });
});

describe('11. zero cost', () => {
  it('produces no price, no profit and no markup, never NaN', () => {
    const r = calculate({ ...base, variableCost: 0, fixedCostShare: 0, otherCosts: 0 })!;
    expect(r.suggestedPrice).toBe(0);
    expect(r.netProfit).toBe(0);
    expect(r.markupPct).toBeNull();
    expect(Number.isNaN(r.effectiveMarginPct)).toBe(false);
  });
});

describe('12. invalid percentages', () => {
  it('treats a negative rate as zero', () => {
    expect(totalRatePct({ ...base, commissionPct: -40 })).toBe(13);
  });

  it('treats a negative margin as zero', () => {
    const r = calculate({ ...base, desiredMarginPct: -30 })!;
    expect(r.suggestedPrice).toBe(r.breakEvenPrice);
  });

  it('never returns a non-finite number anywhere', () => {
    const r = calculate({ ...base, variableCost: 1e12 })!;
    for (const value of Object.values(r)) {
      if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
    }
  });
});

describe('13. a discount that still profits', () => {
  it('recalculates everything and reports the profit it cost', () => {
    const r = calculate(base)!;
    const d = applyDiscount(base, r, 10)!;
    // 60.00 less 10% = 54.00; after 20% rates 43.20; less 30.00 cost = 13.20
    expect(d.finalPrice).toBe(5400);
    expect(d.revenueAfterRates).toBe(4320);
    expect(d.netProfit).toBe(1320);
    expect(d.profitDelta).toBe(-480);
    expect(d.outcome).toBe('profit');
  });
});

describe('14. a discount that loses money', () => {
  it('says so instead of showing a smaller profit', () => {
    const r = calculate(base)!;
    const d = applyDiscount(base, r, 50)!;
    // 30.00 after discount; after rates 24.00; less 30.00 cost = -6.00
    expect(d.finalPrice).toBe(3000);
    expect(d.netProfit).toBe(-600);
    expect(d.outcome).toBe('loss');
  });

  it('identifies the exact discount that breaks even', () => {
    const r = calculate(base)!;
    // Break-even price is 37.50, which is 37.5% off 60.00.
    const d = applyDiscount(base, r, 37.5)!;
    expect(d.finalPrice).toBe(3750);
    expect(d.netProfit).toBe(0);
    expect(d.outcome).toBe('break-even');
  });

  it('clamps a discount over 100% rather than paying the customer', () => {
    const r = calculate(base)!;
    const d = applyDiscount(base, r, 150)!;
    expect(d.discountPct).toBe(100);
    expect(d.finalPrice).toBe(0);
  });

  it('ignores a discount that is not a number', () => {
    const r = calculate(base)!;
    expect(applyDiscount(base, r, Number.NaN)).toBeNull();
  });
});

describe('15. scenarios', () => {
  const scenarios = buildScenarios(base);

  it('offers three, each with its own margin stated', () => {
    expect(scenarios.map((s) => s.id)).toEqual(['conservative', 'base', 'aggressive']);
    expect(scenarios.map((s) => s.marginPct)).toEqual([35, 30, 25]);
  });

  it('prices each one differently, with real numbers behind the labels', () => {
    const prices = scenarios.map((s) => s.result.suggestedPrice);
    expect(new Set(prices).size).toBe(3);
    // A higher margin asks a higher price.
    expect(prices[0]).toBeGreaterThan(prices[1]);
    expect(prices[1]).toBeGreaterThan(prices[2]);
  });

  it('keeps the base scenario identical to the main calculation', () => {
    expect(scenarios[1].result.suggestedPrice).toBe(calculate(base)!.suggestedPrice);
  });

  it('drops a scenario the rates make impossible rather than inventing one', () => {
    // Rates at 70% leave no room for a 35% conservative margin.
    const tight = buildScenarios({ ...base, paymentFeePct: 70, commissionPct: 0, otherTaxesPct: 0, desiredMarginPct: 30 });
    expect(tight.length).toBeLessThan(3);
  });
});
