import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBLEContext } from '@/contexts/BLEContext';
import { mockAnimals, mockAlerts, generateTimeSeriesData } from '@/data/mockData';
import { motion } from 'framer-motion';
import {
  ArrowLeft, PawPrint, Thermometer, Heart, Activity, MapPin,
  Wifi, WifiOff, Baby, Calendar, Weight, Clock, Dna, BluetoothConnected
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnimalProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const ble = useBLEContext();

  const baseAnimal = mockAnimals.find(a => a.id === id);
  if (!baseAnimal) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">{t('profile.not_found')}</p>
        <button onClick={() => navigate('/animals')} className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          {t('nav.animals')}
        </button>
      </div>
    );
  }

  // Override with live BLE reading if this animal is bound to a connected device
  const isLive = ble.connected && ble.boundAnimalId === baseAnimal.id && !!ble.reading;
  const animal = isLive
    ? {
        ...baseAnimal,
        temperature: Number(ble.reading!.temperature.toFixed(1)),
        heartRate: Math.round(ble.reading!.heartRate),
        motion: (ble.reading!.activity > 30 ? 'active' : 'idle') as 'active' | 'idle',
        status: 'online' as const,
        timestamp: ble.reading!.timestamp,
      }
    : baseAnimal;

  const alerts = mockAlerts.filter(a => a.animalId === animal.id);
  const chartData = generateTimeSeriesData(animal.id, 24);

  const pregnancyStatusColor = (status?: string) => {
    switch (status) {
      case 'early': return 'bg-blue-500/10 text-blue-500';
      case 'mid': return 'bg-amber-500/10 text-amber-500';
      case 'late': return 'bg-orange-500/10 text-orange-500';
      case 'overdue': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const pregnancyProgress = animal.pregnancy?.monthsPregnant
    ? Math.min((animal.pregnancy.monthsPregnant / 9) * 100, 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button onClick={() => navigate('/animals')}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t('profile.back')}
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PawPrint className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{animal.name}</h1>
            <p className="text-sm text-muted-foreground">{animal.collarId} · {t(`profile.type.${animal.type}`)} · {animal.breed}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
          animal.status === 'online' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
        }`}>
          {animal.status === 'online' ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {t(`status.${animal.status}`)}
        </span>
      </motion.div>

      {/* Info Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Thermometer, label: t('temp'), value: `${animal.temperature}°C`, alert: animal.temperature > 40 || animal.temperature < 35 },
          { icon: Heart, label: t('heart'), value: `${animal.heartRate} BPM`, alert: animal.heartRate > 100 || animal.heartRate < 50 },
          { icon: Activity, label: t('motion'), value: t(`status.${animal.motion}`), alert: false },
          { icon: MapPin, label: t('profile.location'), value: `${animal.lat.toFixed(4)}, ${animal.lng.toFixed(4)}`, alert: false },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <item.icon className="h-4 w-4" /> <span className="text-xs">{item.label}</span>
            </div>
            <p className={`text-xl font-bold ${item.alert ? 'text-destructive' : 'text-foreground'}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Details + Pregnancy */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {/* Animal Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{t('profile.details')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Dna, label: t('profile.breed'), value: animal.breed },
              { icon: Calendar, label: t('profile.age'), value: `${animal.age} ${t('profile.years')}` },
              { icon: Weight, label: t('profile.weight'), value: `${animal.weight} kg` },
              { icon: PawPrint, label: t('profile.sex'), value: t(`profile.sex.${animal.sex}`) },
              { icon: Clock, label: t('profile.last_update'), value: new Date(animal.timestamp).toLocaleTimeString() },
              { icon: PawPrint, label: t('profile.type_label'), value: t(`profile.type.${animal.type}`) },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-muted p-2"><item.icon className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pregnancy Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Baby className="h-5 w-5 text-primary" /> {t('profile.pregnancy')}
          </h2>
          {animal.sex === 'male' ? (
            <p className="text-sm text-muted-foreground">{t('profile.pregnancy.na_male')}</p>
          ) : !animal.pregnancy?.pregnant ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-3 rounded-full bg-muted p-4"><Baby className="h-8 w-8 text-muted-foreground" /></div>
              <p className="text-sm font-medium text-foreground">{t('profile.pregnancy.not_pregnant')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pregnancyStatusColor(animal.pregnancy.status)}`}>
                  {t(`profile.pregnancy.${animal.pregnancy.status}`)}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {animal.pregnancy.monthsPregnant}/9 {t('profile.pregnancy.months')}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pregnancyProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">{t('profile.pregnancy.month')}</p>
                  <p className="text-lg font-bold text-foreground">{animal.pregnancy.monthsPregnant}</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xs text-muted-foreground">{t('profile.pregnancy.due')}</p>
                  <p className="text-sm font-bold text-foreground">{animal.pregnancy.expectedDueDate}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{t('analytics.temp_over_time')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[36, 42]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{t('analytics.heart_over_time')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[40, 120]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="heartRate" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{t('nav.alerts')}</h2>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`flex items-center justify-between rounded-xl p-3 ${alert.read ? 'bg-muted/30' : 'bg-destructive/5 border border-destructive/20'}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{t(`alert.${alert.type}`)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
                {alert.value > 0 && <span className="text-sm font-bold text-foreground">{alert.value}</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnimalProfilePage;
