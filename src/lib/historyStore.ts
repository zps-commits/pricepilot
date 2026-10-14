import type { PricingInput } from '@/types/pricing';

const KEY = 'pricepilot.history.v1';
/** Enough to be useful, bounded so one browser profile cannot grow forever. */
const LIMIT = 50;

export type HistoryEntry = {
  id: string;
  /** ISO 8601, in UTC. Rendered in the reader's locale. */
  savedAt: string;
  name: string;
  /**
   * Only the input is stored. The result is recomputed on read, so a change
   * to the engine can never leave a saved row quoting a figure the engine
   * would no longer produce.
   */
  input: PricingInput;
};

type Snapshot = {
  entries: HistoryEntry[];
  /** False when the browser refuses to store anything, which the UI says out loud. */
  available: boolean;
};

const EMPTY: Snapshot = { entries: [], available: true };

let snapshot: Snapshot = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** A stored blob is user data from a previous version; nothing about it is trusted. */
function parse(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(isEntry).slice(0, LIMIT);
  } catch {
    return [];
  }
}

function isEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.savedAt === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.input === 'object' &&
    entry.input !== null
  );
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    snapshot = { entries: parse(window.localStorage.getItem(KEY)), available: true };
  } catch {
    // Private browsing and blocked site data both throw here rather than
    // returning null. The tool still works; it just cannot remember.
    snapshot = { entries: [], available: false };
  }
}

function commit(entries: HistoryEntry[]) {
  const capped = entries.slice(0, LIMIT);
  let available = snapshot.available;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(capped));
  } catch {
    // Out of quota, or storage denied. The entries stay in memory for this
    // session so the action is not silently lost.
    available = false;
  }
  snapshot = { entries: capped, available };
  emit();
}

export function subscribe(listener: () => void): () => void {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Snapshot {
  load();
  return snapshot;
}

/** The server renders an empty history; the real one arrives on hydration. */
export function getServerSnapshot(): Snapshot {
  return EMPTY;
}

export function saveEntry(name: string, input: PricingInput): void {
  load();
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    name,
    input,
  };
  commit([entry, ...snapshot.entries]);
}

export function removeEntry(id: string): void {
  load();
  commit(snapshot.entries.filter((entry) => entry.id !== id));
}

export function clearEntries(): void {
  load();
  commit([]);
}

/**
 * Another tab saved or deleted something. Without this the two tabs disagree
 * until one of them is reloaded.
 */
export function startSync(): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== KEY) return;
    snapshot = { entries: parse(window.localStorage.getItem(KEY)), available: snapshot.available };
    emit();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

/** Test seam: drops both the cache and what is on disk. */
export function resetHistoryStore(): void {
  loaded = false;
  snapshot = EMPTY;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear if storage was never available.
  }
  emit();
}
