import axios from 'axios';

import { CITY_POINTS } from '../../config/karnatakaLocations';
import type { PollutionRecord } from '../../types/pollution';

interface OpenMeteoResponse {
  hourly?: {
    time?: string[];
    pm2_5?: Array<number | null>;
    pm10?: Array<number | null>;
    nitrogen_dioxide?: Array<number | null>;
    sulphur_dioxide?: Array<number | null>;
    ozone?: Array<number | null>;
    carbon_monoxide?: Array<number | null>;
    us_aqi?: Array<number | null>;
  };
}

function getLastValue(values?: Array<number | null>): number | null {
  if (!values || values.length === 0) {
    return null;
  }

  for (let i = values.length - 1; i >= 0; i -= 1) {
    const value = values[i];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

export async function fetchOnlineAqi(): Promise<PollutionRecord[]> {
  const cities = Object.values(CITY_POINTS);

  const responses: Array<PollutionRecord | null> = await Promise.all(
    cities.map(async (city) => {
      const url = 'https://air-quality-api.open-meteo.com/v1/air-quality';
      const { data } = await axios.get<OpenMeteoResponse>(url, {
        params: {
          latitude: city.latitude,
          longitude: city.longitude,
          hourly: 'pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,us_aqi',
          timezone: 'Asia/Kolkata',
          past_days: 2,
        },
        timeout: 10000,
      });

      const latestTime = data.hourly?.time?.[data.hourly.time.length - 1];
      if (!latestTime) {
        return null;
      }

      return {
        id: `online-aqi-${city.city}`,
        category: 'online-aqi',
        pollutionType: 'air',
        name: `${city.city} Open-Meteo AQI`,
        district: city.district,
        city: city.city,
        latitude: city.latitude,
        longitude: city.longitude,
        date: latestTime.slice(0, 10),
        source: 'Open-Meteo Air Quality API',
        measurements: {
          usAqi: getLastValue(data.hourly?.us_aqi),
          pm25: getLastValue(data.hourly?.pm2_5),
          pm10: getLastValue(data.hourly?.pm10),
          no2: getLastValue(data.hourly?.nitrogen_dioxide),
          so2: getLastValue(data.hourly?.sulphur_dioxide),
          ozone: getLastValue(data.hourly?.ozone),
          co: getLastValue(data.hourly?.carbon_monoxide),
        },
      } satisfies PollutionRecord;
    }),
  );

  return responses.filter((record): record is PollutionRecord => Boolean(record));
}
