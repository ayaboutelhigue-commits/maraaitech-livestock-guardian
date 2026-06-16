import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { suggestDiseases } from '@/utils/diseaseSuggestion';
import { isDangerous } from '@/utils/urgencyCheck';
import { motion } from 'framer-motion';
import { AlertTriangle, Thermometer, Heart, Activity, CheckCircle2, Stethoscope, Phone, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readFarmConfig, useUserAnimals } from '@/hooks/useUserAnimals';
import { findClosestVet } from '@/data/vets';
import { Animal } from '@/data/mockData';

type AlertItem = { type: 'temp_high' | 'temp_low' | 'heart_high' | 'heart_low' | 'activity_abnormal'; value: number | string; icon: typeof Thermometer };

function computeAlerts(a: Animal): AlertItem[] {
  const out: AlertItem[] = [];
  if (a.temperature != null) {
    if (a.temperature > 39.5) out.push({ type: 'temp_high', value: a.temperature, icon: Thermometer });
    else if (a.temperature < 37.5) out.push({ type: 'temp_low', value: a.temperature, icon: Thermometer });
  }
  if (a.heartRate != null) {
    if (a.heartRate > 100) out.push({ type: 'heart_high', value: a.heartRate, icon: Heart });
    else if (a.heartRate < 50) out.push({ type: 'heart_low', value: a.heartRate, icon: Heart });
  }
  if (a.activityStatus === 'ABNORMAL') {
    out.push({ type: 'activity_abnormal', value: a.motion ?? '—', icon: Activity });
  }
  return out;
}

const AlertsPage = () => {
  const { t, lang } = useLanguage();
  const animals = useUserAnimals();
  const animal = animals[0];

  const { vetLabel, vetPhone, vetSubLabel } = useMemo(() => {
    const cfg = readFarmConfig() as ReturnType<typeof readFarmConfig> & { vetPhone?: string };
    if (cfg.vetPhone) return { vetLabel: 'Your vet', vetPhone: cfg.vetPhone, vetSubLabel: cfg.vetPhone };
    const closest = findClosestVet(cfg.farmLocation, cfg.wilaya);
    if (!closest) return { vetLabel: 'Vet', vetPhone: '', vetSubLabel: '' };
    const sub = closest.distanceKm > 0
      ? `${closest.name} · ~${closest.distanceKm.toFixed(0)} km`
      : `${closest.name} (${closest.wilaya})`;
    return { vetLabel: 'Closest vet', vetPhone: closest.phone, vetSubLabel: sub };
  }, []);

  if (!animal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{t('nav.alerts')}</h1>
        <p className="text-muted-foreground">—</p>
      </div>
    );
  }

  const hasData = animal.temperature != null && animal.heartRate != null;
  const alerts = computeAlerts(animal);
  const urgent = isDangerous(animal);
  const diseases = hasData ? suggestDiseases(animal, lang) : [];
  const inAlert = alerts.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('nav.alerts')}</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-5 shadow-card ${
          !hasData
            ? 'border-border bg-muted/30'
            : urgent
              ? 'border-red-500/60 bg-red-500/10 ring-2 ring-red-500/30'
              : inAlert
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-green-500/40 bg-green-500/5'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            !hasData ? 'bg-muted text-muted-foreground'
              : urgent ? 'bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse'
              : inAlert ? 'bg-destructive/10 text-destructive'
              : 'bg-green-500/15 text-green-600 dark:text-green-400'
          }`}>
            {!hasData ? <WifiOff className="h-6 w-6" />
              : inAlert ? <AlertTriangle className="h-6 w-6" />
              : <CheckCircle2 className="h-6 w-6" />}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-foreground">{animal.name}</p>
              <span className="text-xs text-muted-foreground">({animal.collarId})</span>
            </div>

            {!hasData ? (
              <p className="mt-1 text-sm text-muted-foreground">{t('alert.no_data')}</p>
            ) : (
              <>
                <p className={`mt-1 text-sm font-semibold ${inAlert ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                  {inAlert ? t('alert.status_alert') : t('alert.status_ok')}
                </p>

                {/* readings */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                    <Thermometer className="h-3.5 w-3.5" /> {animal.temperature?.toFixed(1)}°C
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                    <Heart className="h-3.5 w-3.5" /> {animal.heartRate} BPM
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${animal.activityStatus === 'ABNORMAL' ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
                    <Activity className="h-3.5 w-3.5" />
                    {animal.motion ?? '—'}
                    {animal.activityStatus && <span className="ml-1 text-[10px] font-semibold">· {animal.activityStatus}</span>}
                  </span>
                </div>

                {/* triggered alerts */}
                {inAlert && (
                  <ul className="mt-3 space-y-1">
                    {alerts.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <a.icon className="h-4 w-4 text-destructive" />
                        <span className="font-medium">{t(`alert.${a.type}`)}</span>
                        <span className="text-muted-foreground">
                          — {a.value}{a.type.includes('temp') ? '°C' : ' BPM'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* disease suggestions */}
                {diseases.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      {t('alert.possible_disease')}:
                    </span>
                    {diseases.map((d, idx) => (
                      <span key={idx} className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {/* vet call: urgent OR any alert */}
                {inAlert && vetPhone && (
                  <div className={`mt-4 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                    urgent ? 'border-red-500/40 bg-red-500/10' : 'border-destructive/30 bg-destructive/5'
                  }`}>
                    <div className="flex items-center gap-2">
                      {urgent && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 animate-bounce" />}
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${urgent ? 'text-red-700 dark:text-red-300' : 'text-destructive'}`}>
                          {urgent ? t('alert.urgent') : t('alert.call_vet')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {vetLabel}: {vetSubLabel}
                        </span>
                      </div>
                    </div>
                    <a href={`tel:${vetPhone}`}>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Phone className="h-4 w-4" />
                        {t('alert.call_vet')}
                      </Button>
                    </a>
                  </div>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(animal.timestamp || Date.now()).toLocaleString()}
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AlertsPage;
