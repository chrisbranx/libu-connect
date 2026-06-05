import { useEffect, useState, useMemo, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, BookOpen,
  CalendarDays, LayoutGrid, AlertTriangle, Download, Upload, Trash2,
  X, Check, Repeat, Bell, Pallette,
} from 'lucide-react'
import {
  format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval,
  startOfMonth, endOfMonth, isSameMonth, isSameDay, isToday, parseISO,
  addDays, getHours, getMinutes, setHours, setMinutes,
} from 'date-fns'
import useScheduleStore from '../../store/scheduleStore'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const HOUR_HEIGHT = 60
const START_HOUR = 7
const END_HOUR = 20
const TOTAL_HOURS = END_HOUR - START_HOUR
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const typeConfig = {
  class: { bg: 'bg-primary/15 dark:bg-primary/25', border: 'border-l-primary', text: 'text-primary dark:text-primary-light', badge: 'info' },
  exam: { bg: 'bg-danger/15 dark:bg-danger/25', border: 'border-l-danger', text: 'text-danger', badge: 'danger' },
  assignment: { bg: 'bg-warning/15 dark:bg-warning/25', border: 'border-l-warning', text: 'text-warning', badge: 'warning' },
  personal: { bg: 'bg-accent/15 dark:bg-accent/25', border: 'border-l-accent', text: 'text-accent', badge: 'default' },
  event: { bg: 'bg-success/15 dark:bg-success/25', border: 'border-l-success', text: 'text-success', badge: 'success' },
}

const scheduleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  type: z.enum(['class', 'exam', 'assignment', 'personal', 'event']),
  course: z.string().max(80).optional().default(''),
  lecturer: z.string().max(80).optional().default(''),
  location: z.string().max(120).optional().default(''),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  isRecurring: z.boolean().optional().default(false),
  recurDays: z.array(z.string()).optional().default([]),
  color: z.string().optional().default(''),
  reminder: z.enum(['none', '15min', '30min', '1hr']).optional().default('none'),
}).refine((data) => {
  if (!data.startTime || !data.endTime) return true
  return data.startTime < data.endTime
}, { message: 'End time must be after start time', path: ['endTime'] })

function ScheduleForm({ isOpen, onClose, editItem, selectedDate, selectedTime, onSubmit }) {
  const { t } = useTranslation()
  const isEdit = !!editItem

  const defaultValues = useMemo(() => ({
    title: editItem?.title || '',
    type: editItem?.type || 'class',
    course: editItem?.course || '',
    lecturer: editItem?.lecturer || '',
    location: editItem?.location || '',
    date: editItem?.date ? format(parseISO(editItem.date), 'yyyy-MM-dd') : selectedDate || format(new Date(), 'yyyy-MM-dd'),
    startTime: editItem?.startTime ? format(parseISO(editItem.startTime), 'HH:mm') : selectedTime || '08:00',
    endTime: editItem?.endTime ? format(parseISO(editItem.endTime), 'HH:mm') : '09:00',
    isRecurring: editItem?.isRecurring || false,
    recurDays: editItem?.recurDays || [],
    color: editItem?.color || '',
    reminder: editItem?.reminder || 'none',
  }), [editItem, selectedDate, selectedTime])

  const { register, handleSubmit, watch, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues,
  })

  useEffect(() => { if (isOpen) reset(defaultValues) }, [isOpen, reset, defaultValues])

  const isRecurring = watch('isRecurring')
  const scheduleType = watch('type')

  const handleFormSubmit = async (data) => {
    const payload = {
      ...data,
      startTime: `${data.date}T${data.startTime}:00`,
      endTime: `${data.date}T${data.endTime}:00`,
    }
    if (editItem) payload.id = editItem.id
    await onSubmit(payload)
    onClose()
  }

  const dayLabels = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Event' : 'Add Event'} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input label={t('scheduler.title')} {...register('title')} error={errors.title?.message} placeholder="Enter event title" />

        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" options={[
            { value: 'class', label: t('scheduler.class') },
            { value: 'exam', label: t('scheduler.exam') },
            { value: 'assignment', label: t('scheduler.assignment') },
            { value: 'personal', label: t('scheduler.personal') },
            { value: 'event', label: t('scheduler.event') },
          ]} {...register('type')} error={errors.type?.message} />

          <Select label="Reminder" options={[
            { value: 'none', label: 'None' },
            { value: '15min', label: '15 minutes before' },
            { value: '30min', label: '30 minutes before' },
            { value: '1hr', label: '1 hour before' },
          ]} {...register('reminder')} error={errors.reminder?.message} />
        </div>

        <Input label="Course (optional)" {...register('course')} icon={BookOpen} placeholder="e.g. CS 101" />
        <Input label="Lecturer (optional)" {...register('lecturer')} icon={User} placeholder="e.g. Dr. Smith" />
        <Input label={t('scheduler.location')} {...register('location')} icon={MapPin} placeholder="Room 203" />

        <div className="grid grid-cols-3 gap-4">
          <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
          <Input label={t('scheduler.startTime')} type="time" {...register('startTime')} error={errors.startTime?.message} />
          <Input label={t('scheduler.endTime')} type="time" {...register('endTime')} error={errors.endTime?.message} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
            <input type="checkbox" {...register('isRecurring')} className="rounded border-gray-200 text-primary focus:ring-primary/30" />
            <Repeat size={14} />
            {t('scheduler.recurring')}
          </label>
        </div>

        <AnimatePresence>
          {isRecurring && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <label key={d} className="flex items-center gap-1.5 text-xs text-gray-900 dark:text-gray-100 cursor-pointer px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100/30 dark:hover:bg-gray-800/20 transition-colors">
                  <input type="checkbox" value={d} {...register('recurDays')} className="rounded border-gray-200 text-primary focus:ring-primary/30" />
                  {dayLabels[d]}
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500">Preview:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeConfig[scheduleType]?.bg} ${typeConfig[scheduleType]?.text}`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {t(`scheduler.${scheduleType}`)}
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose} type="button">{t('scheduler.cancel')}</Button>
          <Button type="submit" loading={isSubmitting} icon={isEdit ? Check : Plus}>
            {isEdit ? t('common.save') : t('scheduler.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function DeleteDialog({ isOpen, onClose, onConfirm, title }) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('common.delete')} size="sm">
      <p className="text-sm text-gray-900 dark:text-gray-100 mb-6">
        Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="danger" onClick={onConfirm} icon={Trash2}>{t('common.delete')}</Button>
      </div>
    </Modal>
  )
}

function TimeAxis() {
  return (
    <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
      {Array.from({ length: TOTAL_HOURS }, (_, i) => {
        const hour = START_HOUR + i
        return (
          <div key={hour} className="absolute left-0 right-0 flex items-start" style={{ top: i * HOUR_HEIGHT }}>
            <span className="text-[11px] text-gray-500 font-medium -mt-2 w-14 text-right pr-3 select-none">
              {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function WeeklyCalendar({ currentDate, schedules, onSlotClick, onItemClick }) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = addDays(start, 5)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const getEventsForDay = useCallback((day) => {
    return schedules.filter((s) => {
      const eventDate = s.date ? parseISO(s.date) : s.startTime ? parseISO(s.startTime) : null
      return eventDate && isSameDay(eventDate, day)
    })
  }, [schedules])

  const getEventStyle = (event) => {
    const start = event.startTime ? parseISO(event.startTime) : new Date()
    const end = event.endTime ? parseISO(event.endTime) : new Date()
    const startHour = getHours(start) + getMinutes(start) / 60
    const endHour = getHours(end) + getMinutes(end) / 60
    const top = (startHour - START_HOUR) * HOUR_HEIGHT
    const height = Math.max((endHour - startHour) * HOUR_HEIGHT, 20)
    return { top: `${top}px`, height: `${height}px` }
  }

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="flex ml-14 mb-1">
          {weekDays.map((day, i) => (
            <div key={i} className="flex-1 text-center py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">{dayHeaders[i]}</p>
              <p className={`text-lg font-display font-bold mt-0.5 ${isToday(day) ? 'text-primary dark:text-accent' : 'text-gray-900 dark:text-gray-100'}`}>
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>

        <div className="relative flex border-t border-gray-200 dark:border-gray-700">
          <div className="shrink-0 w-14">
            <TimeAxis />
          </div>

          {weekDays.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day)
            return (
              <div key={dayIdx} className="flex-1 relative border-l border-gray-200 dark:border-gray-700" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
                <div className="absolute inset-0">
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-200/40 dark:border-gray-700/40 cursor-pointer hover:bg-gray-100/10 dark:hover:bg-gray-800/10 transition-colors"
                      style={{ height: HOUR_HEIGHT }}
                      onClick={() => {
                        const hour = START_HOUR + i
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const timeStr = `${String(hour).padStart(2, '0')}:00`
                        onSlotClick(dateStr, timeStr)
                      }}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {dayEvents.map((event) => {
                    const style = getEventStyle(event)
                    const config = typeConfig[event.type] || typeConfig.class
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scaleY: 0.8 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.8 }}
                        transition={{ duration: 0.15 }}
                        style={style}
                        className={`absolute left-0.5 right-0.5 rounded-md px-2 py-1 cursor-pointer overflow-hidden border-l-2 ${config.bg} ${config.border} hover:brightness-95 dark:hover:brightness-125 transition-all z-10`}
                        onClick={(e) => { e.stopPropagation(); onItemClick(event) }}
                      >
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                          {event.startTime ? format(parseISO(event.startTime), 'HH:mm') : ''} - {event.endTime ? format(parseISO(event.endTime), 'HH:mm') : ''}
                        </p>
                        {event.location && (
                          <p className="text-[10px] text-gray-500 truncate leading-tight flex items-center gap-0.5 mt-0.5">
                            <MapPin size={8} /> {event.location}
                          </p>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MonthView({ currentDate, schedules, onDayClick }) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const weeks = useMemo(() => {
    const result = []
    let day = calendarStart
    while (day <= monthEnd || day.getDay() !== 1) {
      const week = Array.from({ length: 6 }, (_, i) => addDays(day, i))
      result.push(week)
      day = addDays(day, 7)
    }
    return result
  }, [calendarStart, monthEnd])

  const getEventsForDay = useCallback((day) => {
    return schedules.filter((s) => {
      const eventDate = s.date ? parseISO(s.date) : s.startTime ? parseISO(s.startTime) : null
      return eventDate && isSameDay(eventDate, day)
    })
  }, [schedules])

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="grid grid-cols-6 bg-gray-50 dark:bg-gray-900/50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center py-2.5 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
            {d}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-6 border-b border-gray-200/40 dark:border-gray-700/40 last:border-b-0">
          {week.map((day, di) => {
            const events = getEventsForDay(day)
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)

            return (
              <button
                key={di}
                onClick={() => onDayClick(day)}
                className={`min-h-[80px] p-1.5 border-r border-gray-200/40 dark:border-gray-700/40 last:border-r-0 text-left transition-colors
                  ${inMonth ? 'hover:bg-gray-100/20 dark:hover:bg-gray-800/20' : 'opacity-30'}
                  ${today ? 'bg-primary/5 dark:bg-accent/5' : ''}
                `}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                  ${today ? 'bg-primary dark:bg-accent text-white dark:text-black' : 'text-gray-900 dark:text-gray-100'}
                `}>
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-0.5">
                  {events.slice(0, 3).map((ev) => (
                    <div key={ev.id} className={`h-1.5 rounded-full ${(typeConfig[ev.type] || typeConfig.class).bg}`} />
                  ))}
                  {events.length > 3 && (
                    <span className="text-[10px] text-gray-500 font-medium">+{events.length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function DayEventsPanel({ selectedDay, schedules, onClose, onItemClick }) {
  const events = useMemo(() => {
    return schedules.filter((s) => {
      const eventDate = s.date ? parseISO(s.date) : s.startTime ? parseISO(s.startTime) : null
      return eventDate && isSameDay(eventDate, selectedDay)
    })
  }, [schedules, selectedDay])

  if (!selectedDay) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-md bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {format(selectedDay, 'EEEE, MMMM d, yyyy')}
        </h4>
        <button onClick={onClose} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X size={14} />
        </button>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No events on this day</p>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onItemClick(ev)}
              className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-100/20 dark:hover:bg-gray-800/20 transition-colors"
            >
              <div className={`w-1.5 h-10 rounded-full ${(typeConfig[ev.type] || typeConfig.class).border.replace('border-l-', 'bg-')}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{ev.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={(typeConfig[ev.type] || typeConfig.class).badge}>{ev.type}</Badge>
                  {ev.startTime && (
                    <span className="text-xs text-gray-500">{format(parseISO(ev.startTime), 'HH:mm')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function UpcomingPanel({ upcoming, loading }) {
  const { t } = useTranslation()
  const grouped = useMemo(() => {
    return upcoming.reduce((acc, item) => {
      const date = item.date ? format(parseISO(item.date), 'yyyy-MM-dd') : 'unknown'
      if (!acc[date]) acc[date] = []
      acc[date].push(item)
      return acc
    }, {})
  }, [upcoming])

  const entries = Object.entries(grouped).slice(0, 7)

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton variant="text" className="h-16" count={4} />
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {entries.length === 0 ? (
        <EmptyState icon={CalendarDays} title={t('scheduler.noEvents')} description="No upcoming events in the next 7 days" />
      ) : (
        entries.map(([date, items]) => (
          <div key={date}>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 mt-3 first:mt-0 px-3">
              {format(parseISO(date), 'EEE, MMM d')}
            </p>
            {items.map((item) => {
              const config = typeConfig[item.type] || typeConfig.class
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100/20 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${config.bg.replace('/15', '')}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{item.startTime ? format(parseISO(item.startTime), 'HH:mm') : ''}</span>
                      {item.location && <span>• {item.location}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}

export default function Scheduler() {
  const { t } = useTranslation()
  const { schedules, upcoming, loading, fetchSchedules, fetchUpcoming, createSchedule, updateSchedule, deleteSchedule } = useScheduleStore()

  const [viewMode, setViewMode] = useState('weekly')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [slotDate, setSlotDate] = useState(null)
  const [slotTime, setSlotTime] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    const params = {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
    fetchSchedules(params)
    fetchUpcoming()
  }, [currentDate, fetchSchedules, fetchUpcoming])

  const handlePrev = () => setCurrentDate((d) => viewMode === 'weekly' ? subWeeks(d, 1) : subWeeks(d, 4))
  const handleNext = () => setCurrentDate((d) => viewMode === 'weekly' ? addWeeks(d, 1) : addWeeks(d, 4))
  const handleToday = () => setCurrentDate(new Date())

  const openAddForm = useCallback((date, time) => {
    setEditItem(null)
    setSlotDate(date || null)
    setSlotTime(time || null)
    setFormOpen(true)
  }, [])

  const openEditForm = useCallback((item) => {
    setEditItem(item)
    setSlotDate(null)
    setSlotTime(null)
    setFormOpen(true)
  }, [])

  const handleFormSubmit = async (data) => {
    if (data.id) {
      await updateSchedule(data.id, data)
    } else {
      await createSchedule(data)
    }
  }

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteSchedule(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleDayClick = (day) => {
    setSelectedDay((prev) => (prev && isSameDay(prev, day) ? null : day))
  }

  const dateLabel = useMemo(() => {
    if (viewMode === 'weekly') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = addDays(start, 5)
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
    return format(currentDate, 'MMMM yyyy')
  }, [currentDate, viewMode])

  return (
    <PageWrapper title={t('scheduler.mySchedule')}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleToday} className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                Today
              </button>
              <button onClick={handleNext} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
                <ChevronRight size={18} />
              </button>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-2">{dateLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'weekly' ? 'bg-primary text-white' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100/30'}`}
                >
                  <LayoutGrid size={14} className="inline mr-1" />{t('scheduler.weekly')}
                </button>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'monthly' ? 'bg-primary text-white' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100/30'}`}
                >
                  <CalendarDays size={14} className="inline mr-1" />{t('scheduler.monthly')}
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => {}}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                  title={t('scheduler.exportPdf')}
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => {}}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                  title="Import CSV"
                >
                  <Upload size={16} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <Skeleton variant="chart" className="h-[500px]" />
          ) : (
            <>
              {viewMode === 'weekly' ? (
                <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-3 overflow-hidden">
                  <WeeklyCalendar
                    currentDate={currentDate}
                    schedules={schedules}
                    onSlotClick={(date, time) => openAddForm(date, time)}
                    onItemClick={(item) => openEditForm(item)}
                  />
                </div>
              ) : (
                <div>
                  <MonthView
                    currentDate={currentDate}
                    schedules={schedules}
                    onDayClick={handleDayClick}
                  />
                  {selectedDay && (
                    <DayEventsPanel
                      selectedDay={selectedDay}
                      schedules={schedules}
                      onClose={() => setSelectedDay(null)}
                      onItemClick={(item) => openEditForm(item)}
                    />
                  )}
                </div>
              )}
            </>
          )}

          <button
            onClick={() => openAddForm(null, null)}
            className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary dark:bg-accent text-white dark:text-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={16} className="text-primary dark:text-accent" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Upcoming</h3>
            </div>
            <UpcomingPanel upcoming={upcoming} loading={loading} />
          </Card>
        </div>
      </div>

      <ScheduleForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditItem(null) }}
        editItem={editItem}
        selectedDate={slotDate}
        selectedTime={slotTime}
        onSubmit={handleFormSubmit}
      />

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget?.title}
      />
    </PageWrapper>
  )
}
