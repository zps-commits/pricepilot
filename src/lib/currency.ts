import type { Cents, CurrencyCode } from '@/types/pricing';

/** Locale per currency. Switching currency relabels; it never converts. */
const LOCALES: Record<CurrencyCode, string> = { BRL: 'pt-BR', USD: 'en-US' };

export function formatMoney(cents: Cents, currency: CurrencyCode): string {
  return new Intl.NumberFormat(LOCALES[currency], { style: 'currency', currency }).format(cents / 100);
}

export function formatPercent(value: number, currency: CurrencyCode, digits = 2): string {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value / 100);
}

/** Cents as a plain decimal string for an input, without a currency symbol. */
export function centsToInput(cents: Cents): string {
  return (cents / 100).toFixed(2);
}

/**
 * Reads what someone typed into cents. Accepts both decimal separators,
 * because the same person uses "12,50" and "12.50" without thinking about it.
 */
export function inputToCents(raw: string): Cents | null {
  const cleaned = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return null;
  if (!/^-?\d*\.?\d*$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export function parsePercent(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '').replace(',', '.').replace('%', '');
  if (cleaned === '') return null;
  if (!/^-?\d*\.?\d*$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
