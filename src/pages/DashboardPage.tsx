import { useLanguage } from '@/contexts/LanguageContext';
import { mockAnimals, mockAlerts } from '@/data/mockData';
import { motion } from 'framer-motion';
import { PawPrint, Wifi, WifiOff, AlertTriangle, Thermometer, Heart, Activity } from 'lucide-react';

const DashboardPage = () => {
  const { t } = useLanguage();
  const online = mockAnimals.filter(a => a.status === 'online').length;
  const offline = mockAnimals.length - online;
  const activeAlerts = mockAlerts.filter(a => !a.read).length;

  const stats = [
    { label: t('dash.total'), value: mockAnimals.length, icon: PawPrint, color: 'text-primary' },
    { label: t('dash.online'), value: online, icon: Wifi, color: 'text-success' },
    { label: t('dash.offline'), value: offline, icon: WifiOff, color: 'text-destructive' },
    { label: t('dash.alerts'), value: activeAlerts, icon: AlertTriangle, color: 'text-warning' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">{t('nav.dashboard')}</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{s.value}</p>
              </div>
              <div className={`rounded-xl bg-muted p-3 ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animal Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockAnimals.map((animal, i) => (
          <motion.div
            key={animal.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{animal.name}</p>
                  <p className="text-xs text-muted-foreground">{animal.collarId}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                animal.status === 'online'
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${animal.status === 'online' ? 'bg-success animate-pulse-soft' : 'bg-destructive'}`} />
                {t(`status.${animal.status}`)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <Thermometer className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <p className={`text-lg font-bold ${animal.temperature > 40 || animal.temperature < 35 ? 'text-destructive' : 'text-foreground'}`}>
                  {animal.temperature}°
                </p>
                <p className="text-[10px] text-muted-foreground">{t('temp')}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <Heart className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <p className={`text-lg font-bold ${animal.heartRate > 100 || animal.heartRate < 50 ? 'text-destructive' : 'text-foreground'}`}>
                  {animal.heartRate}
                </p>
                <p className="text-[10px] text-muted-foreground">BPM</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <Activity className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">{t(`status.${animal.motion}`)}</p>
                <p className="text-[10px] text-muted-foreground">{t('motion')}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
