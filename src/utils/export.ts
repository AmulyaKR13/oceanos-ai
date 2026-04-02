import * as XLSX from 'xlsx';

import type { PollutionRecord } from '../types/pollution';

function flattenRecord(record: PollutionRecord) {
  return {
    id: record.id,
    category: record.category,
    pollutionType: record.pollutionType,
    name: record.name,
    district: record.district,
    city: record.city,
    latitude: record.latitude,
    longitude: record.longitude,
    date: record.date,
    source: record.source,
    ...record.measurements,
  };
}

export function downloadAsCsv(records: PollutionRecord[], fileName: string): void {
  const worksheet = XLSX.utils.json_to_sheet(records.map(flattenRecord));
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadAsExcel(records: PollutionRecord[], fileName: string): void {
  const worksheet = XLSX.utils.json_to_sheet(records.map(flattenRecord));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PollutionData');
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}
