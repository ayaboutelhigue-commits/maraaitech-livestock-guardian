import { useLanguage } from '@/contexts/LanguageContext';
import { mockAnimals, Animal } from '@/data/mockData';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Download, Eye } from 'lucide-react';

const AnimalsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>(mockAnimals);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', id: '', collarId: '' });

  const handleSave = () => {
    if (!form.name || !form.id || !form.collarId) return;
    if (editId) {
      setAnimals(prev => prev.map(a => a.id === editId ? { ...a, name: form.name, collarId: form.collarId } : a));
    } else {
      const newAnimal: Animal = {
        id: form.id, name: form.name, collarId: form.collarId,
        temperature: 38.5, heartRate: 70, motion: 'idle',
        lat: 36.19 + Math.random() * 0.01, lng: 5.41 + Math.random() * 0.01,
        status: 'online', timestamp: Date.now(),
        type: 'cow', age: 1, weight: 100, breed: 'Unknown', sex: 'female',
      };
      setAnimals(prev => [...prev, newAnimal]);
    }
    setShowForm(false); setEditId(null); setForm({ name: '', id: '', collarId: '' });
  };

  const handleEdit = (a: Animal) => {
    setForm({ name: a.name, id: a.id, collarId: a.collarId });
    setEditId(a.id); setShowForm(true);
  };

  const handleDelete = (id: string) => setAnimals(prev => prev.filter(a => a.id !== id));

  const exportCSV = () => {
    const csv = ['Name,ID,Collar,Temp,HeartRate,Motion,Status',
      ...animals.map(a => `${a.name},${a.id},${a.collarId},${a.temperature},${a.heartRate},${a.motion},${a.status}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'animals.csv'; link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('nav.animals')}</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            <Download className="h-4 w-4" /> {t('export')}
          </button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', id: '', collarId: '' }); }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-105">
            <Plus className="h-4 w-4" /> {t('animal.add')}
          </button>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{editId ? t('animal.edit') : t('animal.add')}</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <input placeholder={t('animal.name')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground" />
                <input placeholder={t('animal.id')} value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
                  disabled={!!editId}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground disabled:opacity-50" />
                <input placeholder={t('animal.collar')} value={form.collarId} onChange={e => setForm(f => ({ ...f, collarId: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground" />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">{t('animal.cancel')}</button>
                <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{t('animal.save')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('animal.name')}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('animal.id')}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('animal.collar')}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('temp')}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('heart')}</th>
              <th className="px-4 py-3 text-end font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {animals.map(a => (
              <tr key={a.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{a.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.collarId}</td>
                <td className="px-4 py-3 text-foreground">{a.temperature}°C</td>
                <td className="px-4 py-3 text-foreground">{a.heartRate} BPM</td>
                <td className="px-4 py-3 text-end">
                  <button onClick={() => navigate(`/animals/${a.id}`)} className="rounded p-1.5 text-primary hover:bg-primary/10"><Eye className="h-4 w-4" /></button>
                  <button onClick={() => handleEdit(a)} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnimalsPage;
