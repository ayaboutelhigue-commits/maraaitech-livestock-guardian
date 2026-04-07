export interface Animal {
  id: string;
  name: string;
  collarId: string;
  temperature: number;
  heartRate: number;
  motion: 'active' | 'idle';
  lat: number;
  lng: number;
  status: 'online' | 'offline';
  timestamp: number;
}

export interface Alert {
  id: string;
  animalId: string;
  animalName: string;
  type: 'temp_high' | 'temp_low' | 'heart_high' | 'heart_low' | 'offline';
  value: number;
  timestamp: number;
  read: boolean;
}

export const mockAnimals: Animal[] = [
  { id: 'a1', name: 'Bessie', collarId: 'C-001', temperature: 38.5, heartRate: 72, motion: 'active', lat: 36.19, lng: 5.41, status: 'online', timestamp: Date.now() },
  { id: 'a2', name: 'Daisy', collarId: 'C-002', temperature: 41.2, heartRate: 68, motion: 'idle', lat: 36.192, lng: 5.413, status: 'online', timestamp: Date.now() },
  { id: 'a3', name: 'Clover', collarId: 'C-003', temperature: 39.1, heartRate: 95, motion: 'active', lat: 36.188, lng: 5.408, status: 'online', timestamp: Date.now() },
  { id: 'a4', name: 'Buttercup', collarId: 'C-004', temperature: 34.5, heartRate: 60, motion: 'idle', lat: 36.195, lng: 5.42, status: 'offline', timestamp: Date.now() - 600000 },
  { id: 'a5', name: 'Rosie', collarId: 'C-005', temperature: 38.8, heartRate: 75, motion: 'active', lat: 36.185, lng: 5.405, status: 'online', timestamp: Date.now() },
  { id: 'a6', name: 'Luna', collarId: 'C-006', temperature: 39.5, heartRate: 110, motion: 'active', lat: 36.191, lng: 5.418, status: 'online', timestamp: Date.now() },
];

export const mockAlerts: Alert[] = [
  { id: 'al1', animalId: 'a2', animalName: 'Daisy', type: 'temp_high', value: 41.2, timestamp: Date.now() - 60000, read: false },
  { id: 'al2', animalId: 'a4', animalName: 'Buttercup', type: 'temp_low', value: 34.5, timestamp: Date.now() - 120000, read: false },
  { id: 'al3', animalId: 'a6', animalName: 'Luna', type: 'heart_high', value: 110, timestamp: Date.now() - 300000, read: true },
  { id: 'al4', animalId: 'a4', animalName: 'Buttercup', type: 'offline', value: 0, timestamp: Date.now() - 600000, read: true },
];

export const generateTimeSeriesData = (animalId: string, hours = 24) => {
  const data = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    data.push({
      time: new Date(now - i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: 37.5 + Math.random() * 3,
      heartRate: 60 + Math.random() * 40,
      activity: Math.floor(Math.random() * 100),
    });
  }
  return data;
};
