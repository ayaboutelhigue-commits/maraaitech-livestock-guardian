import { useLanguage } from '@/contexts/LanguageContext';
import { mockAnimals, generateTimeSeriesData } from '@/data/mockData';
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const AnalyticsPage = () => {
  const { t } = useLanguage();
  const [selectedAnimal, setSelectedAnimal] = useState('all');

  const data = useMemo(() => generateTimeSeriesData(selectedAnimal), [selectedAnimal]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('nav.analytics')}</h1>
        <select
          value={selectedAnimal}
          onChange={e => setSelectedAnimal(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground"
        >
          <option value="all">{t('analytics.all')}</option>
          {mockAnimals.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Temperature */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-semibold text-foreground">{t('analytics.temp_over_time')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(80,15%,88%)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
              <YAxis domain={[35, 43]} tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="hsl(152,55%,33%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Heart Rate */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-semibold text-foreground">{t('analytics.heart_over_time')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(80,15%,88%)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
              <YAxis domain={[40, 120]} tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
              <Tooltip />
              <Line type="monotone" dataKey="heartRate" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <h3 className="mb-4 font-semibold text-foreground">{t('analytics.activity')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(80,15%,88%)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
              <Tooltip />
              <Bar dataKey="activity" fill="hsl(38,70%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
