import { useLanguage } from '@/contexts/LanguageContext';
import { mockAlerts } from '@/data/mockData';
import { motion } from 'framer-motion';
import { AlertTriangle, Thermometer, Heart, WifiOff } from 'lucide-react';

const iconMap: Record<string, typeof AlertTriangle> = {
  temp_high: Thermometer, temp_low: Thermometer,
  heart_high: Heart, heart_low: Heart,
  offline: WifiOff,
};

const AlertsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('nav.alerts')}</h1>
      <div className="space-y-3">
        {mockAlerts.map((alert, i) => {
          const Icon = iconMap[alert.type] || AlertTriangle;
          const isUnread = !alert.read;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-4 rounded-2xl border p-4 shadow-card transition-colors ${
                isUnread ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isUnread ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
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
