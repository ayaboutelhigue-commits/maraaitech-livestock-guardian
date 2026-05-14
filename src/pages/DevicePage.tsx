import { motion } from 'framer-motion';
import { Bluetooth, BluetoothConnected, BluetoothOff, PawPrint } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBLEContext } from '@/contexts/BLEContext';
import { useUserAnimals } from '@/hooks/useUserAnimals';

const DevicePage = () => {
  const { lang } = useLanguage();
  const ble = useBLEContext();
  const animals = useUserAnimals();

  const labels = {
    en: { title: 'Devices', subtitle: 'Connect your collar over Bluetooth and link it to an animal.', connect: 'Connect device', disconnect: 'Disconnect', scan: 'Scanning…', supported: 'Web Bluetooth ready', notSupported: 'Web Bluetooth is not supported in this browser. Use Chrome or Edge on Android or Desktop.', noDevice: 'No device connected', linkTo: 'Link this device to an animal', linked: 'Linked to', unlink: 'Unlink', pick: 'Choose an animal' },
    ar: { title: 'الأجهزة', subtitle: 'وصّل الطوق عبر البلوتوث واربطه بحيوان.', connect: 'وصل الجهاز', disconnect: 'فصل', scan: 'جارٍ البحث…', supported: 'Web Bluetooth جاهز', notSupported: 'هذا المتصفح لا يدعم Web Bluetooth. استخدم Chrome أو Edge.', noDevice: 'لا يوجد جهاز متصل', linkTo: 'اربط هذا الجهاز بحيوان', linked: 'مرتبط بـ', unlink: 'إلغاء الربط', pick: 'اختر حيوانًا' },
    fr: { title: 'Appareils', subtitle: 'Connectez votre collier en Bluetooth et liez-le à un animal.', connect: 'Connecter', disconnect: 'Déconnecter', scan: 'Recherche…', supported: 'Web Bluetooth prêt', notSupported: 'Web Bluetooth non pris en charge. Utilisez Chrome ou Edge.', noDevice: 'Aucun appareil connecté', linkTo: 'Lier cet appareil à un animal', linked: 'Lié à', unlink: 'Délier', pick: 'Choisir un animal' },
  }[lang];

  const boundAnimal = animals.find(a => a.id === ble.boundAnimalId);

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
                {ble.connected ? ble.deviceName ?? 'Connected' : labels.noDevice}
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

      {/* Bind to animal */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <PawPrint className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{labels.linkTo}</h2>
        </div>

        {boundAnimal ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-foreground">
              {labels.linked} <span className="font-semibold">{boundAnimal.name}</span>{' '}
              <span className="text-muted-foreground">({boundAnimal.collarId})</span>
            </p>
            <button
              onClick={() => ble.bindAnimal(null)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
            >
              {labels.unlink}
            </button>
          </div>
        ) : (
          <select
            value=""
            onChange={(e) => e.target.value && ble.bindAnimal(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="" disabled>{labels.pick}</option>
            {animals.map(a => (
              <option key={a.id} value={a.id}>{a.name} — {a.collarId}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default DevicePage;
