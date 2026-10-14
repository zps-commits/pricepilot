/** Money is an integer number of cents. */
export type Cents = number;

export type CurrencyCode = 'BRL' | 'USD';

/**
 * What the user types in.
 *
 * Costs are cents. Rates are percentages of the *sale price*, which is the
 * distinction that makes this calculator different from a markup table: a
 * card fee of 3% is 3% of whatever you end up charging, so it cannot be added
 * to the cost before the price is known.
 *
 * A fee that is a fixed amount per sale is not a rate. It belongs in
 * `otherCosts`, and the interface says so.
 */
export type PricingInput = {
  name: string;
  currency: CurrencyCode;
  variableCost: Cents;
  fixedCostShare: Cents;
  otherCosts: Cents;
  paymentFeePct: number;
  commissionPct: number;
  otherTaxesPct: number;
  desiredMarginPct: number;
};

export type PricingResult = {
  /** C: every unit cost added together. */
  totalCost: Cents;
  /** t, as a percentage: every rate charged on the price. */
  totalRatePct: number;
  /** P: the price that delivers the desired margin, rounded up to the cent. */
  suggestedPrice: Cents;
  /** The price at which profit is exactly zero. */
  breakEvenPrice: Cents;
  /** What the rates take at the suggested price. */
  taxAmount: Cents;
  /** P(1 - t). */
  revenueAfterRates: Cents;
  /** P(1 - t) - C. */
  netProfit: Cents;
  /** The margin actually delivered, which rounding can nudge above the target. */
  effectiveMarginPct: number;
  /** ((P / C) - 1) x 100. Null when there is no cost to mark up. */
  markupPct: number | null;
};

export type DiscountResult = {
  discountPct: number;
  finalPrice: Cents;
  taxAmount: Cents;
  revenueAfterRates: Cents;
  netProfit: Cents;
  effectiveMarginPct: number;
  /** Change in profit against the undiscounted price. Negative is a loss of profit. */
  profitDelta: Cents;
  outcome: 'profit' | 'break-even' | 'loss';
};

export type Scenario = {
  id: 'conservative' | 'base' | 'aggressive';
  /** Stated in the table, so the comparison is never a label without a number. */
  marginPct: number;
  result: PricingResult;
};
