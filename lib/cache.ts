import { AnalysisResult } from "@/types/analysis";

const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 1000;

interface CacheEntry {
  data: AnalysisResult;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function getCached(username: string): AnalysisResult | null {
  const key = username.toLowerCase();
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCached(username: string, data: AnalysisResult): void {
  const key = username.toLowerCase();
  if (cache.size >= MAX_CACHE_ENTRIES && !cache.has(key)) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}
