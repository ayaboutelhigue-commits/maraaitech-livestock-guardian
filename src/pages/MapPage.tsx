import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockAnimals } from '@/data/mockData';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { COMMUNE_COORDS, WILAYA_COORDS } from '@/data/wilayaCommunes';

// Fix default icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapPage = () => {
  const { t } = useLanguage();

  // Get user's selected location from localStorage
  const userZone = useMemo(() => {
    try {
      const data = JSON.parse(localStorage.getItem('maraai_user') || '{}');
      if (data.wilaya && data.commune) {
        const communeKey = `${data.wilaya}|${data.commune}`;
        const coords = COMMUNE_COORDS[communeKey] || WILAYA_COORDS[data.wilaya];
        if (coords) return { ...coords, name: `${data.commune}, ${data.wilaya}` };
      }
      return null;
    } catch { return null; }
  }, []);

  const center: [number, number] = userZone
    ? [userZone.lat, userZone.lng]
    : [36.19, 5.41];

  // Simulated GPS trail for first animal
  const trail: [number, number][] = [
    [center[0] - 0.002, center[1] - 0.005],
    [center[0] - 0.001, center[1] - 0.002],
    [center[0], center[1]],
    [center[0] + 0.001, center[1] + 0.002],
    [center[0] + 0.002, center[1] + 0.003],
  ];

  // Offset mock animals around user zone
  const animals = useMemo(() => {
    if (!userZone) return mockAnimals;
    return mockAnimals.map((a, i) => ({
      ...a,
      lat: userZone.lat + (Math.random() - 0.5) * 0.02,
      lng: userZone.lng + (Math.random() - 0.5) * 0.02,
    }));
  }, [userZone]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('nav.map')}</h1>
      <div className="overflow-hidden rounded-2xl border border-border shadow-card" style={{ height: '70vh' }}>
        <MapContainer center={center} zoom={userZone ? 13 : 15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userZone && (
            <Circle
              center={[userZone.lat, userZone.lng]}
              radius={1500}
              pathOptions={{
                color: 'hsl(152, 55%, 33%)',
                fillColor: 'hsl(152, 55%, 50%)',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '8 4',
              }}
            >
              <Popup>
                <div className="text-sm font-bold">{userZone.name}</div>
              </Popup>
            </Circle>
          )}
          {animals.map(animal => (
            <Marker key={animal.id} position={[animal.lat, animal.lng]} icon={defaultIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{animal.name}</p>
                  <p>{t('temp')}: {animal.temperature}°C</p>
                  <p>{t('heart')}: {animal.heartRate} BPM</p>
                  <p>{t('motion')}: {t(`status.${animal.motion}`)}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          <Polyline positions={trail} pathOptions={{ color: 'hsl(152, 55%, 33%)', weight: 3, dashArray: '6' }} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
