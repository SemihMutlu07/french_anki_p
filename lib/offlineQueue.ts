/**
 * Offline queue: stores Supabase writes in localStorage when offline,
 * then batch-syncs when connection returns.
 */
import { createBrowserSupabase } from "./supabase";

const QUEUE_KEY = "fr-tutor-offline-queue";
const MAX_ITEMS = 500;

interface QueueItem {
  id: string;
  table: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

function readQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(items: QueueItem[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

/** Get the number of items waiting to sync. */
export function getQueueSize(): number {
  return readQueue().length;
}

/** Enqueue a write operation for later sync. */
export function enqueue(
  table: string,
  payload: Record<string, unknown>
): void {
  const queue = readQueue();
  const item: QueueItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    table,
    payload,
    createdAt: new Date().toISOString(),
  };

  queue.push(item);

  // Prune oldest if exceeded max
  if (queue.length > MAX_ITEMS) {
    queue.splice(0, queue.length - MAX_ITEMS);
  }

  writeQueue(queue);
}

/** Try to sync all queued items to Supabase. Returns count of synced items. */
export async function syncQueue(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  const supabase = createBrowserSupabase();
  const failed: QueueItem[] = [];
  let synced = 0;

  // Group by table for batch inserts
  const byTable = new Map<string, QueueItem[]>();
  for (const item of queue) {
    const existing = byTable.get(item.table) || [];
    existing.push(item);
    byTable.set(item.table, existing);
  }

  for (const [table, items] of Array.from(byTable.entries())) {
    // For progress table, use upsert; for others, use insert
    const payloads = items.map((i) => i.payload);

    if (table === "progress") {
      const { error } = await supabase
        .from(table)
        .upsert(payloads, { onConflict: "user_id,card_id" });

      if (error) {
        failed.push(...items);
      } else {
        synced += items.length;
      }
    } else {
      const { error } = await supabase.from(table).insert(payloads);

      if (error) {
        failed.push(...items);
      } else {
        synced += items.length;
      }
    }
  }

  writeQueue(failed);
  return synced;
}

/**
 * Smart write: if online, write directly; if offline, queue for later.
 * Returns true if written immediately, false if queued.
 */
export async function offlineAwareInsert(
  table: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!navigator.onLine) {
    enqueue(table, payload);
    return false;
  }

  const supabase = createBrowserSupabase();
  const { error } = await supabase.from(table).insert(payload);

  if (error) {
    // Network might have dropped mid-request
    enqueue(table, payload);
    return false;
  }

  return true;
}

/**
 * Smart upsert: if online, upsert directly; if offline, queue for later.
 */
export async function offlineAwareUpsert(
  table: string,
  payload: Record<string, unknown>,
  onConflict: string
): Promise<boolean> {
  if (!navigator.onLine) {
    enqueue(table, payload);
    return false;
  }

  const supabase = createBrowserSupabase();
  const { error } = await supabase.from(table).upsert(payload, { onConflict });

  if (error) {
    enqueue(table, payload);
    return false;
  }

  return true;
}

// ─── Auto-sync on reconnect ──────────────────────────────────────────
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    syncQueue().catch(() => {
      // Silent fail — will retry next time
    });
  });
}
