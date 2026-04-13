import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MapPin, Heart, Thermometer, Bell, Cpu, Smartphone, Wifi, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Welcome Video Hero */}
      <section className="relative overflow-hidden bg-primary">
        <div className="relative h-[70vh] md:h-[80vh] w-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/welcome.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mb-4 text-4xl font-extrabold text-white md:text-6xl drop-shadow-lg"
            >
              {t('home.hero.title')}
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mb-8 max-w-2xl text-lg text-white/90 drop-shadow"
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
          <button
            onClick={toggleVideo}
            className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
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
