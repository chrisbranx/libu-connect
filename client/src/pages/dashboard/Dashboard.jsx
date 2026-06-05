import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  GraduationCap,
  CalendarDays,
  FileText,
  Zap,
  PlusCircle,
  BookOpen,
  TrendingUp,
  Bot,
  MapPin,
  Clock,
  ArrowRight,
  Sun,
  Megaphone,
  Shield,
  UserCheck,
  ClipboardList,
  Wallet,
  ShieldAlert,
  Lock,
  DoorOpen,
  Crown,
  Trophy,
  Sparkles,
  Star,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../../store/authStore'
import useScheduleStore from '../../store/scheduleStore'
import useAcademicStore from '../../store/academicStore'
import useNotesStore from '../../store/notesStore'
import useActivitiesStore from '../../store/activitiesStore'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function ScheduleWidget() {
  const { t } = useTranslation()
  const { schedules, loading, fetchSchedules } = useScheduleStore()

  useEffect(() => {
    fetchSchedules({ date: new Date().toISOString().split('T')[0] })
  }, [fetchSchedules])

  const items = schedules.slice(0, 5)

  const typeBadge = (type) => {
    const map = { class: 'info', exam: 'danger', assignment: 'warning', personal: 'default' }
    return (
      <Badge variant={map[type] || 'default'}>
        {t(`scheduler.${type}`) || type}
      </Badge>
    )
  }

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarCheck size={18} className="text-primary dark:text-accent" />
          <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.todaySchedule')}
          </h3>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {}}
            className="text-xs text-primary hover:text-primary-light dark:text-accent dark:hover:text-accent-light font-medium transition-colors"
          >
            {t('dashboard.viewAll')}
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="text" className="h-12" count={3} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No events today"
          description={t('dashboard.noEvents')}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100/30 dark:hover:bg-gray-800/20 transition-colors"
            >
              <div className="shrink-0 w-14 text-right">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {item.startTime
                    ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {typeBadge(item.type)}
                  {item.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      {item.location}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}

function GpaWidget() {
  const { t } = useTranslation()
  const { summary, loading, fetchSummary } = useAcademicStore()

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const gpa = summary?.currentGpa ?? null
  const credits = summary?.totalCredits ?? null

  const gpaColor =
    gpa === null
      ? 'text-gray-500'
      : gpa >= 3.5
        ? 'text-success'
        : gpa >= 2.5
          ? 'text-accent'
          : 'text-danger'

  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap size={18} className="text-primary dark:text-accent" />
        <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.currentGpa')}
        </h3>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton variant="text" className="h-10 w-24" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
      ) : gpa !== null ? (
        <>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-display font-bold ${gpaColor} transition-colors`}>
              {gpa.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">/ 4.0</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t('academic.totalCredits')}: {credits ?? 0}
          </p>
        </>
      ) : (
        <EmptyState icon={TrendingUp} title="No data" description={t('common.noData')} />
      )}
    </Card>
  )
}

function UpcomingEventsWidget() {
  const { t } = useTranslation()
  const { upcoming, loading, fetchUpcoming } = useScheduleStore()

  useEffect(() => {
    fetchUpcoming()
  }, [fetchUpcoming])

  const grouped = upcoming.reduce((acc, item) => {
    const date = new Date(item.startTime || item.date).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  const entries = Object.entries(grouped).slice(0, 3)

  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={18} className="text-primary dark:text-accent" />
        <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.upcomingEvents')}
        </h3>
      </div>
      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="text" className="h-16" count={3} />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming events" description={t('dashboard.noEvents')} />
      ) : (
        <div className="space-y-4">
          {entries.map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <div className="space-y-2">
                {items.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent">
                      <CalendarDays size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                        <Clock size={12} />
                        {item.startTime
                          ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'All day'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function RecentNotesWidget() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notes, loading, fetchNotes } = useNotesStore()

  useEffect(() => {
    fetchNotes({ limit: 4 })
  }, [fetchNotes])

  const displayNotes = notes.slice(0, 4)

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary dark:text-accent" />
          <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.recentNotes')}
          </h3>
        </div>
        {displayNotes.length > 0 && (
          <button
            onClick={() => navigate('/notes')}
            className="text-xs text-primary hover:text-primary-light dark:text-accent dark:hover:text-accent-light font-medium transition-colors"
          >
            {t('dashboard.viewAll')}
          </button>
        )}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton variant="card" className="h-28" count={2} />
        </div>
      ) : displayNotes.length === 0 ? (
        <EmptyState icon={FileText} title="No notes yet" description={t('notes.noNotes')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayNotes.map((note, idx) => (
            <motion.button
              key={note.id || idx}
              whileHover={{ y: -2 }}
              onClick={() => navigate(`/notes/${note.id}`)}
              className="text-left p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-accent/30 transition-all"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {note.title || 'Untitled'}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                {note.content
                  ? note.content.replace(/<[^>]*>/g, '').slice(0, 100)
                  : 'No content'}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1 flex-wrap">
                  {note.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-500">
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString()
                    : ''}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </Card>
  )
}

function QuickActionsWidget() {
  const navigate = useNavigate()

  const actions = [
    { icon: PlusCircle, label: 'Add Schedule Item', path: '/scheduler', color: 'text-primary dark:text-accent', bg: 'bg-primary/10 dark:bg-accent/10' },
    { icon: BookOpen, label: 'Take Notes', path: '/notes', color: 'text-success', bg: 'bg-success/10' },
    { icon: TrendingUp, label: 'Check Grades', path: '/academic', color: 'text-warning', bg: 'bg-warning/10' },
    { icon: Bot, label: 'Ask AI', path: '/ai-advisor', color: 'text-danger', bg: 'bg-danger/10' },
  ]

  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-primary dark:text-accent" />
        <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">
          Quick Actions
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <motion.button
            key={action.path}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-accent/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg}`}>
              <action.icon size={20} className={action.color} />
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 text-center leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </Card>
  )
}

function UpcomingActivitiesWidget() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activities, loading, fetchActivities } = useActivitiesStore()

  useEffect(() => {
    fetchActivities({ limit: 5 })
  }, [fetchActivities])

  const items = activities.slice(0, 5)

  const typeIcon = (type) => {
    const map = {
      academic: 'bg-primary/10 text-primary dark:text-accent',
      social: 'bg-success/10 text-success',
      sports: 'bg-warning/10 text-warning',
      club: 'bg-danger/10 text-danger',
      announcement: 'bg-primary/10 text-primary dark:text-accent',
    }
    return map[type] || map.academic
  }

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-primary dark:text-accent" />
          <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">
            Upcoming Activities
          </h3>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => navigate('/activities')}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-light dark:text-accent dark:hover:text-accent-light font-medium transition-colors"
          >
            {t('dashboard.viewAll')}
            <ArrowRight size={14} />
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="text" className="h-14" count={3} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No activities" description={t('activities.noActivities')} />
      ) : (
        <div className="space-y-2">
          {items.map((activity, idx) => (
            <motion.div
              key={activity.id || idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100/30 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
              onClick={() => navigate(`/activities`)}
            >
              <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${typeIcon(activity.type)}`}>
                <CalendarDays size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    {activity.startDate
                      ? new Date(activity.startDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </span>
                  {activity.location && (
                    <>
                      <span className="text-gray-500 text-xs">•</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={11} />
                        {activity.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant={activity.type === 'academic' ? 'info' : 'default'}>
                {t(`activities.${activity.type}`) || activity.type}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}

function AnnouncementsBar() {
  const announcements = [
    { title: 'Registration Deadline Extended', date: 'Jun 10, 2026', type: 'info' },
    { title: 'Sports Week: Register Now!', date: 'Jun 15-20, 2026', type: 'event' },
    { title: 'Library Hours Updated', date: 'Jun 5, 2026', type: 'info' },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 px-4">
        <div className="shrink-0 flex items-center gap-2 text-primary dark:text-accent">
          <Megaphone size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Announcements</span>
        </div>
        <div className="flex gap-4 flex-1 min-w-0">
          {announcements.map((a, idx) => (
            <div
              key={idx}
              className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${a.type === 'event' ? 'bg-warning' : 'bg-primary'}`} />
              <span className="font-medium">{a.title}</span>
              <span className="text-xs text-gray-500">{a.date}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function SchoolAdminWidget() {
  const adminStaff = [
    { name: 'Prof. Nkeng George', role: 'CEO / Chancellor', icon: 'Shield' },
    { name: 'Dr. Ambassa Antoine', role: 'Vice Chancellor', icon: 'UserCheck' },
    { name: 'Dr. Ngoe Martin', role: 'Director of Studies', icon: 'BookOpen' },
    { name: 'Mme. Eyanga Cécile', role: 'Registrar', icon: 'ClipboardList' },
    { name: 'M. Mbarga Jean', role: 'Bursar / Finance Director', icon: 'Wallet' },
    { name: 'M. Bello Ahmadou', role: 'Head of Discipline', icon: 'ShieldAlert' },
    { name: 'M. Tchinda Paul', role: 'Head of Security', icon: 'Lock' },
    { name: 'M. Njike Samuel', role: 'Gate Man / Security', icon: 'DoorOpen' },
  ]

  const iconMap = { Shield, UserCheck, BookOpen, ClipboardList, Wallet, ShieldAlert, Lock, DoorOpen }

  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={18} className="text-primary dark:text-accent" />
        <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">School Administration</h3>
      </div>
      <div className="space-y-1">
        {adminStaff.map((member, idx) => {
          const Icon = iconMap[member.icon]
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100/30 dark:hover:bg-gray-800/20 transition-colors"
            >
              <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent">
                {Icon && <Icon size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
                <p className="text-xs text-gray-500 truncate">{member.role}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function SugMembersWidget() {
  const sugMembers = [
    { name: 'Achille Ndebi', role: 'President', icon: 'Crown' },
    { name: 'Chris Brandon', role: 'Communication Delegate', icon: 'Megaphone' },
    { name: 'Marie Claire', role: 'Vice President', icon: 'UserCheck' },
    { name: 'Jean Paul', role: 'Secretary General', icon: 'FileText' },
    { name: 'Esther Ngo', role: 'Treasurer', icon: 'Wallet' },
    { name: 'Pierre Kamga', role: 'Sports & Culture', icon: 'Trophy' },
    { name: 'Alice Ngon', role: 'Miss Campus', icon: 'Sparkles' },
    { name: 'Marc Tchinda', role: 'Mister Campus', icon: 'Star' },
  ]

  const iconMap = { Crown, Megaphone, UserCheck, FileText, Wallet, Trophy, Sparkles, Star }

  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={18} className="text-primary dark:text-accent" />
        <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">SUG Members</h3>
      </div>
      <div className="space-y-1">
        {sugMembers.map((member, idx) => {
          const Icon = iconMap[member.icon]
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100/30 dark:hover:bg-gray-800/20 transition-colors"
            >
              <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-warning/10 text-warning">
                {Icon && <Icon size={15} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
                <p className="text-xs text-gray-500 truncate">{member.role}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-xl lg:text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
          {t('dashboard.welcome')}, {user?.firstName || 'User'} <Sun className="inline-block" />
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <AnnouncementsBar />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="md:col-span-1">
            <ScheduleWidget />
          </motion.div>
          <motion.div variants={itemVariants} className="md:col-span-1">
            <GpaWidget />
          </motion.div>
          <motion.div variants={itemVariants} className="md:col-span-1">
            <UpcomingEventsWidget />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <RecentNotesWidget />
          </motion.div>
          <motion.div variants={itemVariants}>
            <QuickActionsWidget />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <SchoolAdminWidget />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SugMembersWidget />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <motion.div variants={itemVariants}>
            <UpcomingActivitiesWidget />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
