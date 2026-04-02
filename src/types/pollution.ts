export type PollutionCategory = 'lake-quality' | 'aqi' | 'online-aqi' | 'other';

export interface MeasurementMap {
  [key: string]: number | string | null | undefined;
}

export interface PollutionRecord {
  id: string;
  category: PollutionCategory;
  pollutionType: 'water' | 'air' | 'mixed';
  name: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  date: string;
  source: string;
  measurements: MeasurementMap;
  rawLine?: string;
}

export interface FilterState {
  category: 'all' | PollutionCategory;
  district: string;
  city: string;
  search: string;
  startDate: string;
  endDate: string;
}

export interface DatasetDescriptor {
  id: string;
  fileName: string;
  source: string;
  category: PollutionCategory;
  pollutionType: 'water' | 'air' | 'mixed';
  parser: 'lake-csv' | 'aqi-csv';
}
