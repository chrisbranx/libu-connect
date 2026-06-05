import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  User, Shield, Palette, Bell, Lock, GraduationCap, Database,
  Camera, Save, Eye, EyeOff, Check, X, Download, Trash2,
  AlertTriangle, Moon, Sun, Languages, Globe,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'
import useNotesStore from '../../store/notesStore'
import { api } from '../../services/api'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Avatar from '../../components/ui/Avatar'

const TABS = [
  { key: 'profile', icon: User, labelKey: 'settings.profile' },
  { key: 'account', icon: Shield, labelKey: 'settings.account' },
  { key: 'appearance', icon: Palette, labelKey: 'settings.appearance' },
  { key: 'notifications', icon: Bell, labelKey: 'settings.notifications' },
  { key: 'privacy', icon: Lock, labelKey: 'settings.privacy' },
  { key: 'academic', icon: GraduationCap, labelKey: 'settings.academic' },
  { key: 'data', icon: Database, labelKey: 'settings.data' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const NOTIFICATION_SETTINGS = [
  { key: 'scheduleReminders', label: 'Schedule reminders', desc: 'Get notified about upcoming classes and events' },
  { key: 'newActivities', label: 'New activities', desc: 'When new campus activities are posted' },
  { key: 'gradeUpdates', label: 'Grade updates', desc: 'When new grades are published' },
  { key: 'announcements', label: 'Announcements', desc: 'Important announcements from administration' },
  { key: 'aiReminders', label: 'AI reminders', desc: 'Tips and reminders from your AI advisor' },
]

const PRIVACY_SETTINGS = [
  { key: 'showInDirectory', label: 'Show in directory', desc: 'Let other users find you in the campus directory' },
  { key: 'showEmail', label: 'Show email', desc: 'Display your email address on your profile' },
  { key: 'showDepartment', label: 'Show department', desc: 'Show your department affiliation' },
  { key: 'showLevel', label: 'Show level', desc: 'Display your current academic level' },
]

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-md shadow-lg text-sm font-medium ${
        type === 'success'
          ? 'bg-success text-white'
          : 'bg-danger text-white'
      }`}
    >
      {type === 'success' ? <Check size={16} /> : <X size={16} />}
      {message}
    </motion.div>
  )
}

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        enabled ? 'bg-primary' : 'bg-border dark:bg-border-dark'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function ProfileSection() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    department: user?.department || '',
    level: user?.level || '',
    matricule: user?.matricule || '',
  })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        department: user.department || '',
        level: user.level || '',
        matricule: user.matricule || '',
      })
    }
  }, [user])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.upload('/auth/avatar', formData)
      updateUser({ avatar: res.data?.avatar || res.avatar })
      setToast({ message: 'Avatar updated', type: 'success' })
    } catch {
      setToast({ message: 'Failed to update avatar', type: 'error' })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/auth/profile', form)
      updateUser(form)
      setToast({ message: 'Profile updated successfully', type: 'success' })
    } catch {
      setToast({ message: 'Failed to update profile', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <Card>
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar src={user?.avatar} name={`${user?.firstName || ''} ${user?.lastName || ''}`} size="xl" />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text dark:text-text-dark">
              {user?.firstName || ''} {user?.lastName || ''}
            </h3>
            <p className="text-sm text-muted">{user?.email}</p>
            <p className="text-xs text-muted mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-4">{t('settings.editProfile')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Input label={t('auth.firstName')} value={form.firstName} onChange={handleChange('firstName')} />
          <Input label={t('auth.lastName')} value={form.lastName} onChange={handleChange('lastName')} />
          <Input label={t('auth.department')} value={form.department} onChange={handleChange('department')} />
          <Input label={t('auth.level')} value={form.level} onChange={handleChange('level')} />
          <Input label={t('auth.matricule')} value={form.matricule} onChange={handleChange('matricule')} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} icon={Save}>{t('settings.saveChanges')}</Button>
        </div>
      </Card>
    </motion.div>
  )
}

function AccountSection() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [passwordError, setPasswordError] = useState('')

  const handlePasswordChange = (field) => (e) => {
    setPasswords((prev) => ({ ...prev, [field]: e.target.value }))
    setPasswordError('')
  }

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setToast({ message: 'Password changed successfully', type: 'success' })
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await api.delete('/auth/account')
      await logout()
    } catch {
      setDeleting(false)
      setToast({ message: 'Failed to delete account', type: 'error' })
    }
  }

  const toggleShow = (field) => () => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1">Email Address</h3>
        <p className="text-sm text-muted mb-3">Your email address is verified and cannot be changed here.</p>
        <div className="p-3 rounded-md bg-surface dark:bg-primary-dark/50 border border-border dark:border-border-dark">
          <p className="text-sm font-medium text-text dark:text-text-dark">{user?.email}</p>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-4">{t('settings.changePassword')}</h3>
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Input
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwords.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
            />
            <button
              type="button"
              onClick={toggleShow('current')}
              className="absolute right-3 top-[38px] text-muted hover:text-text dark:hover:text-text-dark transition-colors"
            >
              {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwords.newPassword}
              onChange={handlePasswordChange('newPassword')}
            />
            <button
              type="button"
              onClick={toggleShow('new')}
              className="absolute right-3 top-[38px] text-muted hover:text-text dark:hover:text-text-dark transition-colors"
            >
              {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwords.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
            />
            <button
              type="button"
              onClick={toggleShow('confirm')}
              className="absolute right-3 top-[38px] text-muted hover:text-text dark:hover:text-text-dark transition-colors"
            >
              {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordError && (
            <p className="text-sm text-danger">{passwordError}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleChangePassword} loading={changingPassword}>Change Password</Button>
        </div>
      </Card>

      <Card className="border-danger/30 dark:border-danger/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-md bg-danger/10 text-danger shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-danger mb-1">{t('settings.deleteAccount')}</h3>
            <p className="text-sm text-muted mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)} icon={Trash2}>
              {t('settings.deleteAccount')}
            </Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-danger/10 text-danger">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">This action is permanent and cannot be reversed.</p>
          </div>
          <p className="text-sm text-muted">
            All your data including notes, grades, schedule, and activities will be permanently deleted.
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-border dark:border-border-dark">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleting} icon={Trash2}>
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

const colorThemes = [
  { id: 'indigo', name: 'Indigo', primary: '#4F46E5', bg: '#EEF2FF' },
  { id: 'emerald', name: 'Emerald', primary: '#059669', bg: '#ECFDF5' },
  { id: 'violet', name: 'Violet', primary: '#7C3AED', bg: '#F5F3FF' },
  { id: 'rose', name: 'Rose', primary: '#E11D48', bg: '#FFF1F2' },
  { id: 'amber', name: 'Amber', primary: '#D97706', bg: '#FFFBEB' },
]

function AppearanceSection() {
  const { t, i18n } = useTranslation()
  const { darkMode, toggleDarkMode, setLanguage, themeColor, setThemeColor } = useThemeStore()
  const [changing, setChanging] = useState(false)

  const handleLanguageChange = async (lang) => {
    setChanging(true)
    await i18n.changeLanguage(lang)
    setLanguage(lang)
    setTimeout(() => setChanging(false), 300)
  }

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-4">{t('settings.darkMode')}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-warning" />}
            <div>
              <p className="text-sm font-medium text-text dark:text-text-dark">
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-xs text-muted">
                {darkMode ? 'Using dark theme' : 'Using light theme'}
              </p>
            </div>
          </div>
          <Toggle enabled={darkMode} onChange={toggleDarkMode} />
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-4">Color Theme</h3>
        <div className="flex flex-wrap gap-3">
          {colorThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setThemeColor(theme.primary)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                themeColor === theme.primary
                  ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-primary-dark scale-110'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: theme.primary }}
              title={theme.name}
            >
              {themeColor === theme.primary && <Check size={16} className="text-white" />}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-4">{t('settings.language')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            disabled={changing}
            className={`flex items-center gap-4 p-4 rounded-md border-2 transition-all ${
              i18n.language === 'en'
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-border dark:border-border-dark hover:border-primary/30 dark:hover:border-accent/30'
            }`}
          >
            <Languages className="text-2xl" />
            <div className="text-left">
              <p className="text-sm font-semibold text-text dark:text-text-dark">{t('settings.english')}</p>
              <p className="text-xs text-muted">English</p>
            </div>
            {i18n.language === 'en' && (
              <div className="ml-auto p-1 rounded-full bg-primary text-white">
                <Check size={14} />
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('fr')}
            disabled={changing}
            className={`flex items-center gap-4 p-4 rounded-md border-2 transition-all ${
              i18n.language === 'fr'
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-border dark:border-border-dark hover:border-primary/30 dark:hover:border-accent/30'
            }`}
          >
            <Globe className="text-2xl" />
            <div className="text-left">
              <p className="text-sm font-semibold text-text dark:text-text-dark">{t('settings.french')}</p>
              <p className="text-xs text-muted">Français</p>
            </div>
            {i18n.language === 'fr' && (
              <div className="ml-auto p-1 rounded-full bg-primary text-white">
                <Check size={14} />
              </div>
            )}
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-2">Preview</h3>
        <div className="p-4 rounded-md bg-surface dark:bg-primary-dark/50 border border-border dark:border-border-dark">
          <p className="text-sm text-text dark:text-text-dark font-medium mb-1">
            {t('dashboard.welcome')}, {useAuthStore.getState().user?.firstName || 'User'}!
          </p>
          <p className="text-xs text-muted">
            {t('dashboard.todaySchedule')} &middot; {t('academic.currentGpa')} &middot; {t('notes.myNotes')}
          </p>
          <div className="mt-2 flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-accent">
              {t('common.save')}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-border dark:bg-border-dark text-muted">
              {t('common.cancel')}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function NotificationsSection() {
  const { t } = useTranslation()
  const [preferences, setPreferences] = useState(
    Object.fromEntries(NOTIFICATION_SETTINGS.map((s) => [s.key, true]))
  )
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const handleToggle = (key) => (val) => {
    setPreferences((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/notifications/preferences', preferences)
      setToast({ message: 'Notification preferences saved', type: 'success' })
    } catch {
      setToast({ message: 'Failed to save preferences', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-4">{t('settings.notificationPreferences')}</h3>
        <div className="space-y-1">
          {NOTIFICATION_SETTINGS.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-surface dark:hover:bg-primary-dark/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text dark:text-text-dark">{setting.label}</p>
                <p className="text-xs text-muted mt-0.5">{setting.desc}</p>
              </div>
              <Toggle enabled={preferences[setting.key]} onChange={handleToggle(setting.key)} />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 mt-2 border-t border-border dark:border-border-dark">
          <Button onClick={handleSave} loading={saving} icon={Save}>{t('common.save')}</Button>
        </div>
      </Card>
    </motion.div>
  )
}

function PrivacySection() {
  const { t } = useTranslation()
  const [preferences, setPreferences] = useState(
    Object.fromEntries(PRIVACY_SETTINGS.map((s) => [s.key, true]))
  )
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const handleToggle = (key) => (val) => {
    setPreferences((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/auth/privacy', preferences)
      setToast({ message: 'Privacy settings saved', type: 'success' })
    } catch {
      setToast({ message: 'Failed to save privacy settings', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-4">Privacy Settings</h3>
        <p className="text-sm text-muted mb-4">
          Control how your information is shared across the campus directory and your profile.
        </p>
        <div className="space-y-1">
          {PRIVACY_SETTINGS.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-surface dark:hover:bg-primary-dark/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-text dark:text-text-dark">{setting.label}</p>
                <p className="text-xs text-muted mt-0.5">{setting.desc}</p>
              </div>
              <Toggle enabled={preferences[setting.key]} onChange={handleToggle(setting.key)} />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 mt-2 border-t border-border dark:border-border-dark">
          <Button onClick={handleSave} loading={saving} icon={Save}>{t('common.save')}</Button>
        </div>
      </Card>
    </motion.div>
  )
}

function AcademicSection() {
  const { t } = useTranslation()
  const [gpaScale, setGpaScale] = useState('4.0')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/auth/preferences', { gpaScale })
      setToast({ message: 'Academic preferences saved', type: 'success' })
    } catch {
      setToast({ message: 'Failed to save preferences', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1">GPA Scale Preference</h3>
        <p className="text-sm text-muted mb-4">
          Choose how your GPA is calculated and displayed across the platform.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setGpaScale('4.0')}
            className={`p-4 rounded-md border-2 text-left transition-all ${
              gpaScale === '4.0'
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-border dark:border-border-dark hover:border-primary/30 dark:hover:border-accent/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-text dark:text-text-dark">4.0 Scale</span>
              {gpaScale === '4.0' && (
                <div className="p-1 rounded-full bg-primary text-white">
                  <Check size={14} />
                </div>
              )}
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Standard 4.0 GPA scale (A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0.0)
            </p>
          </button>
          <button
            type="button"
            onClick={() => setGpaScale('20')}
            className={`p-4 rounded-md border-2 text-left transition-all ${
              gpaScale === '20'
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-border dark:border-border-dark hover:border-primary/30 dark:hover:border-accent/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-text dark:text-text-dark">20-Point Scale</span>
              {gpaScale === '20' && (
                <div className="p-1 rounded-full bg-primary text-white">
                  <Check size={14} />
                </div>
              )}
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Cameroonian 20-point grading system (16-20 = A, 14-15.9 = B, 12-13.9 = C, 10-11.9 = D, &lt;10 = F)
            </p>
          </button>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} icon={Save}>{t('common.save')}</Button>
        </div>
      </Card>
    </motion.div>
  )
}

function DataSection() {
  const { t } = useTranslation()
  const { notes, fetchNotes } = useNotesStore()
  const [exporting, setExporting] = useState(false)
  const [clearingNotes, setClearingNotes] = useState(false)
  const [showClearNotesModal, setShowClearNotesModal] = useState(false)
  const [showClearGradesModal, setShowClearGradesModal] = useState(false)
  const [toast, setToast] = useState(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/auth/export')
      const data = res.data || res
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `libu-connect-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setToast({ message: 'Data exported successfully', type: 'success' })
    } catch {
      setToast({ message: 'Failed to export data', type: 'error' })
    } finally {
      setExporting(false)
    }
  }

  const handleClearNotes = async () => {
    setClearingNotes(true)
    try {
      await Promise.all(notes.map((n) => api.delete(`/notes/${n.id}`)))
      await fetchNotes()
      setShowClearNotesModal(false)
      setToast({ message: 'All notes cleared', type: 'success' })
    } catch {
      setToast({ message: 'Failed to clear notes', type: 'error' })
    } finally {
      setClearingNotes(false)
    }
  }

  const handleClearGrades = async () => {
    try {
      await api.delete('/academic/grades/all')
      setShowClearGradesModal(false)
      setToast({ message: 'All grades cleared', type: 'success' })
    } catch {
      setToast({ message: 'Failed to clear grades', type: 'error' })
    }
  }

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <Card>
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1">Export Data</h3>
        <p className="text-sm text-muted mb-4">
          Download all your data including profile, notes, grades, schedule, and activities as a JSON file.
        </p>
        <Button onClick={handleExport} loading={exporting} icon={Download}>{t('settings.exportData')}</Button>
      </Card>

      <Card className="border-warning/30 dark:border-warning/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-md bg-warning/10 text-warning shrink-0">
            <Trash2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1">{t('settings.clearNotes')}</h3>
            <p className="text-sm text-muted mb-4">
              Permanently delete all your notes. This action cannot be undone.
            </p>
            <Button variant="outline" onClick={() => setShowClearNotesModal(true)} icon={Trash2}>
              {t('settings.clearNotes')}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-warning/30 dark:border-warning/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-md bg-warning/10 text-warning shrink-0">
            <Trash2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1">{t('settings.clearGrades')}</h3>
            <p className="text-sm text-muted mb-4">
              Permanently delete all your grades and GPA data. This action cannot be undone.
            </p>
            <Button variant="outline" onClick={() => setShowClearGradesModal(true)} icon={Trash2}>
              {t('settings.clearGrades')}
            </Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={showClearNotesModal} onClose={() => setShowClearNotesModal(false)} title="Clear All Notes" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-warning/10 text-warning">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">This will permanently delete {notes.length} note{notes.length !== 1 ? 's' : ''}.</p>
          </div>
          <p className="text-sm text-muted">This action cannot be undone. All your notes will be permanently removed.</p>
          <div className="flex justify-end gap-3 pt-2 border-t border-border dark:border-border-dark">
            <Button variant="ghost" onClick={() => setShowClearNotesModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleClearNotes} loading={clearingNotes} icon={Trash2}>
              Delete All Notes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showClearGradesModal} onClose={() => setShowClearGradesModal(false)} title="Clear All Grades" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-warning/10 text-warning">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">This will permanently delete all your grades.</p>
          </div>
          <p className="text-sm text-muted">This action cannot be undone. Your GPA and all grade records will be permanently removed.</p>
          <div className="flex justify-end gap-3 pt-2 border-t border-border dark:border-border-dark">
            <Button variant="ghost" onClick={() => setShowClearGradesModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleClearGrades} icon={Trash2}>
              Delete All Grades
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

const SECTION_COMPONENTS = {
  profile: ProfileSection,
  account: AccountSection,
  appearance: AppearanceSection,
  notifications: NotificationsSection,
  privacy: PrivacySection,
  academic: AcademicSection,
  data: DataSection,
}

export default function Settings() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')

  const ActiveSection = SECTION_COMPONENTS[activeTab]

  return (
    <PageWrapper title={t('settings.settings')}>
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
              <ActiveSection />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}
