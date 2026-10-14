import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearEntries,
  getSnapshot,
  removeEntry,
  resetHistoryStore,
  saveEntry,
  startSync,
  subscribe,
} from '@/lib/historyStore';
import type { PricingInput } from '@/types/pricing';

const KEY = 'pricepilot.history.v1';

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

beforeEach(() => {
  window.localStorage.clear();
  resetHistoryStore();
});

describe('historyStore', () => {
  it('starts empty', () => {
    expect(getSnapshot().entries).toEqual([]);
  });

  it('keeps the newest entry first', () => {
    saveEntry('first', input);
    saveEntry('second', input);
    expect(getSnapshot().entries.map((e) => e.name)).toEqual(['second', 'first']);
  });

  it('gives every entry its own id', () => {
    saveEntry('a', input);
    saveEntry('b', input);
    const [one, two] = getSnapshot().entries;
    expect(one!.id).not.toBe(two!.id);
  });

  it('survives a reload', () => {
    saveEntry('kept', input);
    resetSnapshotOnly();
    expect(getSnapshot().entries.map((e) => e.name)).toEqual(['kept']);
  });

  it('removes one entry and leaves the rest', () => {
    saveEntry('a', input);
    saveEntry('b', input);
    removeEntry(getSnapshot().entries[0]!.id);
    expect(getSnapshot().entries.map((e) => e.name)).toEqual(['a']);
  });

  it('clears everything', () => {
    saveEntry('a', input);
    clearEntries();
    expect(getSnapshot().entries).toEqual([]);
  });

  it('caps the list so one profile cannot grow forever', () => {
    for (let i = 0; i < 60; i += 1) saveEntry(`entry ${i}`, input);
    expect(getSnapshot().entries).toHaveLength(50);
    expect(getSnapshot().entries[0]!.name).toBe('entry 59');
  });

  it('notifies a subscriber on every change', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    saveEntry('a', input);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    saveEntry('b', input);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('ignores a stored blob that is not a list of entries', () => {
    window.localStorage.setItem(KEY, '{"not":"an array"}');
    resetSnapshotOnly();
    expect(getSnapshot().entries).toEqual([]);
  });

  it('ignores stored items missing the fields an entry must have', () => {
    window.localStorage.setItem(KEY, JSON.stringify([{ id: 'x' }, 42, null]));
    resetSnapshotOnly();
    expect(getSnapshot().entries).toEqual([]);
  });

  it('ignores a stored blob that is not JSON at all', () => {
    window.localStorage.setItem(KEY, 'not json');
    resetSnapshotOnly();
    expect(getSnapshot().entries).toEqual([]);
  });

  it('picks up a change another tab made', () => {
    const stop = startSync();
    const other = [
      { id: 'x', savedAt: '2026-10-14T12:00:00.000Z', name: 'from another tab', input },
    ];
    window.localStorage.setItem(KEY, JSON.stringify(other));
    window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
    expect(getSnapshot().entries.map((e) => e.name)).toEqual(['from another tab']);
    stop();
  });

  it('reports storage as unavailable when the browser refuses to read it', () => {
    // The spy goes up after the reset, so the store's own first read is the
    // one that throws rather than the helper's.
    resetHistoryStore();
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(getSnapshot().available).toBe(false);
    getItem.mockRestore();
  });

  it('keeps an entry in memory when the browser refuses to write it', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    saveEntry('not persisted', input);
    expect(getSnapshot().entries.map((e) => e.name)).toEqual(['not persisted']);
    expect(getSnapshot().available).toBe(false);
    setItem.mockRestore();
  });
});

/**
 * Simulates a fresh page load: drop the in-memory cache but keep what is on
 * disk. resetHistoryStore() also clears disk, which is the wrong tool here.
 */
function resetSnapshotOnly() {
  const stored = window.localStorage.getItem(KEY);
  resetHistoryStore();
  if (stored !== null) window.localStorage.setItem(KEY, stored);
  // getSnapshot() reloads from disk because resetHistoryStore cleared the flag.
}
