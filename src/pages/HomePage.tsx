import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MapPin, Heart, Thermometer, Bell, Cpu, Smartphone, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const HomePage = () => {
  const { t } = useLanguage();

  const features = [
    { icon: MapPin, title: t('feature.gps'), desc: t('feature.gps.desc') },
    { icon: Heart, title: t('feature.health'), desc: t('feature.health.desc') },
    { icon: Bell, title: t('feature.alerts'), desc: t('feature.alerts.desc') },
    { icon: Thermometer, title: t('feature.analytics'), desc: t('feature.analytics.desc') },
  ];

  const steps = [
    { icon: Cpu, text: t('how.step1') },
    { icon: Wifi, text: t('how.step2') },
    { icon: Smartphone, text: t('how.step3') },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-24 md:py-36">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-1/2 -right-1/4 h-[600px] w-[600px] rounded-full bg-accent" />
          <div className="absolute -bottom-1/3 -left-1/4 h-[400px] w-[400px] rounded-full bg-primary-foreground" />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-6 text-4xl font-extrabold text-primary-foreground md:text-6xl"
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }}>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-elevated transition-transform hover:scale-105"
            >
              {t('home.hero.cta')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">{t('home.features')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">{t('home.how')}</h2>
          <div className="mx-auto flex max-w-3xl flex-col gap-8 md:flex-row md:items-start md:gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.15 }}
                className="flex flex-1 flex-col items-center text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="mb-2 text-sm font-bold text-muted-foreground">{i + 1}</div>
                <p className="text-base font-medium text-foreground">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
