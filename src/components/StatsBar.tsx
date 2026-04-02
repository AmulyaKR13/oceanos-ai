import type { PollutionRecord } from '../types/pollution';

interface StatsBarProps {
  records: PollutionRecord[];
}

export function StatsBar({ records }: StatsBarProps) {
  const lakeCount = records.filter((item) => item.category === 'lake-quality').length;
  const airCount = records.filter((item) => item.pollutionType === 'air').length;
  const districtCount = new Set(records.map((item) => item.district)).size;

  return (
    <section className="stats-grid">
      <article className="stat-card">
        <p>Total Observations</p>
        <h2>{records.length}</h2>
      </article>
      <article className="stat-card">
        <p>Lake Reports</p>
        <h2>{lakeCount}</h2>
      </article>
      <article className="stat-card">
        <p>Air Observations</p>
        <h2>{airCount}</h2>
      </article>
      <article className="stat-card">
        <p>District Coverage</p>
        <h2>{districtCount}</h2>
      </article>
    </section>
  );
}
