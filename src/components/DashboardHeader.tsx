interface DashboardHeaderProps {
  totalRecords: number;
  visibleRecords: number;
}

export function DashboardHeader({ totalRecords, visibleRecords }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <p className="eyebrow">Karnataka Environmental Observatory</p>
      <h1>Pollution Intelligence Map</h1>
      <p className="intro">
        Explore lake water quality and AQI records across Karnataka with map-driven filtering,
        table analysis, and downloadable research datasets.
      </p>
      <p className="bod-note">
        BOD (Biological Oxygen Demand) indicates how much dissolved oxygen is needed to break down
        organic matter in water. Higher BOD usually means higher organic pollution.
      </p>
      <div className="meta-strip">
        <span>Total records: {totalRecords}</span>
        <span>Visible records: {visibleRecords}</span>
      </div>
    </header>
  );
}
