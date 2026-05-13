import { motion } from 'framer-motion';
import { Bluetooth, BluetoothConnected, BluetoothOff, Activity, Thermometer, HeartPulse, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBLE, NUS_SERVICE, NUS_TX_CHAR, NUS_RX_CHAR } from '@/hooks/useBLE';

const ARDUINO_SNIPPET = `// Heltec ESP32-S3 LoRa V3 — BLE sensor bridge (Nordic UART Service)
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHAR_TX_UUID        "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // notify
#define CHAR_RX_UUID        "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // write

BLECharacteristic *txChar;
bool deviceConnected = false;

class SrvCb : public BLEServerCallbacks {
  void onConnect(BLEServer*)    { deviceConnected = true;  }
  void onDisconnect(BLEServer* s){ deviceConnected = false; s->getAdvertising()->start(); }
};

void setup() {
  Serial.begin(115200);
  BLEDevice::init("RaaiTech-Collar");
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new SrvCb());
  BLEService *service = server->createService(SERVICE_UUID);

  txChar = service->createCharacteristic(
    CHAR_TX_UUID, BLECharacteristic::PROPERTY_NOTIFY);
  txChar->addDescriptor(new BLE2902());

  service->createCharacteristic(
    CHAR_RX_UUID, BLECharacteristic::PROPERTY_WRITE);

  service->start();
  BLEAdvertising *adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(SERVICE_UUID);
  adv->start();
}

void loop() {
  if (deviceConnected) {
    float temp     = 38.5 + (random(-20, 40) / 100.0); // replace with sensor read
    int   heart    = 70  + random(-10, 20);
    int   activity = random(0, 100);

    char buf[48];
    snprintf(buf, sizeof(buf), "%.2f,%d,%d\\n", temp, heart, activity);
    txChar->setValue((uint8_t*)buf, strlen(buf));
    txChar->notify();
  }
  delay(2000);
}`;

const DevicePage = () => {
  const { lang } = useLanguage();
  const ble = useBLE();

  const labels = {
    en: { title: 'Device (BLE)', subtitle: 'Connect your Heltec ESP32-S3 collar over Bluetooth Low Energy.', connect: 'Connect device', disconnect: 'Disconnect', scan: 'Scanning…', supported: 'Web Bluetooth ready', notSupported: 'Web Bluetooth is not supported in this browser. Use Chrome or Edge on Android or Desktop (HTTPS required).', live: 'Live readings', waiting: 'Waiting for data…', firmware: 'ESP32 firmware (Arduino)', uuids: 'BLE configuration' },
    ar: { title: 'الجهاز (BLE)', subtitle: 'وصّل طوق Heltec ESP32-S3 عبر البلوتوث منخفض الطاقة.', connect: 'وصل الجهاز', disconnect: 'فصل', scan: 'جارٍ البحث…', supported: 'Web Bluetooth جاهز', notSupported: 'هذا المتصفح لا يدعم Web Bluetooth. استخدم Chrome أو Edge على Android أو الحاسوب.', live: 'القراءات المباشرة', waiting: 'في انتظار البيانات…', firmware: 'برنامج ESP32 (Arduino)', uuids: 'إعدادات BLE' },
    fr: { title: 'Appareil (BLE)', subtitle: 'Connectez votre collier Heltec ESP32-S3 via Bluetooth Low Energy.', connect: 'Connecter', disconnect: 'Déconnecter', scan: 'Recherche…', supported: 'Web Bluetooth prêt', notSupported: 'Web Bluetooth non pris en charge. Utilisez Chrome ou Edge sur Android ou Bureau (HTTPS requis).', live: 'Lectures en direct', waiting: 'En attente de données…', firmware: 'Firmware ESP32 (Arduino)', uuids: 'Configuration BLE' },
  }[lang];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">{labels.title}</h1>
        <p className="mt-2 text-muted-foreground">{labels.subtitle}</p>
      </motion.div>

      {/* Connection card */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${ble.connected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {ble.connected ? <BluetoothConnected className="h-6 w-6" /> : ble.isSupported ? <Bluetooth className="h-6 w-6" /> : <BluetoothOff className="h-6 w-6" />}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {ble.isSupported ? labels.supported : labels.notSupported}
              </div>
              <div className="text-base font-semibold text-foreground">
                {ble.connected ? ble.deviceName ?? 'Connected' : '—'}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!ble.connected ? (
              <button
                onClick={ble.connect}
                disabled={!ble.isSupported || ble.connecting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                <Bluetooth className="h-4 w-4" />
                {ble.connecting ? labels.scan : labels.connect}
              </button>
            ) : (
              <button
                onClick={ble.disconnect}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <BluetoothOff className="h-4 w-4" />
                {labels.disconnect}
              </button>
            )}
          </div>
        </div>

        {ble.error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {ble.error}
          </div>
        )}
      </div>

      {/* Live readings */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">{labels.live}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ReadingCard icon={<Thermometer className="h-5 w-5" />} label="Temperature" value={ble.reading ? `${ble.reading.temperature.toFixed(1)} °C` : '—'} />
          <ReadingCard icon={<HeartPulse className="h-5 w-5" />} label="Heart rate" value={ble.reading ? `${Math.round(ble.reading.heartRate)} bpm` : '—'} />
          <ReadingCard icon={<Activity className="h-5 w-5" />} label="Activity" value={ble.reading ? `${Math.round(ble.reading.activity)}` : '—'} />
        </div>
        {!ble.reading && ble.connected && (
          <p className="mt-3 text-sm text-muted-foreground">{labels.waiting}</p>
        )}
      </div>

      {/* BLE config */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{labels.uuids}</h2>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-[160px_1fr]">
          <dt className="text-muted-foreground">Service UUID</dt><dd className="font-mono text-foreground break-all">{NUS_SERVICE}</dd>
          <dt className="text-muted-foreground">Notify (TX)</dt><dd className="font-mono text-foreground break-all">{NUS_TX_CHAR}</dd>
          <dt className="text-muted-foreground">Write (RX)</dt><dd className="font-mono text-foreground break-all">{NUS_RX_CHAR}</dd>
          <dt className="text-muted-foreground">Format</dt><dd className="font-mono text-foreground">temperature,heartRate,activity\n</dd>
        </dl>
      </div>

      {/* Firmware snippet */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">{labels.firmware}</h2>
        <pre dir="ltr" className="max-h-[420px] overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed text-foreground">
{ARDUINO_SNIPPET}
        </pre>
      </div>
    </div>
  );
};

const ReadingCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
  </div>
);

export default DevicePage;
