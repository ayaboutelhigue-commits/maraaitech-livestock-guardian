/// <reference types="web-bluetooth" />
import { useCallback, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { BleClient, dataViewToText } from '@capacitor-community/bluetooth-le';

// UUIDs must match the ESP32 firmware (ESP32_HealthMonitor).
export const HEALTH_SERVICE = '12345678-1234-1234-1234-123456789abc';
export const HEALTH_CHAR    = 'abcdefab-1234-5678-1234-abcdefabcdef';
export const DEVICE_NAME_PREFIX = 'ESP32_HealthMonitor';

export interface SensorReading {
  temperature: number;
  heartRate: number;
  activity: number;
  tempStatus?: 'NORMAL' | 'ABNORMAL';
  heartStatus?: 'NORMAL' | 'ABNORMAL';
  activityStatus?: 'NORMAL' | 'ABNORMAL';
  motion?: 'active' | 'idle';
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

const isNative = () => Capacitor.isNativePlatform();

export function useBLE() {
  const [state, setState] = useState<BLEState>({
    connected: false,
    connecting: false,
    deviceName: null,
    error: null,
    reading: null,
    history: [],
  });

  const webDeviceRef = useRef<BluetoothDevice | null>(null);
  const nativeDeviceIdRef = useRef<string | null>(null);
  const bufferRef = useRef<string>('');
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simStepRef = useRef<number>(0);

  const isSupported =
    isNative() ||
    (typeof navigator !== 'undefined' && !!(navigator as any).bluetooth);

  const ingestText = useCallback((chunk: string) => {
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

  const handleWebData = useCallback((event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;
    ingestText(new TextDecoder().decode(value));
  }, [ingestText]);

  const onDisconnected = useCallback(() => {
    setState(s => ({ ...s, connected: false, connecting: false }));
  }, []);

  const connectNative = useCallback(async () => {
    await BleClient.initialize({ androidNeverForLocation: true });

    const device = await BleClient.requestDevice({
      services: [HEALTH_SERVICE],
      namePrefix: DEVICE_NAME_PREFIX,
      optionalServices: [HEALTH_SERVICE],
    });

    nativeDeviceIdRef.current = device.deviceId;

    await BleClient.connect(device.deviceId, () => onDisconnected());

    await BleClient.startNotifications(
      device.deviceId,
      HEALTH_SERVICE,
      HEALTH_CHAR,
      (value) => {
        try {
          ingestText(dataViewToText(value));
        } catch {
          /* ignore decode error */
        }
      }
    );

    // Prime UI with READ value if available
    try {
      const initial = await BleClient.read(device.deviceId, HEALTH_SERVICE, HEALTH_CHAR);
      const text = dataViewToText(initial);
      const reading = parseLine(text.trim());
      if (reading) {
        setState(s => ({ ...s, reading, history: [...s.history, reading] }));
      }
    } catch {
      /* read not supported */
    }

    setState(s => ({
      ...s,
      connected: true,
      connecting: false,
      deviceName: device.name ?? 'ESP32_HealthMonitor',
    }));
  }, [ingestText, onDisconnected]);

  const connectWeb = useCallback(async () => {
    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [
        { services: [HEALTH_SERVICE] },
        { namePrefix: DEVICE_NAME_PREFIX },
      ],
      optionalServices: [HEALTH_SERVICE],
    });
    webDeviceRef.current = device;
    device.addEventListener('gattserverdisconnected', onDisconnected);

    const server = await device.gatt!.connect();
    const service = await server.getPrimaryService(HEALTH_SERVICE);
    const char = await service.getCharacteristic(HEALTH_CHAR);

    await char.startNotifications();
    char.addEventListener('characteristicvaluechanged', handleWebData);

    try {
      const initial = await char.readValue();
      const text = new TextDecoder().decode(initial);
      const reading = parseLine(text.trim());
      if (reading) {
        setState(s => ({ ...s, reading, history: [...s.history, reading] }));
      }
    } catch {
      /* read not supported */
    }

    setState(s => ({
      ...s,
      connected: true,
      connecting: false,
      deviceName: device.name ?? 'ESP32_HealthMonitor',
    }));
  }, [handleWebData, onDisconnected]);

  const connect = useCallback(async () => {
    if (!isSupported) {
      setState(s => ({
        ...s,
        error: 'Bluetooth is not supported on this device. Use the installed mobile app, or Chrome/Edge on desktop.',
      }));
      return;
    }
    setState(s => ({ ...s, connecting: true, error: null }));
    try {
      if (isNative()) {
        await connectNative();
      } else {
        await connectWeb();
      }
    } catch (err: any) {
      setState(s => ({
        ...s,
        connecting: false,
        connected: false,
        error: err?.message ?? String(err),
      }));
    }
  }, [connectNative, connectWeb, isSupported]);

  const disconnect = useCallback(() => {
    if (isNative()) {
      const id = nativeDeviceIdRef.current;
      if (id) {
        BleClient.disconnect(id).catch(() => undefined);
      }
      nativeDeviceIdRef.current = null;
    } else {
      const dev = webDeviceRef.current;
      if (dev?.gatt?.connected) dev.gatt.disconnect();
      webDeviceRef.current = null;
    }
    setState(s => ({ ...s, connected: false }));
  }, []);

  return { ...state, isSupported, connect, disconnect };
}

/**
 * Parses the firmware payload:
 *   "TEMP:36.50,TEMP_STATUS:NORMAL,BPM:75,HEART_STATUS:NORMAL,ACT:12,ACT_STATUS:NORMAL"
 * Also accepts JSON {temp, hr, activity} and bare "temp,hr,activity".
 */
function parseLine(line: string): SensorReading | null {
  if (!line) return null;
  try {
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
        const actRaw = map['ACT'] ?? map['ACTIVITY'] ?? map['MOTION'];
        const actStatusRaw = (map['ACT_STATUS'] ?? map['ACTIVITY_STATUS'] ?? map['MOTION_STATUS'])?.toUpperCase();
        let activity = Number(actRaw);
        let motion: 'active' | 'idle' | undefined;
        if (typeof actRaw === 'string') {
          const u = actRaw.toUpperCase();
          if (u === 'ACTIVE' || u === 'IDLE') motion = u.toLowerCase() as 'active' | 'idle';
        }
        if (!Number.isFinite(activity)) {
          activity = Math.min(100, Math.max(0, Math.abs(h - 70)));
        }
        if (!motion) motion = activity > 30 ? 'active' : 'idle';
        const activityStatus = (actStatusRaw === 'NORMAL' || actStatusRaw === 'ABNORMAL')
          ? (actStatusRaw as 'NORMAL' | 'ABNORMAL')
          : undefined;
        return {
          temperature: t,
          heartRate: h,
          activity,
          tempStatus,
          heartStatus,
          activityStatus,
          motion,
          timestamp: Date.now(),
        };
      }
      return null;
    }

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
