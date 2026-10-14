import type { Cents } from '@/types/pricing';
import type { HistoryEntry } from '@/lib/historyStore';
import { calculate } from '@/domain/pricing';

/**
 * CSV export.
 *
 * Money is written as a plain decimal with a dot, not as a formatted
 * currency string: the point of the export is that a spreadsheet can add the
 * column up. The currency is its own column instead.
 */

export const CSV_COLUMNS = [
  'saved_at',
  'name',
  'currency',
  'variable_cost',
  'fixed_cost_share',
  'other_costs',
  'payment_fee_pct',
  'commission_pct',
  'other_taxes_pct',
  'desired_margin_pct',
  'total_cost',
  'suggested_price',
  'break_even_price',
  'net_profit',
  'effective_margin_pct',
  'markup_pct',
] as const;

const amount = (cents: Cents): string => (cents / 100).toFixed(2);
const rate = (pct: number): string => pct.toFixed(4);

/**
 * A cell beginning with =, +, - or @ is executed as a formula when the file
 * is opened in a spreadsheet. Anything the user typed gets a leading
 * apostrophe so a product name can never become code.
 */
function neutralize(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function escapeCell(value: string): string {
  const safe = neutralize(value);
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Rows the engine can no longer price are skipped rather than exported with
 * blank figures. The count of what was written is returned so the UI can say
 * so instead of quietly dropping them.
 */
export function buildCsv(entries: HistoryEntry[]): { csv: string; rows: number; skipped: number } {
  const lines: string[] = [CSV_COLUMNS.join(',')];
  let skipped = 0;

  for (const entry of entries) {
    const result = calculate(entry.input);
    if (!result) {
      skipped += 1;
      continue;
    }

    const { input } = entry;
    lines.push(
      [
        escapeCell(entry.savedAt),
        escapeCell(entry.name),
        escapeCell(input.currency),
        amount(input.variableCost),
        amount(input.fixedCostShare),
        amount(input.otherCosts),
        rate(input.paymentFeePct),
        rate(input.commissionPct),
        rate(input.otherTaxesPct),
        rate(input.desiredMarginPct),
        amount(result.totalCost),
        amount(result.suggestedPrice),
        amount(result.breakEvenPrice),
        amount(result.netProfit),
        rate(result.effectiveMarginPct),
        result.markupPct === null ? '' : rate(result.markupPct),
      ].join(','),
    );
  }

  // CRLF: the line ending every spreadsheet reads without being told.
  return { csv: lines.join('\r\n') + '\r\n', rows: lines.length - 1, skipped };
}
