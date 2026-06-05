import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Search, Plus, Pin, PinOff, Grid3x3, List, Globe, Lock, Users,
  Tag, BookOpen, CalendarDays, FileText, MoreHorizontal, Trash2,
  Download, Share2, Eye, EyeOff, Paperclip, X, Edit3,
} from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { format, parseISO } from 'date-fns'
import useNotesStore from '../../store/notesStore'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  course: z.string().max(80).optional().default(''),
  tags: z.string().optional().default(''),
  visibility: z.enum(['private', 'course', 'public']),
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function TiptapToolbar({ editor }) {
  if (!editor) return null

  const btn = (active, onClick, label) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded text-xs font-medium transition-colors ${active ? 'bg-primary/10 dark:bg-primary/30 text-primary dark:text-accent' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      title={label}
    >
      {label === 'B' && <span className="font-bold">B</span>}
      {label === 'I' && <span className="italic">I</span>}
      {label === 'H' && <span className="text-xs">H</span>}
      {label === 'UL' && <span>•</span>}
      {label === 'OL' && <span>1.</span>}
      {label === 'Q' && <span className="text-xs">"</span>}
      {label === 'Code' && <span className="text-xs font-mono">{'{ }'}</span>}
    </button>
  )

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 rounded-t-md flex-wrap">
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'I')}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H')}
      <span className="w-px h-4 bg-gray-100 dark:bg-gray-100-dark mx-1" />
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'UL')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'OL')}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Q')}
      {btn(editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run(), 'Code')}
    </div>
  )
}

function CreateNoteModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { createNote } = useNotesStore()
  const [file, setFile] = useState(null)
  const [editorReady, setEditorReady] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your note...' }),
    ],
    onCreate: () => setEditorReady(true),
    editorProps: {
      attributes: { class: 'tiptap' },
    },
  })

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', course: '', tags: '', visibility: 'private' },
  })

  useEffect(() => {
    if (isOpen) {
      reset()
      editor?.commands.setContent('')
      setFile(null)
    }
  }, [isOpen, reset, editor])

  const onSubmit = async (data) => {
    const content = editor?.getHTML() || ''
    const tagsArray = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    const payload = {
      ...data,
      tags: tagsArray,
      content,
      file: file || null,
    }
    await createNote(payload)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('notes.addNote')} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label={t('notes.title')} {...register('title')} error={errors.title?.message} placeholder="Note title" />

        <div className="grid grid-cols-2 gap-4">
          <Input label={t('notes.course')} {...register('course')} icon={BookOpen} placeholder="e.g. CS 101" />
          <Input label={t('notes.tags')} {...register('tags')} icon={Tag} placeholder="tag1, tag2, tag3" />
        </div>

        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <Select
              label="Visibility"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'private', label: 'Private - Only me' },
                { value: 'course', label: 'Course - Shared with course' },
                { value: 'public', label: 'Public - Everyone' },
              ]}
            />
          )}
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{t('notes.content')}</label>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} className="min-h-[250px]" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
            <Paperclip size={14} />
            <span>{t('notes.attachFile')}</span>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
          </label>
          {file && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-md">
              <FileText size={14} />
              {file.name}
              <button type="button" onClick={() => setFile(null)} className="ml-auto text-danger hover:text-danger/70">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose} type="button">{t('notes.cancel')}</Button>
          <Button type="submit" loading={isSubmitting} icon={Plus}>{t('notes.save')}</Button>
        </div>
      </form>
    </Modal>
  )
}

function NoteCard({ note, viewMode, onPin, onDelete }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const excerpt = useMemo(() => {
    if (!note.content) return ''
    const text = note.content.replace(/<[^>]*>/g, '')
    return text.length > 150 ? text.slice(0, 150) + '...' : text
  }, [note.content])

  const tags = note.tags || []
  const createdDate = note.createdAt ? format(parseISO(note.createdAt), 'MMM d, yyyy') : ''

  const visibilityIcons = {
    private: { icon: Lock, label: t('notes.private'), className: 'text-danger' },
    course: { icon: Users, label: t('notes.course'), className: 'text-primary' },
    public: { icon: Globe, label: t('notes.public'), className: 'text-success' },
  }

  const vis = visibilityIcons[note.visibility] || visibilityIcons.private

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-primary/20 dark:hover:border-accent/20 transition-all cursor-pointer group"
        onClick={() => navigate(`/notes/${note.id}`)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{note.title || 'Untitled'}</h4>
            {note.pinned && <Pin size={12} className="text-accent fill-accent" />}
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{excerpt}</p>
          <div className="flex items-center gap-2 mt-2">
            {note.course && <Badge variant="info">{note.course}</Badge>}
            <vis.icon size={12} className={vis.className} />
            <span className="text-[10px] text-gray-500">{createdDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onPin(note) }} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            {note.pinned ? <PinOff size={14} className="text-accent" /> : <Pin size={14} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note) }} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-danger transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3 }}
      className="group relative bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onClick={() => navigate(`/notes/${note.id}`)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 flex-1">
            {note.title || 'Untitled'}
          </h4>
          {note.pinned && <Pin size={14} className="text-accent fill-accent shrink-0 mt-0.5" />}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">{excerpt || 'No content'}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100/50 dark:bg-gray-100-dark/50 text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          {note.course && <Badge variant="info">{note.course}</Badge>}
          <vis.icon size={12} className={vis.className} />
          <span>{createdDate}</span>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onPin(note) }}
          className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 hover:text-accent transition-colors"
        >
          {note.pinned ? <PinOff size={12} /> : <Pin size={12} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note) }}
          className="p-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 hover:text-danger transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  )
}

function NoteSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-1/3" />
              <Skeleton variant="text" className="h-3 w-2/3" />
              <Skeleton variant="text" className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="p-4 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
          <Skeleton variant="text" className="h-5 w-3/4" />
          <Skeleton variant="text" className="h-3 w-full" count={3} />
          <div className="flex gap-2">
            <Skeleton variant="text" className="h-4 w-16 rounded-full" />
            <Skeleton variant="text" className="h-4 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Notes() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notes, loading, fetchNotes, togglePin, deleteNote } = useNotesStore()

  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const allTags = useMemo(() => {
    const tagSet = new Set()
    notes.forEach((n) => (n.tags || []).forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [notes])

  const allCourses = useMemo(() => {
    const courseSet = new Set()
    notes.forEach((n) => { if (n.course) courseSet.add(n.course) })
    return Array.from(courseSet).sort()
  }, [notes])

  const filteredNotes = useMemo(() => {
    let result = [...notes]

    if (activeFilter === 'pinned') result = result.filter((n) => n.pinned)
    else if (activeFilter === 'shared') result = result.filter((n) => n.visibility && n.visibility !== 'private')

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').replace(/<[^>]*>/g, '').toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q))
      )
    }

    if (courseFilter) result = result.filter((n) => n.course === courseFilter)
    if (tagFilter) result = result.filter((n) => (n.tags || []).includes(tagFilter))
    if (visibilityFilter) result = result.filter((n) => n.visibility === visibilityFilter)

    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [notes, activeFilter, searchQuery, courseFilter, tagFilter, visibilityFilter])

  const handlePin = async (note) => {
    await togglePin(note.id)
  }

  const handleDelete = async (note) => {
    if (confirm('Delete this note?')) {
      await deleteNote(note.id)
    }
  }

  return (
    <PageWrapper title={t('notes.myNotes')}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('notes.search')}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100/30'}`}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100/30'}`}
            >
              <List size={16} />
            </button>
          </div>

          <Button onClick={() => setFormOpen(true)} icon={Plus}>{t('notes.addNote')}</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: t('notes.allNotes') },
          { key: 'pinned', label: t('notes.pinned') },
          { key: 'shared', label: t('notes.shared') },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-primary text-white dark:bg-accent dark:text-black'
                : 'text-gray-500 hover:bg-gray-100/30 dark:hover:bg-gray-800/30'
            }`}
          >
            {f.label}
          </button>
        ))}

        <span className="w-px h-5 bg-gray-100 dark:bg-gray-100-dark mx-2" />

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
        >
          <option value="">All Courses</option>
          {allCourses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
        >
          <option value="">All Tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
        >
          <option value="">All Visibility</option>
          <option value="private">Private</option>
          <option value="course">Course</option>
          <option value="public">Public</option>
        </select>
      </div>

      {loading ? (
        <NoteSkeleton viewMode={viewMode} />
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={notes.length === 0 ? t('notes.noNotes') : 'No matching notes'}
          description={notes.length === 0 ? 'Create your first note to get started' : 'Try adjusting your filters'}
          action={notes.length === 0 ? { onClick: () => setFormOpen(true), icon: Plus, children: t('notes.addNote') } : undefined}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-2'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                viewMode={viewMode}
                onPin={handlePin}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <CreateNoteModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </PageWrapper>
  )
}
