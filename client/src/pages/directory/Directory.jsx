import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Search, X, GraduationCap, UserCheck, Shield,
  BookOpen, Mail, MapPin, ChevronDown, Building,
} from 'lucide-react'
import useDirectoryStore from '../../store/directoryStore'
import useAuthStore from '../../store/authStore'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Avatar from '../../components/ui/Avatar'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const ROLE_TABS = [
  { key: 'all', labelKey: 'directory.all', icon: null },
  { key: 'student', labelKey: 'directory.students', icon: GraduationCap },
  { key: 'lecturer', labelKey: 'directory.lecturers', icon: BookOpen },
  { key: 'admin', labelKey: 'directory.admin', icon: Shield },
]

const ROLE_BADGE_VARIANT = {
  student: 'info',
  lecturer: 'success',
  admin: 'danger',
}

const ROLE_BADGE_LABEL_KEY = {
  student: 'directory.students',
  lecturer: 'directory.lecturers',
  admin: 'directory.admin',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

function UserCard({ user, onClick }) {
  const { t } = useTranslation()
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown'

  return (
    <motion.div variants={itemVariants}>
      <Card
        hover
        className="cursor-pointer p-5"
        onClick={() => onClick?.(user)}
      >
        <div className="flex items-center gap-4">
          <Avatar
            src={user.avatar}
            name={fullName}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-text dark:text-text-dark truncate">
              {fullName}
            </h3>
            <Badge
              variant={ROLE_BADGE_VARIANT[user.role] || 'default'}
              className="mt-1.5"
            >
              {t(ROLE_BADGE_LABEL_KEY[user.role] || 'common.noData')}
            </Badge>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted">
          {user.department && (
            <div className="flex items-center gap-1.5">
              <Building size={13} />
              <span className="truncate">{user.department}</span>
            </div>
          )}
          {user.level && (
            <div className="flex items-center gap-1.5">
              <GraduationCap size={13} />
              <span>{t('directory.level')}: {user.level}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function UserProfileModal({ user, isOpen, onClose }) {
  const { t } = useTranslation()

  if (!user) return null

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={fullName} size="md">
      <div className="flex flex-col items-center text-center mb-6">
        <Avatar src={user.avatar} name={fullName} size="xl" className="mb-4" />
        <h2 className="text-lg font-semibold text-text dark:text-text-dark">{fullName}</h2>
        <Badge variant={ROLE_BADGE_VARIANT[user.role] || 'default'} className="mt-1.5">
          {t(ROLE_BADGE_LABEL_KEY[user.role] || 'common.noData')}
        </Badge>
      </div>

      <div className="space-y-3">
        {user.department && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface dark:bg-primary-dark/50">
            <Building size={16} className="text-primary dark:text-accent shrink-0" />
            <div className="text-left">
              <p className="text-xs text-muted">{t('directory.department')}</p>
              <p className="text-sm font-medium text-text dark:text-text-dark">{user.department}</p>
            </div>
          </div>
        )}

        {user.level && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface dark:bg-primary-dark/50">
            <GraduationCap size={16} className="text-primary dark:text-accent shrink-0" />
            <div className="text-left">
              <p className="text-xs text-muted">{t('directory.level')}</p>
              <p className="text-sm font-medium text-text dark:text-text-dark">{user.level}</p>
            </div>
          </div>
        )}

        {user.matricule && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface dark:bg-primary-dark/50">
            <UserCheck size={16} className="text-primary dark:text-accent shrink-0" />
            <div className="text-left">
              <p className="text-xs text-muted">{t('auth.matricule')}</p>
              <p className="text-sm font-medium text-text dark:text-text-dark">{user.matricule}</p>
            </div>
          </div>
        )}

        {user.email && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface dark:bg-primary-dark/50">
            <Mail size={16} className="text-primary dark:text-accent shrink-0" />
            <div className="text-left">
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-text dark:text-text-dark">{user.email}</p>
            </div>
          </div>
        )}

        {user.role === 'lecturer' && user.courses && user.courses.length > 0 && (
          <div className="p-3 rounded-lg bg-surface dark:bg-primary-dark/50">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-primary dark:text-accent" />
              <p className="text-xs text-muted font-medium">Courses</p>
            </div>
            <div className="space-y-1.5">
              {user.courses.map((course, i) => (
                <div key={course.code || i} className="flex items-center gap-2 text-sm text-text dark:text-text-dark">
                  {course.code && (
                    <span className="text-xs font-mono text-muted px-1.5 py-0.5 rounded bg-border/50 dark:bg-border-dark/50">
                      {course.code}
                    </span>
                  )}
                  <span className="truncate">{course.title || course.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {user.role === 'student' && user.courses && user.courses.length > 0 && (
          <div className="p-3 rounded-lg bg-surface dark:bg-primary-dark/50">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-primary dark:text-accent" />
              <p className="text-xs text-muted font-medium">Enrolled Courses</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.courses.map((course, i) => (
                <span
                  key={course.code || i}
                  className="text-xs px-2 py-1 rounded-md bg-border/50 dark:bg-border-dark/50 text-text dark:text-text-dark"
                >
                  {course.code || course.title || course.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    </Modal>
  )
}

function DirectorySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center gap-4">
            <Skeleton variant="avatar" className="h-14 w-14" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-28" />
              <Skeleton variant="text" className="h-4 w-20" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Skeleton variant="text" className="h-3 w-32" />
            <Skeleton variant="text" className="h-3 w-24" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function Directory() {
  const { t } = useTranslation()
  const { users, loading, fetchDirectory, fetchUser, selectedUser } = useDirectoryStore()

  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const filters = {}
    if (roleFilter !== 'all') filters.role = roleFilter
    if (departmentFilter) filters.department = departmentFilter
    if (debouncedSearch) filters.search = debouncedSearch
    fetchDirectory(filters)
  }, [roleFilter, departmentFilter, debouncedSearch, fetchDirectory])

  const departments = useMemo(() => {
    const depts = new Set(users.map(u => u.department).filter(Boolean))
    return ['', ...Array.from(depts).sort()]
  }, [users])

  const handleUserClick = useCallback(async (user) => {
    try {
      const full = await fetchUser(user.id)
      setSelectedProfile(full || user)
    } catch {
      setSelectedProfile(user)
    }
    setShowProfile(true)
  }, [fetchUser])

  const filtered = useMemo(() => {
    let items = users
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      items = items.filter(u =>
        `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.matricule?.toLowerCase().includes(q)
      )
    }
    return items
  }, [users, debouncedSearch])

  return (
    <PageWrapper title={t('directory.campusDirectory')}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('directory.search')}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text dark:hover:text-text-dark transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="appearance-none w-full sm:w-48 pl-3 pr-9 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-primary-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="">{t('directory.department')}</option>
              {departments.filter(Boolean).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROLE_TABS.map((tab) => {
            const isActive = roleFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-primary-dark border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-border/30 dark:hover:bg-border-dark/30'
                }`}
              >
                {tab.icon && <tab.icon size={15} />}
                {t(tab.labelKey)}
              </button>
            )
          })}
        </div>

        {loading ? (
          <DirectorySkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('directory.noUsers')}
            description={
              debouncedSearch || roleFilter !== 'all' || departmentFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'No users are available yet.'
            }
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onClick={handleUserClick}
              />
            ))}
          </motion.div>
        )}

        <p className="text-xs text-muted text-center pb-2">
          Showing {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      <UserProfileModal
        user={selectedProfile}
        isOpen={showProfile}
        onClose={() => { setShowProfile(false); setSelectedProfile(null) }}
      />
    </PageWrapper>
  )
}
