import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Send, Bot, User, Trash2, Mic, ChevronRight,
  Calendar, TrendingUp, FileText, Activity,
  Sparkles, Loader2,
} from 'lucide-react'
import { api } from '../../services/api'
import useAuthStore from '../../store/authStore'
import useScheduleStore from '../../store/scheduleStore'
import useAcademicStore from '../../store/academicStore'
import useNotesStore from '../../store/notesStore'
import useActivitiesStore from '../../store/activitiesStore'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import Card from '../../components/ui/Card'

const QUICK_CHIPS = [
  { key: 'schedule', labelKey: 'ai.whatSchedule' },
  { key: 'gpa', labelKey: 'ai.howGPA' },
  { key: 'summarize', labelKey: 'ai.summarizeNotes' },
  { key: 'failing', labelKey: 'ai.failingCourses' },
  { key: 'study', labelKey: 'ai.studyPlan' },
  { key: 'activities', labelKey: 'ai.activitiesThisWeek' },
]

const contextItems = [
  { key: 'schedule', icon: Calendar, labelKey: 'schedule.mySchedule', color: 'text-primary dark:text-accent', bg: 'bg-primary/10 dark:bg-accent/10' },
  { key: 'grades', icon: TrendingUp, labelKey: 'academic.currentGpa', color: 'text-success', bg: 'bg-success/10' },
  { key: 'notes', icon: FileText, labelKey: 'notes.myNotes', color: 'text-warning', bg: 'bg-warning/10' },
  { key: 'activities', icon: Activity, labelKey: 'activities.campusActivities', color: 'text-danger', bg: 'bg-danger/10' },
]

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-accent/10 flex items-center justify-center">
        <Bot size={16} className="text-primary dark:text-accent" />
      </div>
      <div className="bg-white dark:bg-primary-dark border border-border dark:border-border-dark rounded-lg px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary dark:bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary dark:bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary dark:bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-primary/10 dark:bg-accent/10'
            : 'bg-primary/10 dark:bg-accent/10'
        }`}
      >
        {isUser ? (
          <User size={16} className="text-primary dark:text-accent" />
        ) : (
          <Bot size={16} className="text-primary dark:text-accent" />
        )}
      </div>

      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-white dark:bg-primary-dark border border-border dark:border-border-dark text-text dark:text-text-dark rounded-tl-sm'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  )
}

function WelcomeMessage({ onChipClick, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center text-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-accent/10 flex items-center justify-center mb-5">
        <Sparkles size={32} className="text-primary dark:text-accent" />
      </div>
      <h2 className="text-xl font-display font-bold text-text dark:text-text-dark mb-2">
        {t('ai.chatWithAI')}
      </h2>
      <p className="text-sm text-muted max-w-md mb-8">
        Ask me anything about your schedule, grades, notes, or campus activities. I&apos;m here to help you succeed.
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => onChipClick(chip)}
            className="px-3.5 py-2 rounded-md text-sm bg-white dark:bg-primary-dark border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-primary/5 dark:hover:bg-accent/5 hover:border-primary/30 dark:hover:border-accent/30 transition-all"
          >
            {t(chip.labelKey)}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function AIContextPanel() {
  const { t } = useTranslation()
  const { schedules, fetchSchedules } = useScheduleStore()
  const { summary, fetchSummary } = useAcademicStore()
  const { notes, fetchNotes } = useNotesStore()
  const { activities, fetchActivities } = useActivitiesStore()

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchSchedules({ limit: 1 })
    fetchSummary()
    fetchNotes({ limit: 1 })
    fetchActivities({ limit: 1 })
    setLoaded(true)
  }, [fetchSchedules, fetchSummary, fetchNotes, fetchActivities])

  const counts = {
    schedule: schedules.length,
    grades: summary?.currentGpa ?? null,
    notes: notes.length,
    activities: activities.length,
  }

  const previews = {
    schedule: schedules[0]?.title
      ? `${schedules[0].title}${schedules[0].startTime ? ` at ${new Date(schedules[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`
      : null,
    grades: summary?.currentGpa
      ? `Current GPA: ${summary.currentGpa.toFixed(2)} / 4.0`
      : null,
    notes: notes[0]?.title
      ? notes[0].title
      : null,
    activities: activities[0]?.title
      ? activities[0].title
      : null,
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Bot size={18} className="text-primary dark:text-accent" />
        <h3 className="font-display font-semibold text-text dark:text-text-dark text-sm">
          {t('ai.aiContext')}
        </h3>
      </div>
      <p className="text-xs text-muted mb-4">
        {t('ai.thisIsWhatAISees')}
      </p>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {contextItems.map((item) => {
          const count = counts[item.key]
          const preview = previews[item.key]

          return (
            <div
              key={item.key}
              className="p-3 rounded-lg bg-white dark:bg-primary-dark border border-border dark:border-border-dark hover:border-primary/20 dark:hover:border-accent/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${item.bg}`}>
                    <item.icon size={14} className={item.color} />
                  </div>
                  <span className="text-xs font-medium text-text dark:text-text-dark">
                    {t(item.labelKey)}
                  </span>
                </div>
                {item.key === 'grades' && count !== null ? (
                  <span className="text-xs font-semibold text-success">
                    {count.toFixed(2)}
                  </span>
                ) : (
                  <span className={`text-xs font-semibold ${count > 0 ? 'text-primary dark:text-accent' : 'text-muted'}`}>
                    {count ?? 0}
                  </span>
                )}
              </div>
              {preview && (
                <p className="text-[11px] text-muted truncate leading-relaxed pl-9">
                  {preview}
                </p>
              )}
              {!preview && count > 0 && (
                <p className="text-[11px] text-muted pl-9">{count} items</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AIAdvisor() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = useCallback((smooth = true) => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  const handleSend = useCallback(async (text) => {
    const message = (text || input).trim()
    if (!message || loading) return

    setInput('')
    setError('')

    const userMsg = { role: 'user', content: message }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await api.post('/ai/chat', { message, language: user?.language || 'en' })
      const aiContent = res.data?.response || res.data?.message || res.data?.content || JSON.stringify(res.data)
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }])
    } catch (err) {
      setError(err.message || 'Failed to get AI response')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm temporarily unavailable. Please try again later.",
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, user])

  const handleChipClick = useCallback((chip) => {
    handleSend(t(chip.labelKey))
  }, [handleSend, t])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setError('')
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value)
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [])

  return (
    <PageWrapper title={t('ai.aiAdvisor')}>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-12rem)] lg:h-[calc(100vh-10rem)]">
        <div className="flex-1 flex flex-col bg-white dark:bg-primary-dark rounded-md border border-border dark:border-border-dark shadow-sm overflow-hidden min-h-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-primary dark:text-accent" />
              <span className="text-sm font-semibold text-text dark:text-text-dark">
                {t('ai.aiAdvisor')}
              </span>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={handleClearChat}
              >
                {t('ai.clearChat')}
              </Button>
            )}
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
          >
            {messages.length === 0 && !loading ? (
              <WelcomeMessage onChipClick={handleChipClick} t={t} />
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} message={msg} />
                ))}
                {loading && <TypingIndicator />}
                {error && !loading && (
                  <div className="text-xs text-danger text-center py-2">
                    {error}
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-border dark:border-border-dark shrink-0">
            {messages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-none">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => handleChipClick(chip)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-md text-xs whitespace-nowrap bg-surface dark:bg-primary-dark/50 border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-primary/5 dark:hover:bg-accent/5 hover:border-primary/30 dark:hover:border-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {t(chip.labelKey)}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 px-4 py-3 border-t border-border dark:border-border-dark">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('ai.typeMessage')}
                  rows={1}
                  disabled={loading}
                  className="w-full pr-3 py-2.5 text-sm rounded-md border border-border dark:border-border-dark bg-surface dark:bg-primary-dark/50 text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none disabled:opacity-50"
                  style={{ minHeight: '40px' }}
                />
              </div>
              <button
                type="button"
                className="shrink-0 p-2.5 rounded-md text-muted hover:text-text dark:hover:text-text-dark hover:bg-border/30 dark:hover:bg-border-dark/30 transition-colors disabled:opacity-50"
                disabled
                title="Voice input (coming soon)"
              >
                <Mic size={18} />
              </button>
              <Button
                size="md"
                icon={loading ? Loader2 : Send}
                onClick={() => handleSend()}
                loading={loading}
                disabled={!input.trim() && !loading}
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:w-80 xl:w-96 shrink-0">
          <div className="bg-white dark:bg-primary-dark rounded-md border border-border dark:border-border-dark shadow-sm p-4 h-full">
            <AIContextPanel />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
