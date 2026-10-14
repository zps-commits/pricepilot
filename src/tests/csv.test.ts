import { describe, expect, it } from 'vitest';
import { buildCsv, CSV_COLUMNS, escapeCell } from '@/domain/csv';
import type { HistoryEntry } from '@/lib/historyStore';
import type { PricingInput } from '@/types/pricing';

const input: PricingInput = {
  name: 'Worked example',
  currency: 'BRL',
  variableCost: 2000,
  fixedCostShare: 800,
  otherCosts: 200,
  paymentFeePct: 3,
  commissionPct: 12,
  otherTaxesPct: 5,
  desiredMarginPct: 30,
};

function entry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'id-1',
    savedAt: '2026-10-14T12:00:00.000Z',
    name: 'Worked example',
    input,
    ...overrides,
  };
}

describe('escapeCell', () => {
  it('leaves an ordinary value alone', () => {
    expect(escapeCell('Margherita')).toBe('Margherita');
  });

  it('quotes a value containing a comma', () => {
    expect(escapeCell('Pizza, large')).toBe('"Pizza, large"');
  });

  it('doubles an embedded quote', () => {
    expect(escapeCell('12" pizza')).toBe('"12"" pizza"');
  });

  it('quotes a value containing a newline', () => {
    expect(escapeCell('two\nlines')).toBe('"two\nlines"');
  });

  it.each(['=1+1', '+1', '-1', '@SUM(A1)'])(
    'neutralizes %s so a spreadsheet cannot execute it',
    (value) => {
      expect(escapeCell(value).replace(/^"|"$/g, '')).toBe(`'${value}`);
    },
  );
});

describe('buildCsv', () => {
  it('writes a header of every declared column', () => {
    const { csv } = buildCsv([]);
    expect(csv.split('\r\n')[0]).toBe(CSV_COLUMNS.join(','));
  });

  it('writes no rows for an empty history', () => {
    expect(buildCsv([]).rows).toBe(0);
  });

  it('writes one row per entry', () => {
    const { rows } = buildCsv([entry(), entry({ id: 'id-2' })]);
    expect(rows).toBe(2);
  });

  it('writes money as a plain decimal a spreadsheet can add up', () => {
    const { csv } = buildCsv([entry()]);
    const row = csv.split('\r\n')[1]!.split(',');
    // Costs 20.00 + 8.00 + 2.00; rates 20%; margin 30% -> price 60.00.
    expect(row[CSV_COLUMNS.indexOf('variable_cost')]).toBe('20.00');
    expect(row[CSV_COLUMNS.indexOf('total_cost')]).toBe('30.00');
    expect(row[CSV_COLUMNS.indexOf('suggested_price')]).toBe('60.00');
    expect(row[CSV_COLUMNS.indexOf('net_profit')]).toBe('18.00');
  });

  it('names the currency in its own column rather than in the figures', () => {
    const { csv } = buildCsv([entry()]);
    const row = csv.split('\r\n')[1]!;
    expect(row).toContain('BRL');
    expect(row).not.toContain('R$');
  });

  it('skips an entry the engine can no longer price, and says how many', () => {
    const impossible = entry({
      id: 'id-3',
      input: { ...input, paymentFeePct: 90, desiredMarginPct: 50 },
    });
    const { rows, skipped } = buildCsv([entry(), impossible]);
    expect(rows).toBe(1);
    expect(skipped).toBe(1);
  });

  it('leaves markup empty rather than writing NaN when there is no cost', () => {
    const free = entry({
      id: 'id-4',
      input: { ...input, variableCost: 0, fixedCostShare: 0, otherCosts: 0 },
    });
    const { csv } = buildCsv([free]);
    const row = csv.split('\r\n')[1]!.split(',');
    expect(row[CSV_COLUMNS.indexOf('markup_pct')]).toBe('');
  });

  it('ends every line with CRLF', () => {
    const { csv } = buildCsv([entry()]);
    expect(csv.endsWith('\r\n')).toBe(true);
    expect(csv.split('\r\n').filter(Boolean)).toHaveLength(2);
  });
});
