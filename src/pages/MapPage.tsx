import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { COMMUNE_COORDS, WILAYA_COORDS } from '@/data/wilayaCommunes';
import { readFarmConfig } from '@/hooks/useUserAnimals';
import { Save } from 'lucide-react';

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Haversine distance in meters
const distM = (a: LatLngTuple, b: LatLngTuple) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const Recenter = ({ center, zoom }: { center: LatLngTuple; zoom: number }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
};

const MapPage = () => {
  const { t } = useLanguage();
  const cfg = useMemo(readFarmConfig, []);
  const fallback = useMemo(() => {
    if (cfg.wilaya && cfg.commune) {
      const k = `${cfg.wilaya}|${cfg.commune}`;
      return COMMUNE_COORDS[k] || WILAYA_COORDS[cfg.wilaya];
    }
    return null;
  }, [cfg]);

  const [start, setStart] = useState({
    lat: cfg.farmStart?.lat?.toString() ?? '',
    lng: cfg.farmStart?.lng?.toString() ?? '',
  });
  const [end, setEnd] = useState({
    lat: cfg.farmEnd?.lat?.toString() ?? '',
    lng: cfg.farmEnd?.lng?.toString() ?? '',
  });

  const startLL: LatLngTuple | null = start.lat && start.lng ? [parseFloat(start.lat), parseFloat(start.lng)] : null;
  const endLL: LatLngTuple | null = end.lat && end.lng ? [parseFloat(end.lat), parseFloat(end.lng)] : null;

  // Farm circle: center = midpoint of start/end, radius = half the distance between them.
  const farm = useMemo(() => {
    if (!startLL || !endLL) return null;
    const center: LatLngTuple = [(startLL[0] + endLL[0]) / 2, (startLL[1] + endLL[1]) / 2];
    const radius = distM(startLL, endLL) / 2;
    return { center, radius };
  }, [startLL, endLL]);

  const center: LatLngTuple = farm?.center
    ?? startLL
    ?? (fallback ? [fallback.lat, fallback.lng] : [28.0339, 1.6596]); // Algeria fallback
  const zoom = farm ? 14 : fallback ? 11 : 5;

  const save = () => {
    const cur = readFarmConfig();
    const fs = startLL ? { lat: startLL[0], lng: startLL[1] } : undefined;
    const fe = endLL ? { lat: endLL[0], lng: endLL[1] } : undefined;
    localStorage.setItem('maraai_user', JSON.stringify({ ...cur, farmStart: fs, farmEnd: fe }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{t('nav.map')}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Set the start and end coordinates of your farm — the map will draw a circle around your land.
      </p>

      {/* Coordinate inputs */}
      <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Farm start (lat, lng)</label>
          <div className="flex gap-2">
            <input value={start.lat} onChange={e => setStart(s => ({ ...s, lat: e.target.value }))}
              placeholder="Latitude" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input value={start.lng} onChange={e => setStart(s => ({ ...s, lng: e.target.value }))}
              placeholder="Longitude" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Farm end (lat, lng)</label>
          <div className="flex gap-2">
            <input value={end.lat} onChange={e => setEnd(s => ({ ...s, lat: e.target.value }))}
              placeholder="Latitude" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input value={end.lng} onChange={e => setEnd(s => ({ ...s, lng: e.target.value }))}
              placeholder="Longitude" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex items-end">
          <button onClick={save}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
        {farm && (
          <p className="sm:col-span-3 text-xs text-muted-foreground">
            Farm radius: <span className="font-semibold text-foreground">{Math.round(farm.radius)} m</span> · center {farm.center[0].toFixed(4)}, {farm.center[1].toFixed(4)}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card" style={{ height: '70vh' }}>
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <Recenter center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {farm && (
            <>
              <Circle
                center={farm.center}
                radius={farm.radius}
                pathOptions={{
                  color: 'hsl(152, 55%, 33%)',
                  fillColor: 'hsl(152, 55%, 50%)',
                  fillOpacity: 0.18,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{cfg.commune ? `${cfg.commune}, ${cfg.wilaya}` : 'Your farm'}</p>
                    <p>Radius: {Math.round(farm.radius)} m</p>
                  </div>
                </Popup>
              </Circle>
              {startLL && <Marker position={startLL} icon={defaultIcon}><Popup>Farm start</Popup></Marker>}
              {endLL && <Marker position={endLL} icon={defaultIcon}><Popup>Farm end</Popup></Marker>}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
