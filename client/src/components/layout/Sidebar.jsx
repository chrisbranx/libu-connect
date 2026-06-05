import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Calendar, BookOpen, BarChart3, Activity,
  Users, Bot, Settings, ShieldCheck, LogOut, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/scheduler', icon: Calendar, labelKey: 'nav.scheduler' },
  { to: '/notes', icon: BookOpen, labelKey: 'nav.notes' },
  { to: '/academic', icon: BarChart3, labelKey: 'nav.academic' },
  { to: '/activities', icon: Activity, labelKey: 'nav.activities' },
  { to: '/directory', icon: Users, labelKey: 'nav.directory' },
  { to: '/ai-advisor', icon: Bot, labelKey: 'nav.ai' },
];

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 },
  }),
};

export default function Sidebar({ isOpen, onToggle }) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  return (
    <motion.aside
      animate={{ width: isOpen ? 256 : 72 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-primary-dark border-r border-border dark:border-border-dark flex flex-col z-30 overflow-hidden"
    >
      <div className="flex items-center justify-between h-20 px-4 shrink-0">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="logo-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <span className="text-2xl font-display font-bold text-primary dark:text-white">LIBU</span>
              <span className="w-2 h-2 rounded-full bg-accent" />
            </motion.div>
          ) : (
            <motion.div
              key="logo-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <span className="text-xl font-display font-bold text-primary dark:text-white">L</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-border dark:hover:bg-border-dark text-text-muted dark:text-text-dark transition-colors"
        >
          <ChevronLeft size={18} className={`transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-muted dark:text-text-dark hover:bg-border dark:hover:bg-border-dark'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {t(item.labelKey)}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </motion.div>
        ))}

        <div className="border-t border-border dark:border-border-dark my-3" />

        <motion.div custom={navItems.length} variants={itemVariants} initial="hidden" animate="visible">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-muted dark:text-text-dark hover:bg-border dark:hover:bg-border-dark'
              }`
            }
          >
            <Settings size={20} className="shrink-0" />
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  {t('nav.settings')}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        </motion.div>

        {user?.role === 'ADMIN' && (
          <motion.div custom={navItems.length + 1} variants={itemVariants} initial="hidden" animate="visible">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-muted dark:text-text-dark hover:bg-border dark:hover:bg-border-dark'
                }`
              }
            >
              <ShieldCheck size={20} className="shrink-0" />
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {t('nav.admin')}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          </motion.div>
        )}
      </nav>

      <div className="p-3 border-t border-border dark:border-border-dark">
        <motion.div custom={navItems.length + 2} variants={itemVariants} initial="hidden" animate="visible">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium w-full text-text-muted dark:text-text-dark hover:bg-border dark:hover:bg-border-dark"
          >
            <LogOut size={20} className="shrink-0" />
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  {t('nav.logout')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>
    </motion.aside>
  );
}
