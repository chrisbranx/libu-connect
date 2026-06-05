import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, Calendar, Radio,
  Search, ChevronLeft, ChevronRight, Check, X,
  Shield, Send, Megaphone, Plus,
  Activity,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { api } from '../../services/api'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import Avatar from '../../components/ui/Avatar'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const TABS = [
  { key: 'dashboard', icon: LayoutDashboard, labelKey: 'admin.dashboard' },
  { key: 'users', icon: Users, labelKey: 'admin.users' },
  { key: 'activities', icon: Calendar, labelKey: 'admin.activities' },
  { key: 'broadcast', icon: Radio, labelKey: 'admin.broadcast' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'ADMIN', label: 'Admin' },
]

const ROLE_BADGE_VARIANT = {
  STUDENT: 'info',
  LECTURER: 'success',
  ADMIN: 'danger',
}

const USERS_PER_PAGE = 10

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div variants={itemVariants} className="flex-1 min-w-[200px]">
      <Card>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${color} shrink-0`}>
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-display font-bold text-text dark:text-text-dark mt-0.5">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function StatsSkeleton() {
  return (
    <div className="flex flex-wrap gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-1 min-w-[200px]">
          <Card>
            <div className="flex items-center gap-4">
              <Skeleton variant="avatar" className="h-14 w-14" />
              <div className="space-y-2">
                <Skeleton variant="text" className="h-3 w-20" />
                <Skeleton variant="text" className="h-6 w-12" />
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}

function DashboardTab() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats')
        setStats(res.data || res)
      } catch {
        setStats({ totalUsers: 0, activeSessions: 0, recentActivities: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <StatsSkeleton />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <StatCard
          icon={Users}
          label={t('admin.totalUsers')}
          value={stats?.totalUsers ?? 0}
          color="bg-primary"
        />
        <StatCard
          icon={Activity}
          label={t('admin.activeSessions')}
          value={stats?.activeSessions ?? 0}
          color="bg-success"
        />
        <StatCard
          icon={Calendar}
          label={t('admin.recentActivity')}
          value={stats?.recentActivities ?? 0}
          color="bg-warning"
        />
      </div>
    </motion.div>
  )
}

function UsersTab() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const res = await api.get('/admin/users')
        setUsers(res.data || res)
      } catch {
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filtered = useMemo(() => {
    if (!searchQuery) return users
    const q = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        (u.firstName || '').toLowerCase().includes(q) ||
        (u.lastName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q)
    )
  }, [users, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      setToast({ message: `Role changed to ${newRole}`, type: 'success' })
    } catch {
      setToast({ message: 'Failed to change role', type: 'error' })
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active'
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus })
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)))
      setToast({
        message: newStatus === 'active' ? 'Account activated' : 'Account deactivated',
        type: 'success',
      })
    } catch {
      setToast({ message: 'Failed to update account status', type: 'error' })
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-md shadow-lg text-sm font-medium bg-success text-white"
          >
            <Check size={16} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`${t('common.search')} users...`}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton variant="text" className="h-12" count={5} />
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={searchQuery ? 'Try a different search term' : 'No users are registered yet'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark bg-surface dark:bg-primary-dark/50">
                  <th className="text-left px-4 py-3 font-semibold text-text dark:text-text-dark">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-text dark:text-text-dark">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-text dark:text-text-dark">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-text dark:text-text-dark">Department</th>
                  <th className="text-left px-4 py-3 font-semibold text-text dark:text-text-dark">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-text dark:text-text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => {
                  const isExpanded = expandedUserId === u.id
                  return (
                    <tr key={u.id}>
                      <td className="px-4 py-3 border-b border-border dark:border-border-dark">
                        <button
                          onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <Avatar
                            src={u.avatar}
                            name={`${u.firstName || ''} ${u.lastName || ''}`}
                            size="sm"
                          />
                          <span className="font-medium text-text dark:text-text-dark">
                            {u.firstName || ''} {u.lastName || ''}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 border-b border-border dark:border-border-dark text-muted text-xs">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 border-b border-border dark:border-border-dark">
                        <Badge variant={ROLE_BADGE_VARIANT[u.role] || 'default'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 border-b border-border dark:border-border-dark text-muted text-xs">
                        {u.department || '-'}
                      </td>
                      <td className="px-4 py-3 border-b border-border dark:border-border-dark">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            u.status === 'active'
                              ? 'text-success'
                              : 'text-danger'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-success' : 'bg-danger'
                            }`}
                          />
                          {u.status === 'active' ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-border dark:border-border-dark text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="px-2 py-1 text-xs rounded border border-border dark:border-border-dark bg-white dark:bg-primary-dark text-text dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-primary/30"
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            variant={u.status === 'active' ? 'outline' : 'ghost'}
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className="text-xs"
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            Page {page} of {totalPages} ({filtered.length} users)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md border border-border dark:border-border-dark text-muted hover:text-text dark:hover:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-border dark:border-border-dark text-muted hover:text-text dark:hover:text-text-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function ActivitiesTab() {
  const { t } = useTranslation()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const res = await api.get('/activities?all=true')
        setActivities(res.data || res)
      } catch {
        setActivities([])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleApprove = async (id) => {
    try {
      await api.put(`/activities/${id}/approve`)
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)))
      setToast({ message: 'Activity approved and published', type: 'success' })
    } catch {
      setToast({ message: 'Failed to approve activity', type: 'error' })
    }
  }

  const handleReject = async (id) => {
    try {
      await api.delete(`/activities/${id}`)
      setActivities((prev) => prev.filter((a) => a.id !== id))
      setToast({ message: 'Activity rejected and removed', type: 'success' })
    } catch {
      setToast({ message: 'Failed to reject activity', type: 'error' })
    }
  }

  const handleAnnouncementCreated = async () => {
    setShowCreateModal(false)
    try {
      const res = await api.get('/activities?all=true')
      setActivities(res.data || res)
    } catch {}
  }

  const typeBadgeVariant = {
    academic: 'info',
    social: 'success',
    sports: 'success',
    announcement: 'danger',
    club: 'warning',
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-md shadow-lg text-sm font-medium bg-success text-white"
          >
            <Check size={16} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
          Create Announcement
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="text" className="h-20" count={4} />
        </div>
      ) : activities.length === 0 ? (
        <EmptyState icon={Calendar} title="No activities" description="No activities have been created yet" />
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={typeBadgeVariant[activity.type] || 'default'}>
                      {activity.type || 'activity'}
                    </Badge>
                    {activity.status === 'approved' ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="warning">Pending Approval</Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-text dark:text-text-dark mt-1">
                    {activity.title}
                  </h4>
                  {activity.description && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {activity.description.replace(/<[^>]*>/g, '').slice(0, 200)}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    {activity.organizer && (
                      <span>By {activity.organizer}</span>
                    )}
                    {activity.startDate && (
                      <span>
                        {new Date(activity.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {activity.status !== 'approved' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApprove(activity.id)}
                        icon={Check}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(activity.id)}
                        icon={X}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateAnnouncementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleAnnouncementCreated}
      />
    </motion.div>
  )
}

function CreateAnnouncementModal({ isOpen, onClose, onCreated }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ title: '', description: '', department: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) {
      setError('Title is required')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/activities', {
        ...form,
        type: 'announcement',
        startDate: new Date().toISOString(),
      })
      setForm({ title: '', description: '', department: '' })
      onCreated()
    } catch (err) {
      setError(err.message || 'Failed to create announcement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Announcement" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-danger/10 text-danger text-sm">{error}</div>
        )}
        <Input
          label="Title"
          value={form.title}
          onChange={handleChange('title')}
          placeholder="Announcement title"
          required
        />
        <div>
          <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={handleChange('description')}
            rows={4}
            className="w-full rounded-md border border-border dark:border-border-dark bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 px-3 py-2 text-sm resize-none"
            placeholder="Describe the announcement..."
          />
        </div>
        <Input
          label="Department (optional)"
          value={form.department}
          onChange={handleChange('department')}
          placeholder="Leave empty for all departments"
        />
        <div className="flex justify-end gap-3 pt-2 border-t border-border dark:border-border-dark">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={submitting} icon={Megaphone}>
            Publish Announcement
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function BroadcastTab() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ department: '', message: '' })
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loadingDeps, setLoadingDeps] = useState(true)

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const res = await api.get('/admin/departments')
        setDepartments(res.data || res || [])
      } catch {
        setDepartments([])
      } finally {
        setLoadingDeps(false)
      }
    }
    fetchDeps()
  }, [])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSend = async () => {
    if (!form.message) return
    setSending(true)
    try {
      await api.post('/notifications/broadcast', form)
      setForm({ department: '', message: '' })
      setToast({ message: 'Broadcast sent successfully', type: 'success' })
    } catch {
      setToast({ message: 'Failed to send broadcast', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const deptOptions = [
    { value: '', label: t('admin.allDepartments') },
    ...departments.map((d) => ({
      value: typeof d === 'string' ? d : d.name || d.id,
      label: typeof d === 'string' ? d : d.name || d.id,
    })),
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-md shadow-lg text-sm font-medium bg-success text-white"
          >
            <Check size={16} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Radio size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text dark:text-text-dark">{t('admin.sendBroadcast')}</h3>
            <p className="text-xs text-muted">
              Send a notification to all users in a department or everyone.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {loadingDeps ? (
            <Skeleton variant="text" className="h-10" />
          ) : (
            <Select
              label={t('admin.selectDepartment')}
              options={deptOptions}
              value={form.department}
              onChange={handleChange('department')}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1">
              {t('admin.message')}
            </label>
            <textarea
              value={form.message}
              onChange={handleChange('message')}
              rows={5}
              placeholder="Type your broadcast message..."
              className="w-full rounded-md border border-border dark:border-border-dark bg-white dark:bg-primary-dark text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-200 px-3 py-2 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border dark:border-border-dark">
            <Button
              onClick={handleSend}
              loading={sending}
              disabled={!form.message}
              icon={Send}
              size="lg"
            >
              {t('admin.sendBroadcast')}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const TAB_COMPONENTS = {
  dashboard: DashboardTab,
  users: UsersTab,
  activities: ActivitiesTab,
  broadcast: BroadcastTab,
}

export default function AdminPanel() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState('dashboard')

  const ActiveTab = TAB_COMPONENTS[activeTab]

  if (!user || user.role !== 'ADMIN') {
    return (
      <PageWrapper title={t('admin.adminPanel')}>
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-3 rounded-full bg-danger/10 text-danger mb-4">
              <Shield size={32} />
            </div>
            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-2">Access Denied</h2>
            <p className="text-sm text-muted max-w-sm">
              You do not have the required permissions to access this page. Only administrators can view the admin panel.
            </p>
          </div>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={t('admin.adminPanel')}>
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:sticky lg:top-24">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted hover:text-text dark:hover:text-text-dark hover:bg-border/30 dark:hover:bg-border-dark/30'
                  }`}
                >
                  <tab.icon size={16} />
                  {t(tab.labelKey)}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ActiveTab />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}
