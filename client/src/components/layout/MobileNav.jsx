import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Calendar, BookOpen, BarChart3, Bot } from 'lucide-react';

const items = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/scheduler', icon: Calendar, labelKey: 'nav.scheduler' },
  { to: '/notes', icon: BookOpen, labelKey: 'nav.notes' },
  { to: '/academic', icon: BarChart3, labelKey: 'nav.academic' },
  { to: '/ai-advisor', icon: Bot, labelKey: 'nav.ai' },
];

export default function MobileNav() {
  const { t } = useTranslation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around pb-safe">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-colors text-[11px] font-medium ${
              isActive
                ? 'text-accent'
                : 'text-gray-500 dark:text-gray-100'
            }`
          }
        >
          <item.icon size={20} />
          <span>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
