import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Search, Calendar, MapPin, Users, Plus, X,
  BookOpen, Users2, Trophy, Megaphone, Puzzle,
  Clock, User, Loader2, Image as ImageIcon,
} from 'lucide-react'
import useActivitiesStore from '../../store/activitiesStore'
import useAuthStore from '../../store/authStore'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Avatar from '../../components/ui/Avatar'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const FILTERS = [
  { key: 'all', labelKey: 'activities.allActivities', icon: null },
  { key: 'academic', labelKey: 'activities.academic', icon: BookOpen },
  { key: 'social', labelKey: 'activities.social', icon: Users2 },
  { key: 'sports', labelKey: 'activities.sports', icon: Trophy },
  { key: 'announcement', labelKey: 'activities.announcement', icon: Megaphone },
  { key: 'club', labelKey: 'activities.club', icon: Puzzle },
]

const TYPE_BADGE_VARIANT = {
  academic: 'info',
  social: 'success',
  sports: 'success',
  announcement: 'danger',
  club: 'warning',
}

const TYPE_ICON = {
  academic: BookOpen,
  social: Users2,
  sports: Trophy,
  announcement: Megaphone,
  club: Puzzle,
}

const TYPE_COLOR = {
  academic: 'bg-primary/10 text-primary dark:text-primary-light',
  social: 'bg-success/10 text-success',
  sports: 'bg-success/10 text-success',
  announcement: 'bg-danger/10 text-danger',
  club: 'bg-warning/10 text-warning',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function AttendeeAvatars({ attendees = [], count }) {
  const display = attendees.slice(0, 3)
  const remainder = (count || attendees.length) - display.length

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {display.map((att, i) => (
          <div key={att.id || i} className="relative z-10 border-2 border-white dark:border-primary-dark rounded-full">
            <Avatar src={att.avatar} name={`${att.firstName || ''} ${att.lastName || ''}`.trim()} size="sm" />
          </div>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {count || attendees.length} {(count || attendees.length) <= 1 ? 'attendee' : 'attendees'}
        {remainder > 0 && ` +${remainder}`}
      </span>
    </div>
  )
}

function ActivityCard({ activity, onJoin, onLeave, onClick, joining }) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isJoining = joining === activity.id
  const rsvpStatus = activity.rsvpStatus

  const dateStr = activity.startDate
    ? new Date(activity.startDate).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : ''

  const timeStr = activity.startDate
    ? new Date(activity.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <motion.div variants={itemVariants}>
      <Card
        hover
        className="cursor-pointer overflow-hidden p-0"
        onClick={() => onClick?.(activity)}
      >
        {activity.image && (
          <div className="h-40 sm:h-48 overflow-hidden">
            <img
              src={activity.image}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <Badge variant={TYPE_BADGE_VARIANT[activity.type] || 'default'}>
              <div className="flex items-center gap-1.5">
                {(() => { const Icon = TYPE_ICON[activity.type]; return Icon ? <Icon size={12} /> : null; })()}
                {t(FILTERS.find(f => f.key === activity.type)?.labelKey || activity.type)}
              </div>
            </Badge>
            <span className="text-xs text-gray-500 shrink-0">
              {dateStr}
            </span>
          </div>

          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-1">
            {activity.title}
          </h3>

          {activity.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {activity.description.replace(/<[^>]*>/g, '').slice(0, 150)}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4">
            {timeStr && (
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {timeStr}
              </span>
            )}
            {activity.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {activity.location}
              </span>
            )}
            {activity.organizer && (
              <span className="flex items-center gap-1">
                <User size={13} />
                {activity.organizer}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <AttendeeAvatars attendees={activity.attendees} count={activity.attendeeCount} />

            {user && (
              <Button
                size="sm"
                variant={rsvpStatus === 'joined' ? 'outline' : 'primary'}
                onClick={(e) => {
                  e.stopPropagation()
                  if (rsvpStatus === 'joined') onLeave?.(activity.id)
                  else onJoin?.(activity.id)
                }}
                loading={isJoining}
              >
                {rsvpStatus === 'joined' ? t('activities.leave') : t('activities.join')}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function ActivityDetailModal({ activity, isOpen, onClose, onJoin, onLeave, joining }) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isJoining = joining === activity?.id

  if (!activity) return null

  const dateStr = activity.startDate
    ? new Date(activity.startDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  const timeStr = activity.startDate
    ? new Date(activity.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  const endDateStr = activity.endDate
    ? new Date(activity.endDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activity.title} size="lg">
      <div className="space-y-5">
        {activity.image && (
          <div className="h-48 -mx-6 -mt-4 overflow-hidden">
            <img
              src={activity.image}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Badge variant={TYPE_BADGE_VARIANT[activity.type] || 'default'}>
          <div className="flex items-center gap-1.5">
            {(() => { const Icon = TYPE_ICON[activity.type]; return Icon ? <Icon size={13} /> : null; })()}
            {t(FILTERS.find(f => f.key === activity.type)?.labelKey || activity.type)}
          </div>
        </Badge>

        <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
          {activity.description || 'No description provided.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-start gap-3">
            <Calendar size={16} className="text-primary dark:text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">{t('activities.startDate')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {dateStr}{timeStr ? ` at ${timeStr}` : ''}
              </p>
            </div>
          </div>

          {endDateStr && (
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-primary dark:text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">{t('activities.endDate')}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{endDateStr}</p>
              </div>
            </div>
          )}

          {activity.location && (
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-primary dark:text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">{t('activities.location')}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.location}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <User size={16} className="text-primary dark:text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">{t('activities.organizer')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {activity.organizer || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('activities.attendees')} ({activity.attendeeCount || activity.attendees?.length || 0})
            </h4>
            {user && (
              <Button
                size="sm"
                variant={activity.rsvpStatus === 'joined' ? 'outline' : 'primary'}
                onClick={() => {
                  if (activity.rsvpStatus === 'joined') onLeave?.(activity.id)
                  else onJoin?.(activity.id)
                }}
                loading={isJoining}
              >
                {activity.rsvpStatus === 'joined' ? t('activities.leave') : t('activities.join')}
              </Button>
            )}
          </div>

          {activity.attendees && activity.attendees.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activity.attendees.map((att, i) => (
                <div key={att.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/20 transition-colors">
                  <Avatar
                    src={att.avatar}
                    name={`${att.firstName || ''} ${att.lastName || ''}`.trim()}
                    size="sm"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {`${att.firstName || ''} ${att.lastName || ''}`.trim() || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No attendees yet.</p>
          )}
        </div>
      </div>
    </Modal>
  )
}

function CreateActivityForm({ isOpen, onClose, onSubmit }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    title: '', description: '', type: '', organizer: '',
    location: '', startDate: '', endDate: '', department: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const typeOptions = FILTERS.filter(f => f.key !== 'all').map(f => ({
    value: f.key,
    label: t(f.labelKey),
  }))

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const reset = () => {
    setForm({ title: '', description: '', type: '', organizer: '', location: '', startDate: '', endDate: '', department: '' })
    setImageFile(null)
    setImagePreview(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.type || !form.startDate) {
      setError('Title, type, and start date are required')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      let activityData
      if (imageFile) {
        const formData = new FormData()
        Object.entries(form).forEach(([key, val]) => {
          if (val) formData.append(key, val)
        })
        formData.append('image', imageFile)
        const { api } = await import('../../services/api')
        const res = await api.upload('/activities', formData)
        activityData = res.data || res
      } else {
        const { createActivity } = useActivitiesStore.getState()
        activityData = await createActivity({
          ...form,
          ...(Object.fromEntries(Object.entries(form).filter(([_, v]) => v))),
        })
      }
      onSubmit?.(activityData)
      reset()
    } catch (err) {
      setError(err.message || 'Failed to create activity')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('activities.addActivity')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-danger/10 text-danger text-sm">{error}</div>
        )}

        <Input
          label={t('activities.title')}
          value={form.title}
          onChange={handleChange('title')}
          placeholder="Activity title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {t('activities.description')}
          </label>
          <textarea
            value={form.description}
            onChange={handleChange('description')}
            rows={3}
            className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 px-3 py-2 text-sm resize-none"
            placeholder="Describe the activity..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={t('activities.type')}
            options={typeOptions}
            placeholder="Select type"
            value={form.type}
            onChange={handleChange('type')}
            required
          />
          <Input
            label={t('activities.organizer')}
            value={form.organizer}
            onChange={handleChange('organizer')}
            placeholder="Organizer name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('activities.location')}
            value={form.location}
            onChange={handleChange('location')}
            placeholder="Location"
          />
          <Input
            label={t('activities.department')}
            value={form.department}
            onChange={handleChange('department')}
            placeholder="Department"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('activities.startDate')}
            type="datetime-local"
            value={form.startDate}
            onChange={handleChange('startDate')}
            required
          />
          <Input
            label={t('activities.endDate')}
            type="datetime-local"
            value={form.endDate}
            onChange={handleChange('endDate')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Image
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-100/30 dark:hover:bg-gray-800/20 transition-colors text-sm text-gray-900 dark:text-gray-100">
              <ImageIcon size={16} />
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="text-xs text-danger hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          {imagePreview && (
            <div className="mt-2 w-32 h-20 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={handleClose} type="button">
            {t('activities.cancel')}
          </Button>
          <Button type="submit" loading={submitting}>
            {t('activities.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton variant="text" className="h-6 w-24" />
            <Skeleton variant="text" className="h-6 w-20 ml-auto" />
          </div>
          <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
          <Skeleton variant="text" className="h-4 w-full mb-1" />
          <Skeleton variant="text" className="h-4 w-2/3 mb-4" />
          <div className="flex gap-4 mb-4">
            <Skeleton variant="text" className="h-4 w-28" />
            <Skeleton variant="text" className="h-4 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton variant="avatar" className="h-8 w-24" />
            <Skeleton variant="text" className="h-8 w-20" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function Activities() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const {
    activities, myActivities, loading,
    fetchActivities, fetchMyActivities,
    joinActivity, leaveActivity,
  } = useActivitiesStore()

  const [activeTab, setActiveTab] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [joining, setJoining] = useState(null)

  const canCreate = user && (user.role === 'admin' || user.role === 'lecturer')

  useEffect(() => {
    if (activeTab === 'all') {
      const filters = {}
      if (activeFilter !== 'all') filters.type = activeFilter
      if (searchQuery) filters.search = searchQuery
      fetchActivities(filters)
    } else {
      fetchMyActivities()
    }
  }, [activeTab, activeFilter, searchQuery, fetchActivities, fetchMyActivities])

  const displayActivities = activeTab === 'all' ? activities : myActivities

  const filtered = useMemo(() => {
    let items = displayActivities
    if (activeTab === 'all' && activeFilter !== 'all') {
      items = items.filter(a => a.type === activeFilter)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.organizer?.toLowerCase().includes(q)
      )
    }
    return items
  }, [displayActivities, activeTab, activeFilter, searchQuery])

  const handleJoin = useCallback(async (id) => {
    setJoining(id)
    try {
      await joinActivity(id)
      if (activeTab === 'all') {
        fetchActivities({ type: activeFilter !== 'all' ? activeFilter : undefined, search: searchQuery || undefined })
      } else {
        fetchMyActivities()
      }
    } catch {} finally {
      setJoining(null)
    }
  }, [joinActivity, activeTab, activeFilter, searchQuery, fetchActivities, fetchMyActivities])

  const handleLeave = useCallback(async (id) => {
    setJoining(id)
    try {
      await leaveActivity(id)
      if (activeTab === 'all') {
        fetchActivities({ type: activeFilter !== 'all' ? activeFilter : undefined, search: searchQuery || undefined })
      } else {
        fetchMyActivities()
      }
    } catch {} finally {
      setJoining(null)
    }
  }, [leaveActivity, activeTab, activeFilter, searchQuery, fetchActivities, fetchMyActivities])

  const handleCardClick = useCallback((activity) => {
    setSelectedActivity(activity)
    setShowDetail(true)
  }, [])

  const handleActivityCreated = useCallback((data) => {
    setShowCreateForm(false)
    fetchActivities()
  }, [fetchActivities])

  return (
    <PageWrapper
      title={t('activities.campusActivities')}
      actions={canCreate && (
        <Button
          icon={Plus}
          onClick={() => setShowCreateForm(true)}
          className="shadow-sm"
        >
          {t('activities.addActivity')}
        </Button>
      )}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100/30 dark:hover:bg-gray-800/30'
              }`}
            >
              {t('activities.allActivities')}
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'my'
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100/30 dark:hover:bg-gray-800/30'
              }`}
            >
              {t('activities.myActivities')}
            </button>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${t('common.search')}...`}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {activeTab === 'all' && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.key
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100/30 dark:hover:bg-gray-800/30'
                  }`}
                >
                  {filter.icon && <filter.icon size={15} />}
                  {t(filter.labelKey)}
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <ActivitySkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={activeTab === 'my' ? Users : Calendar}
            title={activeTab === 'my' ? 'No joined activities' : t('activities.noActivities')}
            description={
              activeTab === 'my'
                ? 'You haven\'t joined any activities yet. Browse all activities to find something interesting.'
                : 'No activities match your filters. Try adjusting your search or filter criteria.'
            }
            action={activeTab === 'my' ? {
              onClick: () => { setActiveTab('all') },
              children: t('activities.allActivities'),
            } : undefined}
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filtered.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onClick={handleCardClick}
                joining={joining}
              />
            ))}
          </motion.div>
        )}
      </div>

      {canCreate && (
        <CreateActivityForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleActivityCreated}
        />
      )}

      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedActivity(null) }}
        onJoin={handleJoin}
        onLeave={handleLeave}
        joining={joining}
      />
    </PageWrapper>
  )
}
