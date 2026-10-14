import { useSyncExternalStore } from 'react';
import {
  clearEntries,
  getServerSnapshot,
  getSnapshot,
  removeEntry,
  subscribe,
  type HistoryEntry,
} from '@/lib/historyStore';
import { calculate } from '@/domain/pricing';
import { formatMoney } from '@/lib/currency';
import { t } from '@/lib/i18n';
import type { PricingInput } from '@/types/pricing';

function savedAtLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    date,
  );
}

function Row({
  entry,
  onRestore,
}: {
  entry: HistoryEntry;
  onRestore: (input: PricingInput) => void;
}) {
  // Recomputed, never read back from storage: a figure shown here is one the
  // engine stands behind today.
  const result = calculate(entry.input);

  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{entry.name}</p>
        <p className="mt-0.5 text-xs text-muted">
          {t.history.savedAt} {savedAtLabel(entry.savedAt)}
        </p>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm">
          {result ? formatMoney(result.suggestedPrice, entry.input.currency) : '—'}
        </span>
        <button
          type="button"
          onClick={() => onRestore(entry.input)}
          className="pressable rounded-field border border-line-strong px-2.5 py-1 text-xs font-medium hover:border-muted"
        >
          {t.history.restore}
        </button>
        <button
          type="button"
          onClick={() => removeEntry(entry.id)}
          className="pressable rounded-field px-2.5 py-1 text-xs font-medium text-muted hover:text-negative"
        >
          <span className="sr-only">
            {t.history.remove}: {entry.name}
          </span>
          <span aria-hidden="true">{t.history.remove}</span>
        </button>
      </div>
    </li>
  );
}

export default function HistoryPanel({
  onSave,
  onRestore,
  onExport,
  canSave,
  exportError,
}: {
  onSave: () => void;
  onRestore: (input: PricingInput) => void;
  onExport: () => void;
  /** False until there is a priceable calculation to save. */
  canSave: boolean;
  exportError: string | null;
}) {
  const { entries, available } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <section className="panel mt-8 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">{t.history.legend}</h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="pressable rounded-field bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.history.save}
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={entries.length === 0}
            className="pressable rounded-field border border-line-strong px-3 py-1.5 text-xs font-medium hover:border-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.csv.export}
          </button>
          <button
            type="button"
            onClick={() => {
              // Deleting everything is the one action here that cannot be
              // undone, so it is the one that asks.
              if (window.confirm(t.history.confirmClear)) clearEntries();
            }}
            disabled={entries.length === 0}
            className="pressable rounded-field px-3 py-1.5 text-xs font-medium text-muted hover:text-negative disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.history.clear}
          </button>
        </div>
      </div>

      {!available ? (
        <p className="mt-4 rounded-field border border-line bg-paper p-3 text-xs leading-relaxed text-muted">
          {t.history.unavailable}
        </p>
      ) : null}

      {exportError ? (
        <p role="alert" className="mt-4 text-xs font-medium text-negative">
          {exportError}
        </p>
      ) : null}

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{t.history.empty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {entries.map((entry) => (
            <Row key={entry.id} entry={entry} onRestore={onRestore} />
          ))}
        </ul>
      )}
    </section>
  );
}
