import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, KeyRound, PawPrint, MapPin } from 'lucide-react';

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
  const [animalType, setAnimalType] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');

  const animalTypes = [
    { value: 'cow', label: t('login.animal.cow') },
    { value: 'sheep', label: t('login.animal.sheep') },
    { value: 'horse', label: t('login.animal.horse') },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !farmerCode || !animalType || !wilaya || !area) {
      setError(t('login.error.empty'));
      return;
    }
    const validCode = VALID_FARMERS[username.toLowerCase()];
    if (!validCode || validCode !== farmerCode) {
      setError(t('login.error.invalid'));
      return;
    }
    localStorage.setItem('maraai_user', JSON.stringify({ username, farmerCode, animalType, wilaya, area }));
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <PawPrint className="h-7 w-7 text-primary" />
            </div>
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
                <Select value={animalType} onValueChange={setAnimalType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('login.animal_type.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {animalTypes.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('login.wilaya')}
                </Label>
                <Select value={wilaya} onValueChange={setWilaya}>
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

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('login.area')}
                </Label>
                <Input value={area} onChange={e => setArea(e.target.value)} placeholder={t('login.area.placeholder')} />
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
