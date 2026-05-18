/// <reference types="web-bluetooth" />
import { useCallback, useRef, useState } from 'react';

// UUIDs must match the ESP32 firmware (ESP32_HealthMonitor):
//   BLEDevice::init("ESP32_HealthMonitor");
//   SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
//   CHARACTERISTIC_UUID "abcdefab-1234-5678-1234-abcdefabcdef"  (NOTIFY + READ)
export const HEALTH_SERVICE = '12345678-1234-1234-1234-123456789abc';
export const HEALTH_CHAR    = 'abcdefab-1234-5678-1234-abcdefabcdef';
export const DEVICE_NAME_PREFIX = 'ESP32_HealthMonitor';

export interface SensorReading {
  temperature: number;
  heartRate: number;
  activity: number;
  tempStatus?: 'NORMAL' | 'ABNORMAL';
  heartStatus?: 'NORMAL' | 'ABNORMAL';
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
  const bufferRef = useRef<string>('');

  const isSupported = typeof navigator !== 'undefined' && !!(navigator as any).bluetooth;

  const handleData = useCallback((event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;
    const decoder = new TextDecoder();
    const chunk = decoder.decode(value);

    // The firmware sends one full payload per notify() without a newline,
    // but we still handle newline-delimited streams gracefully.
    bufferRef.current += chunk;
    const parts = bufferRef.current.split(/\r?\n/);
    bufferRef.current = parts.length > 1 ? (parts.pop() ?? '') : '';
    const candidates = parts.length > 1 ? parts : [chunk];

    for (const raw of candidates) {
      const trimmed = raw.trim();
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
        filters: [
          { services: [HEALTH_SERVICE] },
          { namePrefix: DEVICE_NAME_PREFIX },
        ],
        optionalServices: [HEALTH_SERVICE],
      });
      deviceRef.current = device;
      device.addEventListener('gattserverdisconnected', onDisconnected);

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(HEALTH_SERVICE);
      const char = await service.getCharacteristic(HEALTH_CHAR);

      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', handleData);

      // Prime UI with the initial READ value, if available.
      try {
        const initial = await char.readValue();
        const text = new TextDecoder().decode(initial);
        const reading = parseLine(text.trim());
        if (reading) {
          setState(s => ({ ...s, reading, history: [...s.history, reading] }));
        }
      } catch {
        /* read not supported — notifications will deliver data */
      }

      setState(s => ({
        ...s,
        connected: true,
        connecting: false,
        deviceName: device.name ?? 'ESP32_HealthMonitor',
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
    setState(s => ({ ...s, connected: false }));
  }, []);

  return { ...state, isSupported, connect, disconnect };
}

/**
 * Parses the firmware payload:
 *   "TEMP:36.50,TEMP_STATUS:NORMAL,BPM:75,HEART_STATUS:NORMAL"
 * Also accepts JSON {temp, hr, activity} and bare "temp,hr,activity" for backward compatibility.
 */
function parseLine(line: string): SensorReading | null {
  if (!line) return null;
  try {
    // JSON form
    if (line.startsWith('{')) {
      const obj = JSON.parse(line);
      const t = Number(obj.temp ?? obj.temperature ?? obj.TEMP);
      const h = Number(obj.hr ?? obj.heartRate ?? obj.BPM);
      const a = Number(obj.activity ?? obj.motion ?? 0);
      if (Number.isFinite(t) && Number.isFinite(h)) {
        return { temperature: t, heartRate: h, activity: a, timestamp: Date.now() };
      }
      return null;
    }

    // KEY:VALUE,KEY:VALUE — firmware format
    if (line.includes(':')) {
      const map: Record<string, string> = {};
      for (const seg of line.split(',')) {
        const [k, v] = seg.split(':');
        if (k && v !== undefined) map[k.trim().toUpperCase()] = v.trim();
      }
      const t = Number(map['TEMP'] ?? map['TEMPERATURE']);
      const h = Number(map['BPM'] ?? map['HR'] ?? map['HEARTRATE']);
      if (Number.isFinite(t) && Number.isFinite(h)) {
        const tempStatus = map['TEMP_STATUS'] as 'NORMAL' | 'ABNORMAL' | undefined;
        const heartStatus = map['HEART_STATUS'] as 'NORMAL' | 'ABNORMAL' | undefined;
        // Derive a coarse activity value from heart-rate deviation so the
        // "active/idle" indicator works until a real accelerometer is added.
        const activity = Math.min(100, Math.max(0, Math.abs(h - 70)));
        return {
          temperature: t,
          heartRate: h,
          activity,
          tempStatus,
          heartStatus,
          timestamp: Date.now(),
        };
      }
      return null;
    }

    // Bare CSV "temp,hr,activity"
    const parts = line.split(',').map(p => Number(p.trim()));
    if (parts.length >= 2 && parts.slice(0, 2).every(n => Number.isFinite(n))) {
      return {
        temperature: parts[0],
        heartRate: parts[1],
        activity: Number.isFinite(parts[2]) ? parts[2] : 0,
        timestamp: Date.now(),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}
