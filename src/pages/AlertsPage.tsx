import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockAlerts, mockAnimals } from '@/data/mockData';
import { suggestDiseases } from '@/utils/diseaseSuggestion';
import { isDangerous } from '@/utils/urgencyCheck';
import { motion } from 'framer-motion';
import { AlertTriangle, Thermometer, Heart, WifiOff, Stethoscope, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readFarmConfig } from '@/hooks/useUserAnimals';
import { findClosestVet } from '@/data/vets';

const iconMap: Record<string, typeof AlertTriangle> = {
  temp_high: Thermometer, temp_low: Thermometer,
  heart_high: Heart, heart_low: Heart,
  offline: WifiOff,
};

const AlertsPage = () => {
  const { t, lang } = useLanguage();

  const { vetLabel, vetPhone, vetSubLabel } = useMemo(() => {
    const cfg = readFarmConfig() as ReturnType<typeof readFarmConfig> & { vetPhone?: string };
    if (cfg.vetPhone) {
      return { vetLabel: 'Your vet', vetPhone: cfg.vetPhone, vetSubLabel: cfg.vetPhone };
    }
    const closest = findClosestVet(cfg.farmLocation, cfg.wilaya);
    if (!closest) return { vetLabel: 'Vet', vetPhone: '', vetSubLabel: '' };
    const sub = closest.distanceKm > 0
      ? `${closest.name} · ~${closest.distanceKm.toFixed(0)} km`
      : `${closest.name} (${closest.wilaya})`;
    return { vetLabel: 'Closest vet', vetPhone: closest.phone, vetSubLabel: sub };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('nav.alerts')}</h1>
      <div className="space-y-3">
        {mockAlerts.map((alert, i) => {
          const Icon = iconMap[alert.type] || AlertTriangle;
          const isUnread = !alert.read;
          const animal = mockAnimals.find(a => a.id === alert.animalId);
          const urgent = animal ? isDangerous(animal) : false;
          const diseases = animal ? suggestDiseases(animal, lang) : [];

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-4 rounded-2xl border p-4 shadow-card transition-colors ${
                urgent
                  ? 'border-red-500/60 bg-red-500/10 ring-2 ring-red-500/30'
                  : isUnread
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-border bg-card'
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                urgent
                  ? 'bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse'
                  : isUnread
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{t(`alert.${alert.type}`)}</p>
                  {isUnread && <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-soft" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {alert.animalName} — {alert.type.includes('offline') ? '' : `${alert.value}${alert.type.includes('temp') ? '°C' : ' BPM'}`}
                </p>

                {/* Disease suggestions */}
                {diseases.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
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

                {/* Urgent vet call banner */}
                {urgent && (
                  <div className="mt-3 flex flex-col gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 animate-bounce" />
                      <span className="text-sm font-bold text-red-700 dark:text-red-300">
                        {t('alert.urgent')}
                      </span>
                    </div>
                    <a href={`tel:${VET_PHONE}`}>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Phone className="h-4 w-4" />
                        {t('alert.call_vet')}
                      </Button>
                    </a>
                  </div>
                )}

                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsPage;
