import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { User, KeyRound, PawPrint, MapPin, Bluetooth, Map as MapIcon, Phone } from 'lucide-react';
import logo from '@/assets/logo.png';
import { WILAYA_COMMUNES } from '@/data/wilayaCommunes';

const VALID_FARMERS: Record<string, string> = {
  'farmer1': '1234',
  'farmer2': '5678',
  'admin': '0000',
};

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi',
  'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt',
  'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla',
  'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane',
  'El M\'Ghair', 'El Meniaa', 'Ouled Djellal', 'Bordj Badji Mokhtar',
  'Béni Abbès', 'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
];

const LoginPage = () => {
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [farmerCode, setFarmerCode] = useState('');
  const [animalTypes, setAnimalTypes] = useState<string[]>([]);
  const [wilaya, setWilaya] = useState('');
  const [commune, setCommune] = useState('');
  const defaultCollarName = (i: number) => (i === 0 ? 'kiky' : `kiky${i + 1}`);
  const [numCollars, setNumCollars] = useState(1);
  const [collarNames, setCollarNames] = useState<string[]>([defaultCollarName(0)]);
  const [farmLocation, setFarmLocation] = useState({ lat: '', lng: '' });
  const [error, setError] = useState('');

  const updateNumCollars = (n: number) => {
    const v = Math.max(1, Math.min(50, n || 1));
    setNumCollars(v);
    setCollarNames(prev => {
      const next = [...prev];
      while (next.length < v) next.push(defaultCollarName(next.length));
      next.length = v;
      return next;
    });
  };

  const setCollarName = (i: number, name: string) => {
    setCollarNames(prev => prev.map((n, idx) => (idx === i ? name : n)));
  };

  const animalOptions = [
    { value: 'cow', label: t('login.animal.cow') },
    { value: 'sheep', label: t('login.animal.sheep') },
    { value: 'horse', label: t('login.animal.horse') },
  ];

  const communes = useMemo(() => {
    if (!wilaya) return [];
    return WILAYA_COMMUNES[wilaya] || [];
  }, [wilaya]);

  const toggleAnimalType = (value: string) => {
    setAnimalTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !farmerCode || animalTypes.length === 0 || !wilaya || !commune) {
      setError(t('login.error.empty'));
      return;
    }
    if (collarNames.some(n => !n.trim())) {
      setError(t('login.error.empty'));
      return;
    }
    const validCode = VALID_FARMERS[username.toLowerCase()];
    if (!validCode || validCode !== farmerCode) {
      setError(t('login.error.invalid'));
      return;
    }
    const collars = collarNames.map(n => ({ name: n.trim() }));
    const fl = farmLocation.lat && farmLocation.lng
      ? { lat: parseFloat(farmLocation.lat), lng: parseFloat(farmLocation.lng) }
      : undefined;
    localStorage.setItem('maraai_user', JSON.stringify({
      username, farmerCode, animalTypes, wilaya, commune,
      numCollars, collars, farmLocation: fl,
    }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-end">
              <button onClick={toggleLang} className="rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                {lang === 'en' ? 'FR' : lang === 'fr' ? 'ع' : 'EN'}
              </button>
            </div>
            <img src={logo} alt="RaaiTech" className="mx-auto h-20 w-20 object-contain" />
            <CardTitle className="text-2xl font-bold text-primary">
              {t('app.name')}
            </CardTitle>
            <CardDescription>
              {t('login.title')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('login.username')}
                </Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder={t('login.username.placeholder')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  {t('login.code')}
                </Label>
                <Input id="code" type="password" value={farmerCode} onChange={e => setFarmerCode(e.target.value)} placeholder={t('login.code.placeholder')} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  {t('login.animal_type')}
                </Label>
                <div className="flex flex-wrap gap-4 rounded-md border border-border p-3">
                  {animalOptions.map(a => (
                    <label key={a.value} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Checkbox
                        checked={animalTypes.includes(a.value)}
                        onCheckedChange={() => toggleAnimalType(a.value)}
                      />
                      {a.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('login.wilaya')}
                </Label>
                <Select value={wilaya} onValueChange={(v) => { setWilaya(v); setCommune(''); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('login.wilaya.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {WILAYAS.map((w, i) => (
                      <SelectItem key={i} value={w}>{`${String(i + 1).padStart(2, '0')} - ${w}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {wilaya && communes.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('login.area')}
                  </Label>
                  <Select value={commune} onValueChange={setCommune}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('login.area.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {communes.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bluetooth className="h-4 w-4" />
                  Number of collars
                </Label>
                <Input
                  type="number" min={1} max={50}
                  value={numCollars}
                  onChange={e => updateNumCollars(parseInt(e.target.value, 10))}
                />
                <div className="space-y-2 pt-1">
                  {collarNames.map((name, i) => (
                    <Input
                      key={i}
                      value={name}
                      onChange={e => setCollarName(i, e.target.value)}
                      placeholder={`Cow / Collar #${i + 1} name`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4" />
                  Farm location (optional)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Latitude" value={farmLocation.lat} onChange={e => setFarmLocation(s => ({ ...s, lat: e.target.value }))} />
                  <Input placeholder="Longitude" value={farmLocation.lng} onChange={e => setFarmLocation(s => ({ ...s, lng: e.target.value }))} />
                </div>
                <p className="text-xs text-muted-foreground">Exact coordinates of your farm — used only to mark its location on the map.</p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                {t('login.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
