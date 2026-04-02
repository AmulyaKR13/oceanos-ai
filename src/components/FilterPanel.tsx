import type { FilterState, PollutionRecord } from '../types/pollution';

interface FilterPanelProps {
  filters: FilterState;
  cities: string[];
  onFiltersChange: (next: FilterState) => void;
  records: PollutionRecord[];
}

export function FilterPanel({ filters, cities, onFiltersChange, records }: FilterPanelProps) {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <section className="panel filters-panel">
      <div className="filters-grid">
        <label>
          Category
          <select value={filters.category} onChange={(event) => update('category', event.target.value as FilterState['category'])}>
            <option value="all">All</option>
            <option value="lake-quality">Lake quality</option>
            <option value="aqi">Local AQI</option>
            <option value="online-aqi">Online AQI</option>
          </select>
        </label>

        <label>
          City
          <select value={filters.city} onChange={(event) => update('city', event.target.value)}>
            <option value="all">All</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </label>

        <label>
          Start Date
          <input type="date" value={filters.startDate} onChange={(event) => update('startDate', event.target.value)} />
        </label>

        <label>
          End Date
          <input type="date" value={filters.endDate} onChange={(event) => update('endDate', event.target.value)} />
        </label>

        <label className="search-field">
          Search
          <input
            type="search"
            placeholder="Lake, station, district..."
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
          />
        </label>
      </div>

      <p className="hint">Filtering over {records.length} loaded records from local + online sources.</p>
    </section>
  );
}
