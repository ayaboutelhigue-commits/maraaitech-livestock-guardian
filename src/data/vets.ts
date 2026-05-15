// Static directory of veterinarians across Algeria.
// Used to auto-suggest the closest vet based on the farm location.
export interface Vet {
  name: string;
  phone: string;
  wilaya: string;
  lat: number;
  lng: number;
}

export const VETS: Vet[] = [
  { name: 'Dr. Benali (Alger)',       phone: '+213555000111', wilaya: 'Alger',       lat: 36.7538, lng: 3.0588 },
  { name: 'Dr. Hamidi (Blida)',       phone: '+213555000112', wilaya: 'Blida',       lat: 36.4700, lng: 2.8300 },
  { name: 'Dr. Saadi (Sétif)',        phone: '+213555000113', wilaya: 'Sétif',       lat: 36.1900, lng: 5.4100 },
  { name: 'Dr. Khelifi (Constantine)',phone: '+213555000114', wilaya: 'Constantine', lat: 36.3650, lng: 6.6147 },
  { name: 'Dr. Boudiaf (Oran)',       phone: '+213555000115', wilaya: 'Oran',        lat: 35.6976, lng: -0.6337 },
  { name: 'Dr. Mansouri (Annaba)',    phone: '+213555000116', wilaya: 'Annaba',      lat: 36.9000, lng: 7.7667 },
  { name: 'Dr. Ait Ali (Tizi Ouzou)', phone: '+213555000117', wilaya: 'Tizi Ouzou',  lat: 36.7169, lng: 4.0497 },
  { name: 'Dr. Belkacem (Batna)',     phone: '+213555000118', wilaya: 'Batna',       lat: 35.5500, lng: 6.1739 },
  { name: 'Dr. Ferhat (Béjaïa)',      phone: '+213555000119', wilaya: 'Béjaïa',      lat: 36.7500, lng: 5.0833 },
  { name: 'Dr. Othmani (Biskra)',     phone: '+213555000120', wilaya: 'Biskra',      lat: 34.8500, lng: 5.7333 },
  { name: 'Dr. Larbi (Ouargla)',      phone: '+213555000121', wilaya: 'Ouargla',     lat: 31.9500, lng: 5.3333 },
  { name: 'Dr. Zerrouki (Tlemcen)',   phone: '+213555000122', wilaya: 'Tlemcen',     lat: 34.8783, lng: -1.3150 },
  { name: 'Dr. Brahimi (Ghardaïa)',   phone: '+213555000123', wilaya: 'Ghardaïa',    lat: 32.4900, lng: 3.6700 },
];

const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

export interface ClosestVet extends Vet { distanceKm: number }

export const findClosestVet = (
  farmLocation?: { lat: number; lng: number },
  wilaya?: string,
): ClosestVet | null => {
  if (farmLocation && Number.isFinite(farmLocation.lat) && Number.isFinite(farmLocation.lng)) {
    let best: ClosestVet | null = null;
    for (const v of VETS) {
      const d = haversineKm(farmLocation, v);
      if (!best || d < best.distanceKm) best = { ...v, distanceKm: d };
    }
    return best;
  }
  if (wilaya) {
    const v = VETS.find(x => x.wilaya === wilaya);
    if (v) return { ...v, distanceKm: 0 };
  }
  return VETS[0] ? { ...VETS[0], distanceKm: 0 } : null;
};
