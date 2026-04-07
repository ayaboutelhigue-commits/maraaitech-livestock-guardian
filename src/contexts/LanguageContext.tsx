import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'en' | 'ar';

interface LanguageContextType {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
  toggleLang: () => void;
}

const translations: Record<string, Record<Lang, string>> = {
  'app.name': { en: 'MaraaiTech', ar: 'مراعيTech' },
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.map': { en: 'Live Map', ar: 'الخريطة الحية' },
  'nav.analytics': { en: 'Analytics', ar: 'التحليلات' },
  'nav.animals': { en: 'Animals', ar: 'الحيوانات' },
  'nav.alerts': { en: 'Alerts', ar: 'التنبيهات' },
  'home.hero.title': { en: 'Smart Livestock Monitoring', ar: 'مراقبة الماشية الذكية' },
  'home.hero.subtitle': { en: 'Real-time health tracking, GPS location, and intelligent alerts for your livestock — all in one platform.', ar: 'تتبع صحي فوري، تحديد الموقع الجغرافي، وتنبيهات ذكية لماشيتك — كل ذلك في منصة واحدة.' },
  'home.hero.cta': { en: 'Start Monitoring', ar: 'ابدأ المراقبة' },
  'home.features': { en: 'Features', ar: 'المميزات' },
  'home.how': { en: 'How It Works', ar: 'كيف يعمل' },
  'feature.gps': { en: 'GPS Tracking', ar: 'تتبع GPS' },
  'feature.gps.desc': { en: 'Real-time location tracking with movement history', ar: 'تتبع الموقع الفوري مع سجل الحركة' },
  'feature.health': { en: 'Health Monitoring', ar: 'مراقبة الصحة' },
  'feature.health.desc': { en: 'Temperature and heart rate monitoring 24/7', ar: 'مراقبة الحرارة ونبض القلب على مدار الساعة' },
  'feature.alerts': { en: 'Smart Alerts', ar: 'تنبيهات ذكية' },
  'feature.alerts.desc': { en: 'Instant notifications for abnormal readings', ar: 'إشعارات فورية عند القراءات غير الطبيعية' },
  'feature.analytics': { en: 'Data Analytics', ar: 'تحليل البيانات' },
  'feature.analytics.desc': { en: 'Historical data analysis and trends', ar: 'تحليل البيانات التاريخية والاتجاهات' },
  'how.step1': { en: 'Attach IoT collar to animal', ar: 'تثبيت الطوق الذكي على الحيوان' },
  'how.step2': { en: 'Data streams to cloud in real-time', ar: 'البيانات تُرسل للسحابة فورياً' },
  'how.step3': { en: 'Monitor from anywhere on any device', ar: 'راقب من أي مكان وعلى أي جهاز' },
  'dash.total': { en: 'Total Animals', ar: 'إجمالي الحيوانات' },
  'dash.online': { en: 'Online', ar: 'متصل' },
  'dash.offline': { en: 'Offline', ar: 'غير متصل' },
  'dash.alerts': { en: 'Active Alerts', ar: 'تنبيهات نشطة' },
  'status.online': { en: 'Online', ar: 'متصل' },
  'status.offline': { en: 'Offline', ar: 'غير متصل' },
  'status.active': { en: 'Active', ar: 'نشط' },
  'status.idle': { en: 'Idle', ar: 'خامل' },
  'temp': { en: 'Temperature', ar: 'الحرارة' },
  'heart': { en: 'Heart Rate', ar: 'نبض القلب' },
  'motion': { en: 'Motion', ar: 'الحركة' },
  'animal.name': { en: 'Name', ar: 'الاسم' },
  'animal.id': { en: 'Animal ID', ar: 'رقم الحيوان' },
  'animal.collar': { en: 'Collar ID', ar: 'رقم الطوق' },
  'animal.add': { en: 'Add Animal', ar: 'إضافة حيوان' },
  'animal.edit': { en: 'Edit', ar: 'تعديل' },
  'animal.delete': { en: 'Delete', ar: 'حذف' },
  'animal.save': { en: 'Save', ar: 'حفظ' },
  'animal.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'alert.temp_high': { en: 'High Temperature', ar: 'حرارة مرتفعة' },
  'alert.temp_low': { en: 'Low Temperature', ar: 'حرارة منخفضة' },
  'alert.heart_high': { en: 'High Heart Rate', ar: 'نبض مرتفع' },
  'alert.heart_low': { en: 'Low Heart Rate', ar: 'نبض منخفض' },
  'alert.offline': { en: 'Device Offline', ar: 'الجهاز غير متصل' },
  'analytics.temp_over_time': { en: 'Temperature Over Time', ar: 'الحرارة عبر الزمن' },
  'analytics.heart_over_time': { en: 'Heart Rate Over Time', ar: 'نبض القلب عبر الزمن' },
  'analytics.activity': { en: 'Activity Levels', ar: 'مستويات النشاط' },
  'analytics.filter': { en: 'Filter by Animal', ar: 'تصفية حسب الحيوان' },
  'analytics.all': { en: 'All Animals', ar: 'كل الحيوانات' },
  'export': { en: 'Export CSV', ar: 'تصدير CSV' },
  'dark_mode': { en: 'Dark Mode', ar: 'الوضع الداكن' },
  'login': { en: 'Login', ar: 'تسجيل الدخول' },
  'signup': { en: 'Sign Up', ar: 'إنشاء حساب' },
  'email': { en: 'Email', ar: 'البريد الإلكتروني' },
  'password': { en: 'Password', ar: 'كلمة المرور' },
  'logout': { en: 'Logout', ar: 'تسجيل الخروج' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang, dir]);

  const t = (key: string) => translations[key]?.[lang] || key;
  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
