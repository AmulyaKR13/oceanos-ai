import { LOCAL_DATASETS } from '../config/datasets';
import { SUPPLEMENTAL_RECORDS } from '../config/supplementalRecords';
import type { DatasetDescriptor, PollutionRecord } from '../types/pollution';
import { parseAqiCsv } from './parsers/aqiParser';
import { parseLakeCsv } from './parsers/lakeParser';
import { fetchOnlineAqi } from './online/fetchOnlineAqi';

async function loadTextFromPublic(fileName: string): Promise<string> {
  const response = await fetch(`/data/${encodeURIComponent(fileName)}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${fileName}`);
  }
  return response.text();
}

function parseByDescriptor(content: string, descriptor: DatasetDescriptor): PollutionRecord[] {
  switch (descriptor.parser) {
    case 'aqi-csv':
      return parseAqiCsv(content, descriptor);
    case 'lake-csv':
      return parseLakeCsv(content, descriptor);
    default:
      return [];
  }
}

export async function loadLocalPollutionData(): Promise<PollutionRecord[]> {
  const records = await Promise.all(
    LOCAL_DATASETS.map(async (descriptor) => {
      const content = await loadTextFromPublic(descriptor.fileName);
      return parseByDescriptor(content, descriptor);
    }),
  );

  return records.flat();
}

export async function loadAllPollutionData(): Promise<PollutionRecord[]> {
  const local = await loadLocalPollutionData();
  const extendedLocal = [...local, ...SUPPLEMENTAL_RECORDS];

  try {
    const online = await fetchOnlineAqi();
    return [...extendedLocal, ...online];
  } catch {
    return extendedLocal;
  }
}
