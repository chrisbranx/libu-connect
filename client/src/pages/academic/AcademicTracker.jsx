import { useEffect, useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  GraduationCap, TrendingUp, TrendingDown, BookOpen, Award,
  Plus, ChevronDown, ChevronUp, Edit3, Trash2, Download,
  BarChart3, PieChart, Calculator, ArrowUpDown,
} from 'lucide-react'
import { LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import useAcademicStore from '../../store/academicStore'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const gradeSchema = z.object({
  course: z.string().min(1, 'Course name is required').max(100),
  courseCode: z.string().min(1, 'Course code is required').max(20),
  credits: z.coerce.number().min(1, 'Credits must be at least 1').max(30),
  score: z.coerce.number().min(0, 'Score must be 0-100').max(100),
  semester: z.string().min(1, 'Semester is required'),
  year: z.coerce.number().min(2000).max(2100),
})

function getGradeLetter(score) {
  if (score >= 90) return { letter: 'A', color: 'text-success', bg: 'bg-success/10' }
  if (score >= 80) return { letter: 'B', color: 'text-primary', bg: 'bg-primary/10' }
  if (score >= 70) return { letter: 'C', color: 'text-accent', bg: 'bg-accent/10' }
  if (score >= 60) return { letter: 'D', color: 'text-warning', bg: 'bg-warning/10' }
  return { letter: 'F', color: 'text-danger', bg: 'bg-danger/10' }
}

function getGradePoints(letter, scale) {
  const map4 = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 }
  const map20 = { A: 20, B: 16, C: 12, D: 8, F: 0 }
  return scale === '4.0' ? (map4[letter] || 0) : (map20[letter] || 0)
}

function calcGPA(grades, scale) {
  if (!grades || grades.length === 0) return 0
  const totalPoints = grades.reduce((sum, g) => {
    const { letter } = getGradeLetter(g.score)
    return sum + getGradePoints(letter, scale) * g.credits
  }, 0)
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0)
  return totalCredits > 0 ? totalPoints / totalCredits : 0
}

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function SummaryCard({ icon: Icon, label, value, sub, trend, color }) {
  return (
    <motion.div variants={ITEM_VARIANTS} className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-2xl lg:text-3xl font-display font-bold ${color || 'text-gray-900 dark:text-gray-100'} truncate`}>
            {value}
          </p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${trend !== undefined ? (trend >= 0 ? 'bg-success/10' : 'bg-danger/10') : 'bg-primary/10 dark:bg-accent/10'}`}>
          {trend !== undefined ? (
            trend >= 0 ? <TrendingUp size={20} className="text-success" /> : <TrendingDown size={20} className="text-danger" />
          ) : (
            <Icon size={20} className="text-primary dark:text-accent" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

function AddGradeForm({ isOpen, onClose, editItem, onSubmit }) {
  const { t } = useTranslation()
  const isEdit = !!editItem

  const defaultValues = useMemo(() => ({
    course: editItem?.course || '',
    courseCode: editItem?.courseCode || '',
    credits: editItem?.credits || 3,
    score: editItem?.score || '',
    semester: editItem?.semester || '',
    year: editItem?.year || new Date().getFullYear(),
  }), [editItem])

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(gradeSchema),
    defaultValues,
  })

  useEffect(() => { if (isOpen) reset(defaultValues) }, [isOpen, reset, defaultValues])

  const currentScore = watch('score')
  const gradePreview = currentScore ? getGradeLetter(Number(currentScore)) : null

  const handleFormSubmit = async (data) => {
    const payload = { ...data, score: Number(data.score) }
    if (editItem) payload.id = editItem.id
    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Grade' : t('academic.addGrade')} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('academic.course')} {...register('course')} error={errors.course?.message} placeholder="e.g. Introduction to CS" />
          <Input label="Course Code" {...register('courseCode')} error={errors.courseCode?.message} placeholder="e.g. CS101" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label={t('academic.credits')} type="number" {...register('credits')} error={errors.credits?.message} />
          <Input label={t('academic.score')} type="number" {...register('score')} error={errors.score?.message} placeholder="0-100" />
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Grade</label>
            {gradePreview ? (
              <div className={`h-[38px] flex items-center gap-2 px-3 rounded-md border border-gray-200 dark:border-gray-700 ${gradePreview.bg}`}>
                <span className={`text-lg font-bold ${gradePreview.color}`}>{gradePreview.letter}</span>
                <span className="text-xs text-gray-500">{currentScore}%</span>
              </div>
            ) : (
              <div className="h-[38px] flex items-center px-3 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                Enter score
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label={t('academic.semester')} {...register('semester')} error={errors.semester?.message} placeholder="e.g. Semester 1" />
          <Input label="Year" type="number" {...register('year')} error={errors.year?.message} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose} type="button">{t('academic.cancel')}</Button>
          <Button type="submit" loading={isSubmitting} icon={Plus}>
            {isEdit ? t('common.save') : t('academic.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function GPACalculator({ allGrades, scale }) {
  const [hypotheticals, setHypotheticals] = useState([])
  const [newCourse, setNewCourse] = useState('')
  const [newCredits, setNewCredits] = useState(3)
  const [newScore, setNewScore] = useState(70)

  const currentGPA = useMemo(() => calcGPA(allGrades, scale), [allGrades, scale])

  const projectedGPA = useMemo(() => {
    const combined = [...allGrades, ...hypotheticals]
    return calcGPA(combined, scale)
  }, [allGrades, hypotheticals, scale])

  const addHypothetical = () => {
    if (!newCourse.trim()) return
    setHypotheticals([...hypotheticals, { course: newCourse, credits: newCredits, score: newScore }])
    setNewCourse('')
    setNewCredits(3)
    setNewScore(70)
  }

  const removeHypo = (idx) => {
    setHypotheticals(hypotheticals.filter((_, i) => i !== idx))
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-primary dark:text-accent" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('academic.gpaSimulator')}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
        <div>
          <p className="text-xs text-gray-500 mb-1">Current GPA</p>
          <p className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">{currentGPA.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Projected GPA</p>
          <p className={`text-2xl font-display font-bold ${projectedGPA >= currentGPA ? 'text-success' : 'text-danger'}`}>
            {projectedGPA.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className="flex-1">
          <Input label="Course" value={newCourse} onChange={(e) => setNewCourse(e.target.value)} placeholder="Hypothetical course" />
        </div>
        <div className="w-20">
          <Input label="Credits" type="number" value={newCredits} onChange={(e) => setNewCredits(Number(e.target.value))} min="1" max="30" />
        </div>
        <div className="w-20">
          <Input label="Score" type="number" value={newScore} onChange={(e) => setNewScore(Number(e.target.value))} min="0" max="100" />
        </div>
        <Button size="sm" onClick={addHypothetical} icon={Plus}>Add</Button>
      </div>

      <AnimatePresence>
        {hypotheticals.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {hypotheticals.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{h.course}</p>
                  <p className="text-xs text-gray-500">{h.credits} credits • {h.score}% ({getGradeLetter(h.score).letter})</p>
                </div>
                <button onClick={() => removeHypo(i)} className="p-1 rounded text-gray-500 hover:text-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hypotheticals.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-3">Add hypothetical grades to see how they affect your GPA</p>
      )}
    </Card>
  )
}

function GradeRow({ grade, onEdit, onDelete, scale }) {
  const { letter, color, bg } = getGradeLetter(grade.score)
  const points = getGradePoints(letter, scale)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100/20 dark:hover:bg-gray-800/20 transition-colors rounded-lg group"
    >
      <div className="min-w-0 flex-1 grid grid-cols-5 gap-2 items-center text-sm">
        <div className="col-span-2">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{grade.course}</p>
          <p className="text-xs text-gray-500">{grade.courseCode}</p>
        </div>
        <span className="text-gray-500">{grade.credits}</span>
        <span className="text-gray-500">{Math.round(grade.score)}%</span>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold ${bg} ${color}`}>
            {letter}
          </span>
          <span className="text-[11px] text-gray-500">({points.toFixed(scale === '4.0' ? 1 : 0)})</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => onEdit(grade)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <Edit3 size={14} />
        </button>
        <button onClick={() => onDelete(grade)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-danger transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}

function SemesterSection({ semester, grades, onEdit, onDelete, scale, defaultOpen }) {
  const [expanded, setExpanded] = useState(defaultOpen)
  const semesterGPA = calcGPA(grades, scale)

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-100/10 dark:hover:bg-gray-800/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-accent/10 flex items-center justify-center">
            <BookOpen size={16} className="text-primary dark:text-accent" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{semester.semester || semester.name || 'Semester'}</h4>
            <p className="text-xs text-gray-500">{grades.length} courses • {semester.year || ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-sm font-bold ${semesterGPA >= (scale === '4.0' ? 2.0 : 10) ? 'text-success' : 'text-danger'}`}>
              GPA: {semesterGPA.toFixed(2)}
            </p>
          </div>
          {expanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="divide-y divide-border/40 dark:divide-border-dark/40">
              {grades.map((grade) => (
                <GradeRow key={grade.id} grade={grade} onEdit={onEdit} onDelete={onDelete} scale={scale} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default function AcademicTracker() {
  const { t } = useTranslation()
  const { grades, summary, semesters, loading, fetchGrades, fetchSummary, fetchSemesters, addGrade, updateGrade, deleteGrade } = useAcademicStore()

  const [scale, setScale] = useState('4.0')
  const [formOpen, setFormOpen] = useState(false)
  const [editGrade, setEditGrade] = useState(null)

  useEffect(() => {
    fetchGrades()
    fetchSummary()
    fetchSemesters()
  }, [fetchGrades, fetchSummary, fetchSemesters])

  const currentGPA = useMemo(() => calcGPA(grades, scale), [grades, scale])
  const totalCredits = useMemo(() => grades.reduce((sum, g) => sum + g.credits, 0), [grades])

  const bestWorst = useMemo(() => {
    if (grades.length === 0) return { best: null, worst: null }
    const sorted = [...grades].sort((a, b) => b.score - a.score)
    return { best: sorted[0], worst: sorted[sorted.length - 1] }
  }, [grades])

  const gpaTrendData = useMemo(() => {
    if (!semesters || semesters.length === 0) {
      const grouped = {}
      grades.forEach((g) => {
        const key = g.semester || 'Unknown'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(g)
      })
      return Object.entries(grouped).map(([name, gs]) => ({
        semester: name,
        gpa: parseFloat(calcGPA(gs, scale).toFixed(2)),
      }))
    }
    return semesters.map((s) => ({
      semester: s.name || s.semester || 'Unknown',
      gpa: s.gpa || parseFloat(calcGPA(s.grades || [], scale).toFixed(2)),
    }))
  }, [semesters, grades, scale])

  const gradeDistribution = useMemo(() => {
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    grades.forEach((g) => {
      const { letter } = getGradeLetter(g.score)
      if (dist[letter] !== undefined) dist[letter]++
    })
    const total = grades.length || 1
    return Object.entries(dist).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
    }))
  }, [grades])

  const PIE_COLORS = { A: '#059669', B: '#1E1B4B', C: '#F59E0B', D: '#D97706', F: '#DC2626' }

  const groupBySemester = useMemo(() => {
    const grouped = {}
    grades.forEach((g) => {
      const key = g.semester ? `${g.semester} ${g.year || ''}`.trim() : 'Unknown'
      if (!grouped[key]) grouped[key] = { semester: key, year: g.year, grades: [] }
      grouped[key].grades.push(g)
    })
    return Object.entries(grouped).map(([key, val]) => ({
      ...val,
      id: key,
    }))
  }, [grades])

  const handleFormSubmit = async (data) => {
    if (data.id) {
      await updateGrade(data.id, data)
    } else {
      await addGrade(data)
    }
    fetchGrades()
    fetchSummary()
    fetchSemesters()
  }

  const handleDelete = async (grade) => {
    if (confirm(`Delete grade for ${grade.course}?`)) {
      await deleteGrade(grade.id)
    }
  }

  const openEdit = (grade) => {
    setEditGrade(grade)
    setFormOpen(true)
  }

  const scoreInfo = summary || {}

  return (
    <PageWrapper title={t('academic.academicTracker')}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">GPA Scale:</span>
          <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setScale('4.0')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${scale === '4.0' ? 'bg-primary text-white dark:bg-accent dark:text-black' : 'text-gray-500 hover:bg-gray-100/30'}`}
            >
              4.0
            </button>
            <button
              onClick={() => setScale('20')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${scale === '20' ? 'bg-primary text-white dark:bg-accent dark:text-black' : 'text-gray-500 hover:bg-gray-100/30'}`}
            >
              20-Point
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={() => {}}>{t('academic.exportPdf')}</Button>
          <Button size="sm" icon={Plus} onClick={() => { setEditGrade(null); setFormOpen(true) }}>{t('academic.addGrade')}</Button>
        </div>
      </div>

      {loading && grades.length === 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} variant="card" className="h-28" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton variant="chart" className="h-64" />
            <Skeleton variant="chart" className="h-64" />
          </div>
          <Skeleton variant="card" className="h-20" count={3} />
        </div>
      ) : grades.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={t('academic.noGrades')}
          description="Add your first grade to start tracking your academic performance"
          action={{ onClick: () => { setEditGrade(null); setFormOpen(true) }, icon: Plus, children: t('academic.addGrade') }}
        />
      ) : (
        <motion.div variants={CONTAINER_VARIANTS} initial="hidden" animate="visible" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={GraduationCap}
              label={t('academic.currentGpa')}
              value={currentGPA.toFixed(2)}
              sub={`/ ${scale === '4.0' ? '4.0' : '20'}`}
              trend={scoreInfo.gpaTrend || 0}
              color={currentGPA >= (scale === '4.0' ? 3.0 : 15) ? 'text-success' : currentGPA >= (scale === '4.0' ? 2.0 : 10) ? 'text-accent' : 'text-danger'}
            />
            <SummaryCard
              icon={BookOpen}
              label={t('academic.totalCredits')}
              value={totalCredits}
              sub={`Across ${grades.length} courses`}
            />
            <SummaryCard
              icon={Award}
              label={t('academic.bestCourse')}
              value={bestWorst.best?.course || '--'}
              sub={bestWorst.best ? `${Math.round(bestWorst.best.score)}% (${getGradeLetter(bestWorst.best.score).letter})` : ''}
              color="text-success"
            />
            <SummaryCard
              icon={BarChart3}
              label={t('academic.worstCourse')}
              value={bestWorst.worst?.course || '--'}
              sub={bestWorst.worst ? `${Math.round(bestWorst.worst.score)}% (${getGradeLetter(bestWorst.worst.score).letter})` : ''}
              color="text-danger"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-primary dark:text-accent" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('academic.trend')}</h3>
              </div>
              {gpaTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={gpaTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="semester" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                    <YAxis domain={[0, scale === '4.0' ? 4 : 20]} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="gpa" stroke="#1E1B4B" strokeWidth={2} dot={{ fill: '#1E1B4B', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-sm text-gray-500">
                  No semester data available
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <PieChart size={18} className="text-primary dark:text-accent" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('academic.gradeDistribution')}</h3>
              </div>
              {gradeDistribution.some((g) => g.value > 0) ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={gradeDistribution.filter((g) => g.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {gradeDistribution.filter((g) => g.value > 0).map((entry) => (
                          <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#6B6880'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-xs text-gray-900 dark:text-gray-100">{value}</span>}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-sm text-gray-500">
                  No grade data available
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('academic.semester')} Breakdown</h3>
            {groupBySemester.map((sem, idx) => (
              <SemesterSection
                key={sem.id || idx}
                semester={sem}
                grades={sem.grades}
                onEdit={openEdit}
                onDelete={handleDelete}
                scale={scale}
                defaultOpen={idx === 0}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GPACalculator allGrades={grades} scale={scale} />
          </div>
        </motion.div>
      )}

      <AddGradeForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditGrade(null) }}
        editItem={editGrade}
        onSubmit={handleFormSubmit}
      />
    </PageWrapper>
  )
}
