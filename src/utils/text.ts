export function normalizeSpace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

export function normalizeLakeKey(name: string): string {
  return normalizeSpace(name).toUpperCase();
}

export function safeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const match = value.match(/-?\d+(?:\.\d+)?/);
    if (!match) {
      return null;
    }
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
