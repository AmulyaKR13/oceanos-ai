import L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import { useMemo, useEffect, useState } from 'react';
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';

import type { PollutionRecord } from '../types/pollution';

interface PollutionMapProps {
  records: PollutionRecord[];
  allRecords?: PollutionRecord[];
  highlightedRecordIds?: string[];
  selectedCity?: string;
  chatbotCity?: string;
}

const KARNATAKA_BOUNDS: [[number, number], [number, number]] = [
  [11.5, 73.7],
  [18.7, 78.9],
];

function KarnatakaBoundsLock({ boundary }: { boundary: GeoJsonObject | null }) {
  const map = useMap();

  useEffect(() => {
    if (!boundary) {
      return;
    }

    const boundaryLayer = L.geoJSON(boundary);
    const boundaryBounds = boundaryLayer.getBounds();

    if (!boundaryBounds.isValid()) {
      return;
    }

    const paddedBounds = boundaryBounds.pad(0.03);
    map.setMaxBounds(paddedBounds);
    map.fitBounds(paddedBounds);

    const minZoom = map.getBoundsZoom(paddedBounds, true);
    map.setMinZoom(minZoom);
  }, [boundary, map]);

  return null;
}

function ChatbotZoomToResults({ points }: { points: Array<[number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], Math.max(map.getZoom(), 10));
      return;
    }

    const bounds = L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng)));
    map.fitBounds(bounds.pad(0.35));
  }, [points, map]);

  return null;
}

const CATEGORY_COLORS: Record<PollutionRecord['category'], string> = {
  'lake-quality': '#2f855a',
  aqi: '#dd6b20',
  'online-aqi': '#c53030',
  other: '#4a5568',
};

function markerIcon(category: PollutionRecord['category'], highlighted: boolean) {
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
  const ring = highlighted ? '#f9d64a' : '#ffffff';
  const size = highlighted ? 18 : 14;
  const anchor = highlighted ? 9 : 8;

  return L.divIcon({
    className: 'custom-marker-wrapper',
    html: `<div class="custom-marker${highlighted ? ' custom-marker-highlighted' : ''}" style="background:${color};border-color:${ring}"></div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

function metricValue(record: PollutionRecord): number | null {
  const airMetric = record.measurements.usAqi ?? record.measurements.pm25;
  const waterMetric = record.measurements.bod ?? record.measurements.dissolvedOxygen;
  const value = record.pollutionType === 'air' ? airMetric : waterMetric;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function metricLabel(record: PollutionRecord): string {
  if (record.pollutionType === 'air') {
    if (typeof record.measurements.usAqi === 'number') {
      return 'US AQI';
    }
    return 'PM2.5';
  }

  if (typeof record.measurements.bod === 'number') {
    return 'BOD';
  }
  return 'Dissolved O2';
}

export function PollutionMap({
  records,
  allRecords,
  highlightedRecordIds = [],
  selectedCity = 'all',
  chatbotCity = '',
}: PollutionMapProps) {
  const [karnatakaBoundary, setKarnatakaBoundary] = useState<GeoJsonObject | null>(null);
  const zoomRecords = allRecords && allRecords.length > 0 ? allRecords : records;
  const highlightedSet = useMemo(() => new Set(highlightedRecordIds), [highlightedRecordIds]);
  const highlightedPoints = useMemo(
    () => zoomRecords.filter((record) => highlightedSet.has(record.id)).map((record) => [record.latitude, record.longitude] as [number, number]),
    [zoomRecords, highlightedSet],
  );
  const chatbotCityPoints = useMemo(() => {
    if (!chatbotCity) {
      return [] as Array<[number, number]>;
    }

    return zoomRecords
      .filter((record) => record.city.toLowerCase() === chatbotCity.toLowerCase())
      .map((record) => [record.latitude, record.longitude] as [number, number]);
  }, [zoomRecords, chatbotCity]);
  const selectedCityPoints = useMemo(() => {
    if (selectedCity === 'all') {
      return [] as Array<[number, number]>;
    }

    return zoomRecords
      .filter((record) => record.city === selectedCity)
      .map((record) => [record.latitude, record.longitude] as [number, number]);
  }, [zoomRecords, selectedCity]);
  const zoomTargetPoints = highlightedPoints.length > 0
    ? highlightedPoints
    : chatbotCityPoints.length > 0
      ? chatbotCityPoints
      : selectedCityPoints;

  const insightPoints = useMemo(() => {
    return [...records]
      .filter((record) => metricValue(record) !== null)
      .sort((left, right) => (metricValue(right) ?? -Infinity) - (metricValue(left) ?? -Infinity))
      .slice(0, 5);
  }, [records]);

  useEffect(() => {
    let alive = true;

    async function loadBoundary() {
      try {
        const response = await fetch('/geo/karnataka.geojson');
        if (!response.ok) {
          return;
        }
        const geometry = (await response.json()) as GeoJsonObject;
        if (alive) {
          setKarnatakaBoundary(geometry);
        }
      } catch {
        // Keep the map usable even if boundary fetch fails.
      }
    }

    loadBoundary();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="panel map-panel">
      <MapContainer
        center={[15.3173, 75.7139]}
        zoom={7}
        minZoom={6}
        maxZoom={12}
        maxBounds={KARNATAKA_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap
        />

        <KarnatakaBoundsLock boundary={karnatakaBoundary} />
        <ChatbotZoomToResults points={zoomTargetPoints} />

        {karnatakaBoundary ? (
          <GeoJSON
            data={karnatakaBoundary}
            style={{
              color: '#042f4f',
              weight: 4,
              opacity: 1,
              fillColor: '#8ecae6',
              fillOpacity: 0.04,
            }}
          />
        ) : null}

        {records.map((record) => (
          // Markers selected by chatbot are emphasized with a brighter ring and pulse.
          <Marker
            key={record.id}
            position={[record.latitude, record.longitude]}
            icon={markerIcon(record.category, highlightedSet.has(record.id))}
          >
            <Tooltip>
              <div>
                <strong>{record.name}</strong>
                <div>{record.city}, {record.district}</div>
                {metricValue(record) !== null ? (
                  <div>{metricLabel(record)}: {metricValue(record)}</div>
                ) : null}
              </div>
            </Tooltip>
            <Popup>
              <div className="popup-content">
                <h3>{record.name}</h3>
                <p>{record.city}, {record.district}</p>
                <p>Category: {record.category}</p>
                <p>Date: {record.date}</p>
                <p>Source: {record.source}</p>
                <div className="measurements">
                  {Object.entries(record.measurements).slice(0, 6).map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {value ?? 'N/A'}</p>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="legend">
        <span><i style={{ background: CATEGORY_COLORS['lake-quality'] }}></i> Lake quality</span>
        <span><i style={{ background: CATEGORY_COLORS.aqi }}></i> Local AQI</span>
        <span><i style={{ background: CATEGORY_COLORS['online-aqi'] }}></i> Online AQI</span>
      </div>
      <div className="map-insights">
        <h3>Map Highlights</h3>
        {insightPoints.length === 0 ? (
          <p>No measurable points available for highlighting.</p>
        ) : (
          <ul>
            {insightPoints.map((record) => (
              <li key={`${record.id}-insight`}>
                <strong>{record.name}</strong> ({record.city}) - {metricLabel(record)}: {metricValue(record)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
