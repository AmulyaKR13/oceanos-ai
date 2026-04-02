import Papa from 'papaparse';
import { formatISO, subDays } from 'date-fns';

import { CITY_POINTS } from '../../config/karnatakaLocations';
import type { PollutionRecord, DatasetDescriptor } from '../../types/pollution';
import { safeNumber } from '../../utils/text';

interface LocalAqiRow {
  T?: string;
  TM?: string;
  Tm?: string;
  SLP?: string;
  H?: string;
  VV?: string;
  V?: string;
  VM?: string;
  'PM 2.5'?: string;
}

export function parseAqiCsv(content: string, descriptor: DatasetDescriptor): PollutionRecord[] {
  const parsed = Papa.parse<LocalAqiRow>(content, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .map((row: LocalAqiRow, index: number): PollutionRecord | null => {
      const pm25 = safeNumber(row['PM 2.5']);
      if (pm25 === null) {
        return null;
      }

      const station = CITY_POINTS.Bengaluru;
      const date = formatISO(subDays(new Date(), parsed.data.length - index), {
        representation: 'date',
      });

      return {
        id: `${descriptor.id}-${index}`,
        category: descriptor.category,
        pollutionType: descriptor.pollutionType,
        name: 'Bengaluru Local AQI Station',
        district: station.district,
        city: station.city,
        latitude: station.latitude,
        longitude: station.longitude,
        date,
        source: descriptor.source,
        measurements: {
          pm25,
          temperatureAvg: safeNumber(row.T),
          temperatureMax: safeNumber(row.TM),
          temperatureMin: safeNumber(row.Tm),
          seaLevelPressure: safeNumber(row.SLP),
          humidity: safeNumber(row.H),
          visibility: safeNumber(row.VV),
          windAvg: safeNumber(row.V),
          windMax: safeNumber(row.VM),
        },
      } satisfies PollutionRecord;
    })
    .filter((record: PollutionRecord | null): record is PollutionRecord => record !== null);
}
