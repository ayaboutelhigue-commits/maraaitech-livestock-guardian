import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Home, LayoutDashboard, Map, BarChart3, PawPrint, Bell, Sun, Moon, Languages, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { key: 'nav.home', path: '/', icon: Home },
  { key: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.map', path: '/map', icon: Map },
  { key: 'nav.analytics', path: '/analytics', icon: BarChart3 },
  { key: 'nav.animals', path: '/animals', icon: PawPrint },
  { key: 'nav.alerts', path: '/alerts', icon: Bell },
];

const Navbar = () => {
  const { t, toggleLang, lang } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('maraai_user');

  const handleLogout = () => {
    localStorage.removeItem('maraai_user');
    navigate('/login');
  };

  if (location.pathname === '/login') return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <PawPrint className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">{t('app.name')}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {t(item.key)}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Toggle Language">
            <Languages className="h-4 w-4" />
          </button>
          <button onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Toggle Theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {isLoggedIn && (
            <button onClick={handleLogout} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}>
              <LogOut className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-muted-foreground md:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border bg-card px-4 py-3 md:hidden"
        >
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
