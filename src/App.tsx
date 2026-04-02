import { useEffect, useMemo, useState } from 'react';

import { DashboardHeader } from './components/DashboardHeader';
import { DataTable } from './components/DataTable';
import { ExportButtons } from './components/ExportButtons';
import { FilterPanel } from './components/FilterPanel';
import { PollutionMap } from './components/PollutionMap';
import { StatsBar } from './components/StatsBar';
import { Chatbot } from './components/Chatbot';
import { loadAllPollutionData } from './services/dataRepository';
import type { FilterState, PollutionRecord } from './types/pollution';
import './App.css';

type ThemeMode = 'light' | 'dark';

const DEFAULT_FILTERS: FilterState = {
  category: 'all',
  district: 'all',
  city: 'all',
  search: '',
  startDate: '',
  endDate: '',
};

function includesSearch(record: PollutionRecord, search: string): boolean {
  if (!search) {
    return true;
  }

  const value = search.toLowerCase();
  return (
    record.name.toLowerCase().includes(value) ||
    record.city.toLowerCase().includes(value) ||
    record.district.toLowerCase().includes(value) ||
    record.source.toLowerCase().includes(value)
  );
}

function inDateRange(record: PollutionRecord, startDate: string, endDate: string): boolean {
  if (!startDate && !endDate) {
    return true;
  }

  const timestamp = Date.parse(record.date);
  if (Number.isNaN(timestamp)) {
    return false;
  }

  if (startDate && timestamp < Date.parse(startDate)) {
    return false;
  }

  if (endDate && timestamp > Date.parse(endDate)) {
    return false;
  }

  return true;
}

function App() {
  const [records, setRecords] = useState<PollutionRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightedRecordIds, setHighlightedRecordIds] = useState<string[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.classList.toggle('dark-theme', themeMode === 'dark');
    localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError('');
      try {
        const loaded = await loadAllPollutionData();
        if (mounted) {
          setRecords(loaded);
        }
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : 'Failed to load pollution data.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const districts = useMemo(
    () => Array.from(new Set(records.map((item) => item.district))).sort(),
    [records],
  );
  const cities = useMemo(
    () => Array.from(new Set(records.map((item) => item.city))).sort(),
    [records],
  );

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        if (filters.category !== 'all' && record.category !== filters.category) {
          return false;
        }

        if (filters.district !== 'all' && record.district !== filters.district) {
          return false;
        }

        if (filters.city !== 'all' && record.city !== filters.city) {
          return false;
        }

        if (!includesSearch(record, filters.search)) {
          return false;
        }

        if (!inDateRange(record, filters.startDate, filters.endDate)) {
          return false;
        }

        return true;
      }),
    [records, filters],
  );

  useEffect(() => {
    const visibleIds = new Set(filteredRecords.map((record) => record.id));
    setHighlightedRecordIds((current) => current.filter((id) => visibleIds.has(id)));
  }, [filteredRecords]);

  return (
    <main className="app-shell">
      <div className="theme-toggle-row">
        <button
          type="button"
          className="theme-toggle"
          aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setThemeMode((mode) => (mode === 'dark' ? 'light' : 'dark'))}
        >
          {themeMode === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <DashboardHeader totalRecords={records.length} visibleRecords={filteredRecords.length} />

      <FilterPanel
        filters={filters}
        districts={districts}
        cities={cities}
        records={records}
        onFiltersChange={setFilters}
      />

      <Chatbot
        records={filteredRecords}
        onHighlightRecords={setHighlightedRecordIds}
      />

      {loading ? <p className="status">Loading local and online pollution datasets...</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <StatsBar records={filteredRecords} />
          <PollutionMap records={filteredRecords} highlightedRecordIds={highlightedRecordIds} />
          <div className="actions-row">
            <h2>Filtered Dataset Table</h2>
            <ExportButtons records={filteredRecords} />
          </div>
          <DataTable records={filteredRecords} />
        </>
      ) : null}
    </main>
  );
}

export default App;
