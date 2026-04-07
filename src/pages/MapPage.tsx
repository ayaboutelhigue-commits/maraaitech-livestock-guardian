import { useLanguage } from '@/contexts/LanguageContext';
import { mockAnimals } from '@/data/mockData';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const center: [number, number] = [36.19, 5.41];

  // Simulated GPS trail for first animal
  const trail: [number, number][] = [
    [36.188, 5.405], [36.189, 5.408], [36.19, 5.41], [36.191, 5.412], [36.192, 5.413],
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('nav.map')}</h1>
      <div className="overflow-hidden rounded-2xl border border-border shadow-card" style={{ height: '70vh' }}>
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mockAnimals.map(animal => (
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
