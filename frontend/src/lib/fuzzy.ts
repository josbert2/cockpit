/**
 * Fuzzy match liviano: cada char de query debe aparecer en haystack en orden.
 * Score más alto si los chars están más juntos. 0 = sin match.
 */
export function fuzzyScore(haystack: string, query: string): number {
  if (!query) return 1;
  const h = haystack.toLowerCase();
  const q = query.toLowerCase();

  let score = 0;
  let lastIdx = -1;
  let consecutive = 0;

  for (let i = 0; i < q.length; i++) {
    const idx = h.indexOf(q[i], lastIdx + 1);
    if (idx === -1) return 0;

    if (idx === lastIdx + 1) {
      consecutive++;
      score += 5 + consecutive;
    } else {
      consecutive = 0;
      score += Math.max(1, 5 - (idx - lastIdx));
    }

    if (idx === 0) score += 10;
    if (idx > 0 && /[\s_-]/.test(h[idx - 1])) score += 5;

    lastIdx = idx;
  }

  // Bonus para haystack más corto (matches más relevantes)
  score += Math.max(0, 20 - h.length);
  return score;
}

export function fuzzyFilter<T>(
  items: T[],
  query: string,
  getKey: (item: T) => string
): Array<T & { __score: number }> {
  if (!query) return items.map((i) => ({ ...i, __score: 0 }));
  return items
    .map((i) => ({ ...i, __score: fuzzyScore(getKey(i), query) }))
    .filter((i) => i.__score > 0)
    .sort((a, b) => b.__score - a.__score);
}
