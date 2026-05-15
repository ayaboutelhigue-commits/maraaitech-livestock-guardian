import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
    if (cfg.wilaya) return WILAYA_COORDS[cfg.wilaya];
    return null;
  }, [cfg]);

  const [loc, setLoc] = useState({
    lat: cfg.farmLocation?.lat?.toString() ?? '',
    lng: cfg.farmLocation?.lng?.toString() ?? '',
  });

  const farmLL: LatLngTuple | null = loc.lat && loc.lng ? [parseFloat(loc.lat), parseFloat(loc.lng)] : null;

  const center: LatLngTuple = farmLL
    ?? (fallback ? [fallback.lat, fallback.lng] : [28.0339, 1.6596]);
  const zoom = farmLL ? 15 : fallback ? 11 : 5;

  const save = () => {
    const cur = readFarmConfig();
    const fl = farmLL ? { lat: farmLL[0], lng: farmLL[1] } : undefined;
    localStorage.setItem('maraai_user', JSON.stringify({ ...cur, farmLocation: fl }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{t('nav.map')}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter the exact coordinates of your farm to mark its location on the map.
      </p>

      <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Latitude</label>
          <input value={loc.lat} onChange={e => setLoc(s => ({ ...s, lat: e.target.value }))}
            placeholder="e.g. 36.7538" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Longitude</label>
          <input value={loc.lng} onChange={e => setLoc(s => ({ ...s, lng: e.target.value }))}
            placeholder="e.g. 3.0588" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex items-end">
          <button onClick={save}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Save className="h-4 w-4" /> Save
          </button>
        </div>
        {farmLL && (
          <p className="sm:col-span-3 text-xs text-muted-foreground">
            Farm at <span className="font-semibold text-foreground">{farmLL[0].toFixed(5)}, {farmLL[1].toFixed(5)}</span>
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
          {farmLL && (
            <Marker position={farmLL} icon={defaultIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{cfg.commune ? `${cfg.commune}, ${cfg.wilaya}` : 'Your farm'}</p>
                  <p>{farmLL[0].toFixed(5)}, {farmLL[1].toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
