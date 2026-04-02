export interface LocationPoint {
  latitude: number;
  longitude: number;
  district: string;
  city: string;
}

export const KARNATAKA_CENTER: LocationPoint = {
  latitude: 15.3173,
  longitude: 75.7139,
  district: 'Karnataka',
  city: 'Karnataka',
};

export const LAKE_LOCATION_MAP: Record<string, LocationPoint> = {
  'DEVASANDRA LAKE': { latitude: 13.0184, longitude: 77.6992, district: 'Bengaluru Urban', city: 'Bengaluru' },
  'HEBBAL LAKE': { latitude: 13.0416, longitude: 77.5922, district: 'Bengaluru Urban', city: 'Bengaluru' },
  'JAKKUR LAKE': { latitude: 13.0789, longitude: 77.5975, district: 'Bengaluru Urban', city: 'Bengaluru' },
  'AGARA LAKE': { latitude: 12.9165, longitude: 77.6389, district: 'Bengaluru Urban', city: 'Bengaluru' },
  'BELLANDUR LAKE': { latitude: 12.9352, longitude: 77.6767, district: 'Bengaluru Urban', city: 'Bengaluru' },
  'VARTHUR LAKE': { latitude: 12.9403, longitude: 77.7473, district: 'Bengaluru Urban', city: 'Bengaluru' },
  'ULSOOR LAKE': { latitude: 12.9833, longitude: 77.6246, district: 'Bengaluru Urban', city: 'Bengaluru' },
  'YEDIYUR LAKE': { latitude: 12.9288, longitude: 77.5787, district: 'Bengaluru Urban', city: 'Bengaluru' },
  'NAGAWARA LAKE': { latitude: 13.0419, longitude: 77.6162, district: 'Bengaluru Urban', city: 'Bengaluru' },
};

export const CITY_POINTS: Record<string, LocationPoint> = {
  Bengaluru: { latitude: 12.9716, longitude: 77.5946, district: 'Bengaluru Urban', city: 'Bengaluru' },
  Mysuru: { latitude: 12.2958, longitude: 76.6394, district: 'Mysuru', city: 'Mysuru' },
  Mangaluru: { latitude: 12.9141, longitude: 74.856, district: 'Dakshina Kannada', city: 'Mangaluru' },
  Hubballi: { latitude: 15.3647, longitude: 75.124, district: 'Dharwad', city: 'Hubballi' },
  Belagavi: { latitude: 15.8497, longitude: 74.4977, district: 'Belagavi', city: 'Belagavi' },
  Kalaburagi: { latitude: 17.3297, longitude: 76.8343, district: 'Kalaburagi', city: 'Kalaburagi' },
  Davanagere: { latitude: 14.4644, longitude: 75.9218, district: 'Davanagere', city: 'Davanagere' },
  Ballari: { latitude: 15.1394, longitude: 76.9214, district: 'Ballari', city: 'Ballari' },
  Shivamogga: { latitude: 13.9299, longitude: 75.5681, district: 'Shivamogga', city: 'Shivamogga' },
};
