import type { PollutionRecord } from '../types/pollution';
import { downloadAsCsv, downloadAsExcel } from '../utils/export';

interface ExportButtonsProps {
  records: PollutionRecord[];
}

export function ExportButtons({ records }: ExportButtonsProps) {
  const disabled = records.length === 0;

  return (
    <div className="export-buttons">
      <button type="button" disabled={disabled} onClick={() => downloadAsCsv(records, 'karnataka-pollution-data.csv')}>
        Export CSV
      </button>
      <button type="button" disabled={disabled} onClick={() => downloadAsExcel(records, 'karnataka-pollution-data.xlsx')}>
        Export Excel
      </button>
    </div>
  );
}
