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
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [farmerCode, setFarmerCode] = useState('');
  const [animalType, setAnimalType] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');

  const isAr = lang === 'ar';

  const animalTypes = [
    { value: 'cow', label: isAr ? 'أبقار' : 'Cows' },
    { value: 'sheep', label: isAr ? 'أغنام' : 'Sheep' },
    { value: 'horse', label: isAr ? 'خيول' : 'Horses' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !farmerCode || !animalType || !wilaya || !area) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <PawPrint className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              {isAr ? 'مراعيTech' : 'MaraaiTech'}
            </CardTitle>
            <CardDescription>
              {isAr ? 'سجل الدخول للوصول إلى لوحة المراقبة' : 'Log in to access the monitoring dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isAr ? 'اسم المستخدم' : 'Username'}
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={isAr ? 'أدخل اسم المستخدم' : 'Enter your username'}
                />
              </div>

              {/* Farmer Code */}
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  {isAr ? 'رمز المزارع' : 'Farmer Code'}
                </Label>
                <Input
                  id="code"
                  type="password"
                  value={farmerCode}
                  onChange={e => setFarmerCode(e.target.value)}
                  placeholder={isAr ? 'أدخل رمز المزارع' : 'Enter your farmer code'}
                />
              </div>

              {/* Animal Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  {isAr ? 'نوع الحيوانات' : 'Animal Type'}
                </Label>
                <Select value={animalType} onValueChange={setAnimalType}>
                  <SelectTrigger>
                    <SelectValue placeholder={isAr ? 'اختر النوع' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {animalTypes.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wilaya */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {isAr ? 'الولاية' : 'Wilaya'}
                </Label>
                <Select value={wilaya} onValueChange={setWilaya}>
                  <SelectTrigger>
                    <SelectValue placeholder={isAr ? 'اختر الولاية' : 'Select wilaya'} />
                  </SelectTrigger>
                  <SelectContent>
                    {WILAYAS.map((w, i) => (
                      <SelectItem key={i} value={w}>{`${String(i + 1).padStart(2, '0')} - ${w}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {isAr ? 'المنطقة / البلدية' : 'Area / Municipality'}
                </Label>
                <Input
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder={isAr ? 'أدخل اسم منطقتك' : 'Enter your area name'}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                {isAr ? 'دخول' : 'Access Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
