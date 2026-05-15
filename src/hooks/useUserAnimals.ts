import { useMemo } from 'react';
import { Animal, mockAnimals } from '@/data/mockData';
import { useBLEContext } from '@/contexts/BLEContext';

export interface FarmConfig {
  username?: string;
  collars?: { name: string }[];
  numCollars?: number;
  farmLocation?: { lat: number; lng: number };
  wilaya?: string;
  commune?: string;
}

export const readFarmConfig = (): FarmConfig => {
  try {
    return JSON.parse(localStorage.getItem('maraai_user') || '{}');
  } catch {
    return {};
  }
};

export const buildUserAnimals = (cfg: FarmConfig): Animal[] => {
  const collars = cfg.collars ?? [];
  if (collars.length === 0) return mockAnimals;

  const center = cfg.farmLocation ?? { lat: 36.19, lng: 5.41 };
  return collars.map((c, i) => ({
    id: `u${i + 1}`,
    name: c.name || `Collar ${i + 1}`,
    collarId: c.name || `C-${String(i + 1).padStart(3, '0')}`,
    temperature: 38.5,
    heartRate: 70,
    motion: 'idle',
    lat: center.lat + (Math.random() - 0.5) * 0.005,
    lng: center.lng + (Math.random() - 0.5) * 0.005,
    status: i === 0 ? 'online' : 'offline',
    timestamp: Date.now(),
    type: 'cow',
    age: 1,
    weight: 100,
    breed: '—',
    sex: 'female',
  }));
};

/** Returns user-defined animals with live BLE data overlaid on the bound (or first) collar. */
export const useUserAnimals = (): Animal[] => {
  const ble = useBLEContext();
  const base = useMemo(() => buildUserAnimals(readFarmConfig()), []);
  const targetId = ble.boundAnimalId ?? base[0]?.id;

  return base.map(a => {
    if (ble.connected && ble.reading && a.id === targetId) {
      return {
        ...a,
        temperature: Number(ble.reading.temperature.toFixed(1)),
        heartRate: Math.round(ble.reading.heartRate),
        motion: (ble.reading.activity > 30 ? 'active' : 'idle') as 'active' | 'idle',
        status: 'online' as const,
        timestamp: ble.reading.timestamp,
      };
    }
    return a;
  });
};
