import type { PollutionRecord } from '../types/pollution';

export interface ChatIntent {
  category: 'aqi' | 'lake' | 'all';
  city: string | null;
  district: string | null;
  wantsRanking: boolean;
  topN: number;
}

function parseTopN(text: string): number {
  const match = text.match(/top\s+(\d+)/i);
  if (!match) {
    return 5;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? Math.min(Math.max(value, 1), 25) : 5;
}

function detectCategory(text: string): 'aqi' | 'lake' | 'all' {
  const hasAqi = /\baqi\b|\bair\b|pm2\.5|pm10/i.test(text);
  const hasLake = /\blake\b|\bwater\b|\bbod\b|dissolved oxygen/i.test(text);

  if (hasAqi && hasLake) {
    return 'all';
  }
  if (hasAqi) {
    return 'aqi';
  }
  if (hasLake) {
    return 'lake';
  }
  return 'all';
}

function detectLocation(
  text: string,
  values: string[],
): string | null {
  const matched = values.find((value) => {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  });

  return matched ?? null;
}

function pollutionScore(record: PollutionRecord): number {
  if (record.pollutionType === 'air') {
    const aqi = record.measurements.usAqi;
    const pm25 = record.measurements.pm25;
    if (typeof aqi === 'number') {
      return aqi;
    }
    if (typeof pm25 === 'number') {
      return pm25 * 2;
    }
    return -Infinity;
  }

  const bod = record.measurements.bod;
  const dissolvedOxygen = record.measurements.dissolvedOxygen;
  const bodScore = typeof bod === 'number' ? bod * 20 : 0;
  const doPenalty = typeof dissolvedOxygen === 'number' ? (10 - dissolvedOxygen) * 8 : 0;
  return bodScore + doPenalty;
}

export function summarizeMetric(record: PollutionRecord): string {
  if (record.pollutionType === 'air') {
    const aqi = record.measurements.usAqi;
    if (typeof aqi === 'number') {
      return `US AQI ${aqi}`;
    }
    const pm25 = record.measurements.pm25;
    if (typeof pm25 === 'number') {
      return `PM2.5 ${pm25}`;
    }
    return 'Air metric unavailable';
  }

  const bod = record.measurements.bod;
  if (typeof bod === 'number') {
    return `BOD ${bod}`;
  }
  const dissolvedOxygen = record.measurements.dissolvedOxygen;
  if (typeof dissolvedOxygen === 'number') {
    return `Dissolved O2 ${dissolvedOxygen}`;
  }
  return 'Water metric unavailable';
}

export function extractIntent(
  userPrompt: string,
  modelResponse: string,
  records: PollutionRecord[],
): ChatIntent {
  const combinedText = `${userPrompt}\n${modelResponse}`;
  const cityOptions = Array.from(new Set(records.map((record) => record.city)));
  const districtOptions = Array.from(new Set(records.map((record) => record.district)));

  return {
    category: detectCategory(combinedText),
    city: detectLocation(combinedText, cityOptions),
    district: detectLocation(combinedText, districtOptions),
    wantsRanking: /\bmost\b|\btop\b|\bhighest\b|\bworst\b|polluted/i.test(combinedText),
    topN: parseTopN(combinedText),
  };
}

export function filterRecordsByIntent(records: PollutionRecord[], intent: ChatIntent): PollutionRecord[] {
  const filtered = records.filter((record) => {
    if (intent.category === 'aqi' && record.pollutionType !== 'air') {
      return false;
    }

    if (intent.category === 'lake' && record.category !== 'lake-quality') {
      return false;
    }

    if (intent.city && record.city.toLowerCase() !== intent.city.toLowerCase()) {
      return false;
    }

    if (intent.district && record.district.toLowerCase() !== intent.district.toLowerCase()) {
      return false;
    }

    return true;
  });

  if (intent.wantsRanking) {
    return [...filtered]
      .sort((left, right) => pollutionScore(right) - pollutionScore(left))
      .slice(0, intent.topN);
  }

  return filtered.slice(0, 30);
}
