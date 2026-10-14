/**
 * Every visible string, in one place.
 *
 * The interface ships in English. Keeping the strings here rather than inline
 * is what makes a Portuguese version a matter of adding a second object, not
 * of hunting through components.
 */
export const t = {
  appName: 'PricePilot',
  tagline: 'Work out what to charge, and what is left after the fees.',

  costs: {
    legend: 'Costs per unit',
    name: 'What are you pricing',
    namePlaceholder: 'A dish, an hour, a product',
    variableCost: 'Variable cost',
    variableCostHint: 'Materials, ingredients, anything that scales with each sale.',
    fixedCostShare: 'Share of fixed costs',
    fixedCostShareHint: 'Rent and the rest, divided by how many you expect to sell.',
    otherCosts: 'Other costs',
    otherCostsHint: 'Including any fee charged as a fixed amount per sale.',
  },

  rates: {
    legend: 'Taken off the price',
    hint: 'Percentages of the sale price, not of cost.',
    paymentFee: 'Payment fee',
    commission: 'Commission',
    otherTaxes: 'Other charges on the price',
    margin: 'Net margin you want',
  },

  results: {
    legend: 'Result',
    suggestedPrice: 'Charge',
    breakEven: 'Break-even price',
    breakEvenHint: 'Below this you are paying to make the sale.',
    totalCost: 'Total cost',
    rates: 'Rates take',
    revenueAfterRates: 'Left after rates',
    netProfit: 'Net profit',
    effectiveMargin: 'Effective margin',
    markup: 'Markup',
    noMarkup: 'No cost to mark up',
    empty: 'Fill in a cost to see a price.',
  },

  discount: {
    legend: 'If you discount it',
    label: 'Discount',
    finalPrice: 'You would charge',
    profit: 'Profit becomes',
    change: 'Change in profit',
    outcome: { profit: 'Still profitable', 'break-even': 'Exactly break-even', loss: 'This loses money' },
  },

  scenarios: {
    legend: 'Three ways to price it',
    hint: 'The same costs at three different margins. Each row says which margin it asks for.',
    names: {
      conservative: 'Conservative',
      base: 'Base',
      aggressive: 'Aggressive',
    },
    current: 'Your margin',
    scenario: 'Scenario',
    margin: 'Margin',
    price: 'Price',
    profit: 'Profit',
  },

  history: {
    legend: 'Saved calculations',
    save: 'Save this calculation',
    namePrompt: 'Name',
    restore: 'Restore',
    remove: 'Delete',
    clear: 'Clear all',
    confirmClear: 'Delete every saved calculation?',
    empty: 'Nothing saved yet.',
    unavailable: 'This browser is not letting the page save anything, so calculations will not be kept. Everything else works.',
    savedAt: 'Saved',
  },

  csv: { export: 'Export CSV', failed: 'The file could not be prepared.' },

  currency: { legend: 'Currency', hint: 'Relabels the figures. It does not convert between currencies.' },

  disclaimer:
    'A demonstration tool. It does not account for any specific tax regime and does not replace accounting or tax advice.',
} as const;
