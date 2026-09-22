import { storage, keys } from './storage';

/**
 * The app never blocks on the network. When a write cannot reach Supabase it
 * lands in this queue (hooks/useGroup) and the UI says so — the streak is
 * already counted locally, so only the group panel degrades.
 */
export function pendingSyncCount(): number {
  const raw = storage.getString(keys.syncQueue);
  if (!raw) return 0;
  try {
    const queue = JSON.parse(raw);
    return Array.isArray(queue) ? queue.length : 0;
  } catch {
    return 0;
  }
}

export const isOffline = () => pendingSyncCount() > 0;
