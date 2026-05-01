/**
 * translateService.ts
 *
 * Translates dynamic backend content (tips, guides, chat messages, etc.)
 * between English and Sinhala using the GoviConnect backend, which
 * proxies the Google Translate API.
 *
 * Static UI strings are handled by i18next (en.json / si.json) — this
 * service is only for runtime content that comes from the server.
 *
 * Usage:
 *   import { translateText, translateBatch } from '../services/translateService';
 *
 *   const siText = await translateText('Rice is a staple crop.', 'si');
 *   const [t1, t2] = await translateBatch(['Hello', 'Goodbye'], 'si');
 */

import { api } from './api';

// ─── In-memory cache ─────────────────────────────────────────
// Key: `${target}::${text}` → translated string
const _cache = new Map<string, string>();

function cacheKey(text: string, target: string): string {
  return `${target}::${text}`;
}

// ─── Core translator ─────────────────────────────────────────

/**
 * Translate a single string.
 * Returns the original string if translation fails or is unnecessary.
 */
export async function translateText(
  text: string,
  target: 'en' | 'si',
  source?: 'en' | 'si',
): Promise<string> {
  if (!text || !text.trim()) return text;

  const key = cacheKey(text, target);
  if (_cache.has(key)) return _cache.get(key)!;

  try {
    const res = await api.post('/translate', { text, target, source });
    const translated: string = res.data?.translations?.[0] ?? text;
    _cache.set(key, translated);
    return translated;
  } catch {
    return text; // graceful fallback — never crash the UI
  }
}

/**
 * Translate multiple strings in a single API call (more efficient).
 * Returns an array of the same length, preserving order.
 * Strings already in cache are resolved locally (no API call for them).
 */
export async function translateBatch(
  texts: string[],
  target: 'en' | 'si',
  source?: 'en' | 'si',
): Promise<string[]> {
  if (!texts.length) return [];

  // Split into cached and uncached
  const results: string[] = new Array(texts.length);
  const uncachedIndexes: number[] = [];
  const uncachedTexts: string[] = [];

  texts.forEach((text, i) => {
    const key = cacheKey(text, target);
    if (_cache.has(key)) {
      results[i] = _cache.get(key)!;
    } else {
      uncachedIndexes.push(i);
      uncachedTexts.push(text);
    }
  });

  if (uncachedTexts.length > 0) {
    try {
      const res = await api.post('/translate', { text: uncachedTexts, target, source });
      const translations: string[] = res.data?.translations ?? uncachedTexts;
      uncachedIndexes.forEach((origIdx, j) => {
        const translated = translations[j] ?? texts[origIdx];
        _cache.set(cacheKey(texts[origIdx], target), translated);
        results[origIdx] = translated;
      });
    } catch {
      // Fallback: use original texts
      uncachedIndexes.forEach((origIdx) => {
        results[origIdx] = texts[origIdx];
      });
    }
  }

  return results;
}

/**
 * Clear the in-memory translation cache.
 * Call this when the user changes language so stale translations don't persist.
 */
export function clearTranslationCache(): void {
  _cache.clear();
}
