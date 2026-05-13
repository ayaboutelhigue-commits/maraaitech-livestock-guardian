import { useCallback, useRef, useState } from 'react';

// Nordic UART Service (NUS) — standard for ESP32 BLE serial bridges
export const NUS_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const NUS_TX_CHAR = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // notify (device -> app)
export const NUS_RX_CHAR = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // write  (app -> device)

export interface SensorReading {
  temperature: number;
  heartRate: number;
  activity: number;
  timestamp: number;
}

interface BLEState {
  connected: boolean;
  connecting: boolean;
  deviceName: string | null;
  error: string | null;
  reading: SensorReading | null;
  history: SensorReading[];
}

export function useBLE() {
  const [state, setState] = useState<BLEState>({
    connected: false,
    connecting: false,
    deviceName: null,
    error: null,
    reading: null,
    history: [],
  });

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const rxCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const bufferRef = useRef<string>('');

  const isSupported = typeof navigator !== 'undefined' && !!(navigator as any).bluetooth;

  const handleData = useCallback((event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;
    const decoder = new TextDecoder();
    bufferRef.current += decoder.decode(value);

    // Parse line-by-line (newline-delimited)
    const lines = bufferRef.current.split(/\r?\n/);
    bufferRef.current = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const reading = parseLine(trimmed);
      if (reading) {
        setState(s => ({
          ...s,
          reading,
          history: [...s.history.slice(-99), reading],
        }));
      }
    }
  }, []);

  const onDisconnected = useCallback(() => {
    setState(s => ({ ...s, connected: false, connecting: false }));
  }, []);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setState(s => ({ ...s, error: 'Web Bluetooth is not supported. Use Chrome or Edge on Android/Desktop.' }));
      return;
    }
    setState(s => ({ ...s, connecting: true, error: null }));
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [NUS_SERVICE] }],
        optionalServices: [NUS_SERVICE],
      });
      deviceRef.current = device;
      device.addEventListener('gattserverdisconnected', onDisconnected);

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(NUS_SERVICE);
      const txChar = await service.getCharacteristic(NUS_TX_CHAR);
      try {
        const rxChar = await service.getCharacteristic(NUS_RX_CHAR);
        rxCharRef.current = rxChar;
      } catch {
        rxCharRef.current = null;
      }

      await txChar.startNotifications();
      txChar.addEventListener('characteristicvaluechanged', handleData);

      setState(s => ({
        ...s,
        connected: true,
        connecting: false,
        deviceName: device.name ?? 'Unknown device',
      }));
    } catch (err: any) {
      setState(s => ({
        ...s,
        connecting: false,
        connected: false,
        error: err?.message ?? String(err),
      }));
    }
  }, [handleData, isSupported, onDisconnected]);

  const disconnect = useCallback(() => {
    const dev = deviceRef.current;
    if (dev?.gatt?.connected) dev.gatt.disconnect();
    deviceRef.current = null;
    rxCharRef.current = null;
    setState(s => ({ ...s, connected: false }));
  }, []);

  const send = useCallback(async (text: string) => {
    const ch = rxCharRef.current;
    if (!ch) throw new Error('No writable characteristic');
    const data = new TextEncoder().encode(text);
    await ch.writeValueWithoutResponse(data);
  }, []);

  return { ...state, isSupported, connect, disconnect, send };
}

// Accepts:  "temp,hr,activity"  e.g. "38.7,72,55"
// Or JSON:  {"temp":38.7,"hr":72,"activity":55}
function parseLine(line: string): SensorReading | null {
  try {
    if (line.startsWith('{')) {
      const obj = JSON.parse(line);
      const t = Number(obj.temp ?? obj.temperature);
      const h = Number(obj.hr ?? obj.heartRate);
      const a = Number(obj.activity ?? obj.motion ?? 0);
      if (Number.isFinite(t) && Number.isFinite(h)) {
        return { temperature: t, heartRate: h, activity: a, timestamp: Date.now() };
      }
      return null;
    }
    const parts = line.split(',').map(p => Number(p.trim()));
    if (parts.length >= 2 && parts.every(n => Number.isFinite(n))) {
      return {
        temperature: parts[0],
        heartRate: parts[1],
        activity: parts[2] ?? 0,
        timestamp: Date.now(),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}
