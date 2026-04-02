import type { DatasetDescriptor, PollutionRecord } from '../../types/pollution';
import { inferDateFromFileName } from '../../utils/date';
import { normalizeLakeKey, normalizeSpace } from '../../utils/text';
import { KARNATAKA_CENTER, LAKE_LOCATION_MAP } from '../../config/karnatakaLocations';

const MONTH_PREFIX = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i;

function extractNumbers(text: string): number[] {
  const matches = text.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return matches.map(Number).filter((value) => Number.isFinite(value));
}

function isLikelyDataLine(line: string): boolean {
  if (!line || !/LAKE/i.test(line)) {
    return false;
  }

  return MONTH_PREFIX.test(line) || /\b[A-Z0-9]+\b\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(line);
}

function parseLakeName(line: string): string {
  const cleaned = normalizeSpace(line.replaceAll('"', ''));
  const match = cleaned.match(/([A-Z][A-Z\s()-]*LAKE)/);
  return normalizeSpace(match?.[1] ?? 'Unnamed Lake');
}

export function parseLakeCsv(content: string, descriptor: DatasetDescriptor): PollutionRecord[] {
  const lines = content.split(/\r?\n/).map((line) => normalizeSpace(line.replaceAll('"', '')));
  const fallbackDate = inferDateFromFileName(descriptor.fileName);

  return lines
    .filter(isLikelyDataLine)
    .map((line, index) => {
      const name = parseLakeName(line);
      const location = LAKE_LOCATION_MAP[normalizeLakeKey(name)] ?? KARNATAKA_CENTER;
      const measurements = extractNumbers(line);

      return {
        id: `${descriptor.id}-${index}`,
        category: descriptor.category,
        pollutionType: descriptor.pollutionType,
        name,
        district: location.district,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        date: fallbackDate,
        source: descriptor.source,
        measurements: {
          dissolvedOxygen: measurements[0] ?? null,
          pH: measurements[1] ?? null,
          conductivity: measurements[2] ?? null,
          bod: measurements[3] ?? null,
          nitrateN: measurements[4] ?? null,
          fecalColiform: measurements[5] ?? null,
          totalColiform: measurements[6] ?? null,
          totalDissolvedSolids: measurements[measurements.length - 2] ?? null,
          fluoride: measurements[measurements.length - 1] ?? null,
        },
        rawLine: line,
      } satisfies PollutionRecord;
    });
}
