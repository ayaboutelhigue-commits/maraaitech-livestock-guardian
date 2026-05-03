import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'en' | 'ar' | 'fr';

const LANGS: Lang[] = ['en', 'ar', 'fr'];
const LANG_LABELS: Record<Lang, string> = { en: 'EN', ar: 'ع', fr: 'FR' };

interface LanguageContextType {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
  langs: typeof LANGS;
  langLabel: (l: Lang) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  'app.name': { en: 'RaaiTech', ar: 'techراعي', fr: 'RaaiTech' },
  'nav.home': { en: 'Home', ar: 'الرئيسية', fr: 'Accueil' },
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم', fr: 'Tableau de bord' },
  'nav.map': { en: 'Live Map', ar: 'الخريطة الحية', fr: 'Carte en direct' },
  'nav.analytics': { en: 'Analytics', ar: 'التحليلات', fr: 'Analytique' },
  'nav.animals': { en: 'Animals', ar: 'الحيوانات', fr: 'Animaux' },
  'nav.alerts': { en: 'Alerts', ar: 'التنبيهات', fr: 'Alertes' },
  'home.hero.title': { en: 'Smart Livestock Monitoring', ar: 'مراقبة الماشية الذكية', fr: 'Surveillance intelligente du bétail' },
  'home.hero.subtitle': { en: 'Real-time health tracking, GPS location, and intelligent alerts for your livestock — all in one platform.', ar: 'تتبع صحي فوري، تحديد الموقع الجغرافي، وتنبيهات ذكية لماشيتك — كل ذلك في منصة واحدة.', fr: 'Suivi de santé en temps réel, localisation GPS et alertes intelligentes pour votre bétail — tout en une seule plateforme.' },
  'home.hero.cta': { en: 'Start Monitoring', ar: 'ابدأ المراقبة', fr: 'Commencer la surveillance' },
  'home.features': { en: 'Features', ar: 'المميزات', fr: 'Fonctionnalités' },
  'home.how': { en: 'How It Works', ar: 'كيف يعمل', fr: 'Comment ça marche' },
  'feature.gps': { en: 'GPS Tracking', ar: 'تتبع GPS', fr: 'Suivi GPS' },
  'feature.gps.desc': { en: 'Real-time location tracking with movement history', ar: 'تتبع الموقع الفوري مع سجل الحركة', fr: 'Suivi de localisation en temps réel avec historique des mouvements' },
  'feature.health': { en: 'Health Monitoring', ar: 'مراقبة الصحة', fr: 'Surveillance de la santé' },
  'feature.health.desc': { en: 'Temperature and heart rate monitoring 24/7', ar: 'مراقبة الحرارة ونبض القلب على مدار الساعة', fr: 'Surveillance de la température et du rythme cardiaque 24h/24' },
  'feature.alerts': { en: 'Smart Alerts', ar: 'تنبيهات ذكية', fr: 'Alertes intelligentes' },
  'feature.alerts.desc': { en: 'Instant notifications for abnormal readings', ar: 'إشعارات فورية عند القراءات غير الطبيعية', fr: 'Notifications instantanées pour les lectures anormales' },
  'feature.analytics': { en: 'Data Analytics', ar: 'تحليل البيانات', fr: 'Analyse de données' },
  'feature.analytics.desc': { en: 'Historical data analysis and trends', ar: 'تحليل البيانات التاريخية والاتجاهات', fr: 'Analyse des données historiques et tendances' },
  'how.step1': { en: 'Attach IoT collar to animal', ar: 'تثبيت الطوق الذكي على الحيوان', fr: 'Fixer le collier IoT sur l\'animal' },
  'how.step2': { en: 'Data streams to cloud in real-time', ar: 'البيانات تُرسل للسحابة فورياً', fr: 'Les données sont envoyées au cloud en temps réel' },
  'how.step3': { en: 'Monitor from anywhere on any device', ar: 'راقب من أي مكان وعلى أي جهاز', fr: 'Surveillez de n\'importe où sur n\'importe quel appareil' },
  'dash.total': { en: 'Total Animals', ar: 'إجمالي الحيوانات', fr: 'Total des animaux' },
  'dash.online': { en: 'Online', ar: 'متصل', fr: 'En ligne' },
  'dash.offline': { en: 'Offline', ar: 'غير متصل', fr: 'Hors ligne' },
  'dash.alerts': { en: 'Active Alerts', ar: 'تنبيهات نشطة', fr: 'Alertes actives' },
  'status.online': { en: 'Online', ar: 'متصل', fr: 'En ligne' },
  'status.offline': { en: 'Offline', ar: 'غير متصل', fr: 'Hors ligne' },
  'status.active': { en: 'Active', ar: 'نشط', fr: 'Actif' },
  'status.idle': { en: 'Idle', ar: 'خامل', fr: 'Inactif' },
  'temp': { en: 'Temperature', ar: 'الحرارة', fr: 'Température' },
  'heart': { en: 'Heart Rate', ar: 'نبض القلب', fr: 'Rythme cardiaque' },
  'motion': { en: 'Motion', ar: 'الحركة', fr: 'Mouvement' },
  'animal.name': { en: 'Name', ar: 'الاسم', fr: 'Nom' },
  'animal.id': { en: 'Animal ID', ar: 'رقم الحيوان', fr: 'ID Animal' },
  'animal.collar': { en: 'Collar ID', ar: 'رقم الطوق', fr: 'ID Collier' },
  'animal.add': { en: 'Add Animal', ar: 'إضافة حيوان', fr: 'Ajouter un animal' },
  'animal.edit': { en: 'Edit', ar: 'تعديل', fr: 'Modifier' },
  'animal.delete': { en: 'Delete', ar: 'حذف', fr: 'Supprimer' },
  'animal.save': { en: 'Save', ar: 'حفظ', fr: 'Enregistrer' },
  'animal.cancel': { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler' },
  'alert.temp_high': { en: 'High Temperature', ar: 'حرارة مرتفعة', fr: 'Température élevée' },
  'alert.temp_low': { en: 'Low Temperature', ar: 'حرارة منخفضة', fr: 'Température basse' },
  'alert.heart_high': { en: 'High Heart Rate', ar: 'نبض مرتفع', fr: 'Rythme cardiaque élevé' },
  'alert.heart_low': { en: 'Low Heart Rate', ar: 'نبض منخفض', fr: 'Rythme cardiaque bas' },
  'alert.offline': { en: 'Device Offline', ar: 'الجهاز غير متصل', fr: 'Appareil hors ligne' },
  'alert.possible_disease': { en: 'Possible disease', ar: 'مرض محتمل', fr: 'Maladie possible' },
  'alert.suggestion_note': { en: 'Suggestion only, not a diagnosis', ar: 'اقتراح فقط وليس تشخيصاً', fr: 'Suggestion uniquement, pas un diagnostic' },
  'alert.urgent': { en: '⚠️ URGENT — Call Veterinarian Immediately!', ar: '⚠️ عاجل — اتصل بالطبيب البيطري فوراً!', fr: '⚠️ URGENT — Appelez le vétérinaire immédiatement !' },
  'alert.call_vet': { en: 'Call Vet', ar: 'اتصل بالبيطري', fr: 'Appeler le vétérinaire' },
  'alert.vet_phone': { en: 'Veterinary Emergency', ar: 'طوارئ بيطرية', fr: 'Urgence vétérinaire' },
  'analytics.temp_over_time': { en: 'Temperature Over Time', ar: 'الحرارة عبر الزمن', fr: 'Température au fil du temps' },
  'analytics.heart_over_time': { en: 'Heart Rate Over Time', ar: 'نبض القلب عبر الزمن', fr: 'Rythme cardiaque au fil du temps' },
  'analytics.activity': { en: 'Activity Levels', ar: 'مستويات النشاط', fr: 'Niveaux d\'activité' },
  'analytics.filter': { en: 'Filter by Animal', ar: 'تصفية حسب الحيوان', fr: 'Filtrer par animal' },
  'analytics.all': { en: 'All Animals', ar: 'كل الحيوانات', fr: 'Tous les animaux' },
  'export': { en: 'Export CSV', ar: 'تصدير CSV', fr: 'Exporter CSV' },
  'dark_mode': { en: 'Dark Mode', ar: 'الوضع الداكن', fr: 'Mode sombre' },
  'login': { en: 'Login', ar: 'تسجيل الدخول', fr: 'Connexion' },
  'signup': { en: 'Sign Up', ar: 'إنشاء حساب', fr: 'S\'inscrire' },
  'email': { en: 'Email', ar: 'البريد الإلكتروني', fr: 'E-mail' },
  'password': { en: 'Password', ar: 'كلمة المرور', fr: 'Mot de passe' },
  'logout': { en: 'Logout', ar: 'تسجيل الخروج', fr: 'Déconnexion' },
  'login.title': { en: 'Log in to access the monitoring dashboard', ar: 'سجل الدخول للوصول إلى لوحة المراقبة', fr: 'Connectez-vous pour accéder au tableau de bord' },
  'login.username': { en: 'Username', ar: 'اسم المستخدم', fr: 'Nom d\'utilisateur' },
  'login.username.placeholder': { en: 'Enter your username', ar: 'أدخل اسم المستخدم', fr: 'Entrez votre nom d\'utilisateur' },
  'login.code': { en: 'Farmer Code', ar: 'رمز المزارع', fr: 'Code agriculteur' },
  'login.code.placeholder': { en: 'Enter your farmer code', ar: 'أدخل رمز المزارع', fr: 'Entrez votre code agriculteur' },
  'login.animal_type': { en: 'Animal Type', ar: 'نوع الحيوانات', fr: 'Type d\'animal' },
  'login.animal_type.placeholder': { en: 'Select type', ar: 'اختر النوع', fr: 'Choisir le type' },
  'login.animal.cow': { en: 'Cows', ar: 'أبقار', fr: 'Vaches' },
  'login.animal.sheep': { en: 'Sheep', ar: 'أغنام', fr: 'Moutons' },
  'login.animal.horse': { en: 'Horses', ar: 'خيول', fr: 'Chevaux' },
  'login.wilaya': { en: 'Wilaya', ar: 'الولاية', fr: 'Wilaya' },
  'login.wilaya.placeholder': { en: 'Select wilaya', ar: 'اختر الولاية', fr: 'Choisir la wilaya' },
  'login.area': { en: 'Commune / Municipality', ar: 'البلدية', fr: 'Commune' },
  'login.area.placeholder': { en: 'Select your commune', ar: 'اختر بلديتك', fr: 'Choisissez votre commune' },
  'login.submit': { en: 'Access Dashboard', ar: 'دخول', fr: 'Accéder au tableau de bord' },
  'login.error.empty': { en: 'Please fill in all fields', ar: 'يرجى ملء جميع الحقول', fr: 'Veuillez remplir tous les champs' },
  'login.error.invalid': { en: 'Invalid username or farmer code', ar: 'اسم المستخدم أو رمز المزارع غير صحيح', fr: 'Nom d\'utilisateur ou code agriculteur invalide' },
  // Animal profile translations
  'profile.back': { en: 'Back to Animals', ar: 'العودة للحيوانات', fr: 'Retour aux animaux' },
  'profile.not_found': { en: 'Animal not found', ar: 'الحيوان غير موجود', fr: 'Animal introuvable' },
  'profile.details': { en: 'Animal Details', ar: 'تفاصيل الحيوان', fr: 'Détails de l\'animal' },
  'profile.breed': { en: 'Breed', ar: 'السلالة', fr: 'Race' },
  'profile.age': { en: 'Age', ar: 'العمر', fr: 'Âge' },
  'profile.years': { en: 'years', ar: 'سنوات', fr: 'ans' },
  'profile.weight': { en: 'Weight', ar: 'الوزن', fr: 'Poids' },
  'profile.sex': { en: 'Sex', ar: 'الجنس', fr: 'Sexe' },
  'profile.sex.male': { en: 'Male', ar: 'ذكر', fr: 'Mâle' },
  'profile.sex.female': { en: 'Female', ar: 'أنثى', fr: 'Femelle' },
  'profile.last_update': { en: 'Last Update', ar: 'آخر تحديث', fr: 'Dernière mise à jour' },
  'profile.type_label': { en: 'Type', ar: 'النوع', fr: 'Type' },
  'profile.type.cow': { en: 'Cow', ar: 'بقرة', fr: 'Vache' },
  'profile.type.sheep': { en: 'Sheep', ar: 'غنم', fr: 'Mouton' },
  'profile.type.horse': { en: 'Horse', ar: 'حصان', fr: 'Cheval' },
  'profile.location': { en: 'Location', ar: 'الموقع', fr: 'Position' },
  'profile.pregnancy': { en: 'Pregnancy Status', ar: 'حالة الحمل', fr: 'État de grossesse' },
  'profile.pregnancy.na_male': { en: 'Not applicable (male)', ar: 'لا ينطبق (ذكر)', fr: 'Non applicable (mâle)' },
  'profile.pregnancy.not_pregnant': { en: 'Not Pregnant', ar: 'غير حامل', fr: 'Non gestante' },
  'profile.pregnancy.early': { en: 'Early Stage', ar: 'مرحلة مبكرة', fr: 'Stade précoce' },
  'profile.pregnancy.mid': { en: 'Mid Stage', ar: 'مرحلة متوسطة', fr: 'Stade intermédiaire' },
  'profile.pregnancy.late': { en: 'Late Stage', ar: 'مرحلة متقدمة', fr: 'Stade avancé' },
  'profile.pregnancy.overdue': { en: 'Overdue', ar: 'متأخرة', fr: 'En retard' },
  'profile.pregnancy.months': { en: 'months', ar: 'أشهر', fr: 'mois' },
  'profile.pregnancy.month': { en: 'Current Month', ar: 'الشهر الحالي', fr: 'Mois actuel' },
  'profile.pregnancy.due': { en: 'Expected Due', ar: 'الموعد المتوقع', fr: 'Date prévue' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang, dir]);

  const t = (key: string) => translations[key]?.[lang] || key;
  const toggleLang = () => {
    const idx = LANGS.indexOf(lang);
    setLangState(LANGS[(idx + 1) % LANGS.length]);
  };
  const setLang = (l: Lang) => setLangState(l);

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLang, setLang, langs: LANGS, langLabel: (l) => LANG_LABELS[l] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
