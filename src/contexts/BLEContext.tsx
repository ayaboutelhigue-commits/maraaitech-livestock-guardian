import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useBLE, SensorReading } from '@/hooks/useBLE';

interface BLEContextValue {
  isSupported: boolean;
  connected: boolean;
  connecting: boolean;
  deviceName: string | null;
  error: string | null;
  reading: SensorReading | null;
  history: SensorReading[];
  connect: () => Promise<void>;
  disconnect: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  simulating: boolean;
  boundAnimalId: string | null;
  bindAnimal: (id: string | null) => void;
}

const BLEContext = createContext<BLEContextValue | undefined>(undefined);

const STORAGE_KEY = 'raaitech_bound_animal';

export const BLEProvider = ({ children }: { children: ReactNode }) => {
  const ble = useBLE();
  const [boundAnimalId, setBoundAnimalId] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  );

  const bindAnimal = (id: string | null) => {
    setBoundAnimalId(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    // no-op: persistence already handled in bindAnimal
  }, []);

  return (
    <BLEContext.Provider value={{ ...ble, boundAnimalId, bindAnimal }}>
      {children}
    </BLEContext.Provider>
  );
};

export const useBLEContext = () => {
  const ctx = useContext(BLEContext);
  if (!ctx) throw new Error('useBLEContext must be used within BLEProvider');
  return ctx;
};
