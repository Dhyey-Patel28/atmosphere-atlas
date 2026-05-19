import type { Location } from '../types/weather';

const CACHE_KEY = 'atmosphere-atlas-search-cache';
const MAX_CACHE_ENTRIES = 50;

type SearchCache = Record<string, Location[]>;

function normalizeKey(query: string): string {
  return query.trim().toLowerCase();
}

function readCache(): SearchCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SearchCache) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: SearchCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors — cache is best-effort
  }
}

/**
 * Returns cached Location[] for a query, or null on cache miss.
 */
export function getCache(query: string): Location[] | null {
  const key = normalizeKey(query);
  if (!key) return null;
  const cache = readCache();
  return cache[key] ?? null;
}

/**
 * Stores results for a query. Evicts the oldest entry if the cache is full.
 */
export function setCache(query: string, results: Location[]): void {
  const key = normalizeKey(query);
  if (!key) return;

  const cache = readCache();

  // Evict oldest entries if at limit
  const keys = Object.keys(cache);
  if (keys.length >= MAX_CACHE_ENTRIES && !(key in cache)) {
    // Delete the first (oldest inserted) key
    delete cache[keys[0]];
  }

  cache[key] = results;
  writeCache(cache);
}
