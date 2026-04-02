import { useEffect, useMemo, useState } from 'react';

import type { PollutionRecord } from '../types/pollution';

interface DataTableProps {
  records: PollutionRecord[];
} 

function keyMeasurements(record: PollutionRecord): string {
  return Object.entries(record.measurements)
    .slice(0, 5)
    .map(([key, value]) => `${key}: ${value ?? 'N/A'}`)
    .join(' | ');
}

export function DataTable({ records }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [records.length, pageSize]);

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pageRecords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return records.slice(startIndex, startIndex + pageSize);
  }, [records, safeCurrentPage, pageSize]);

  const fromRow = records.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const toRow = Math.min(safeCurrentPage * pageSize, records.length);

  const prevPage = () => setCurrentPage((page) => Math.max(1, page - 1));
  const nextPage = () => setCurrentPage((page) => Math.min(totalPages, page + 1));

  return (
    <section className="panel table-panel">
      <div className="pagination-toolbar">
        <p className="pagination-summary">
          Showing {fromRow}-{toRow} of {records.length} records
        </p>

        <div className="pagination-controls">
          <label className="page-size-label">
            Rows
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>

          <button type="button" onClick={prevPage} disabled={safeCurrentPage === 1}>
            Previous
          </button>
          <span className="page-indicator">Page {safeCurrentPage} / {totalPages}</span>
          <button type="button" onClick={nextPage} disabled={safeCurrentPage === totalPages}>
            Next
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Pollution Type</th>
              <th>District</th>
              <th>City</th>
              <th>Date</th>
              <th>Key Measurements</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {pageRecords.map((record) => (
              <tr key={`${record.id}-row`}>
                <td>{record.name}</td>
                <td>{record.category}</td>
                <td>{record.pollutionType}</td>
                <td>{record.district}</td>
                <td>{record.city}</td>
                <td>{record.date}</td>
                <td>{keyMeasurements(record)}</td>
                <td>{record.source}</td>
              </tr>
            ))}

            {pageRecords.length === 0 ? (
              <tr>
                <td colSpan={8}>No records found for the selected filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
