import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Calendar, BookOpen, BarChart3, Activity,
  Users, Bot, Settings, ShieldCheck, LogOut, ChevronLeft, X
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

export default function Sidebar({ isOpen, onToggle, mobileOpen, onMobileClose }) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  const content = (
    <>
      <div className="flex items-center justify-between h-16 lg:h-20 px-4 shrink-0">
        <AnimatePresence mode="wait">
          {isOpen || mobileOpen ? (
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
        <div className="flex items-center gap-1">
          <button
            onClick={onMobileClose || onToggle}
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
          <button
            onClick={onToggle}
            className="hidden lg:block p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <ChevronLeft size={18} className={`transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
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
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence mode="wait">
                {(isOpen || mobileOpen) && (
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

        <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

        <motion.div custom={navItems.length} variants={itemVariants} initial="hidden" animate="visible">
          <NavLink
            to="/settings"
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <Settings size={20} className="shrink-0" />
            <AnimatePresence mode="wait">
              {(isOpen || mobileOpen) && (
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
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <ShieldCheck size={20} className="shrink-0" />
              <AnimatePresence mode="wait">
                {(isOpen || mobileOpen) && (
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

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <motion.div custom={navItems.length + 2} variants={itemVariants} initial="hidden" animate="visible">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium w-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut size={20} className="shrink-0" />
            <AnimatePresence mode="wait">
              {(isOpen || mobileOpen) && (
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
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={mobileOpen ? { x: 0 } : { x: '-100%' }}
        className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden lg:hidden"
      >
        {content}
      </motion.aside>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isOpen ? 256 : 72 }}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-col z-30 overflow-hidden"
      >
        {content}
      </motion.aside>
    </>
  );
}
