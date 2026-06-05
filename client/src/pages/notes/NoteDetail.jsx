import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, Pin, PinOff, Trash2, Download, Share2, Edit3,
  Globe, Lock, Users, BookOpen, Tag, CalendarDays, Clock, Save,
  X, Loader2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import useNotesStore from '../../store/notesStore'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'

function TiptapToolbar({ editor }) {
  if (!editor) return null

  const btn = (active, onClick, label) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded text-xs font-medium transition-colors ${active ? 'bg-primary/10 dark:bg-primary/30 text-primary dark:text-accent' : 'text-text dark:text-text-dark hover:bg-border dark:hover:bg-border-dark'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border dark:border-border-dark bg-surface dark:bg-primary-dark/30 rounded-t-md flex-wrap">
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <span className="font-bold">B</span>)}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <span className="italic">I</span>)}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <span className="text-xs">H</span>)}
      <span className="w-px h-4 bg-border dark:bg-border-dark mx-1" />
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <span>•</span>)}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <span>1.</span>)}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <span className="text-xs">"</span>)}
      {btn(editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run(), <span className="text-xs font-mono">{'{ }'}</span>)}
    </div>
  )
}

export default function NoteDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedNote, loading, fetchNote, updateNote, deleteNote, togglePin } = useNotesStore()

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    editable: editing,
    editorProps: {
      attributes: { class: 'tiptap' },
    },
  })

  useEffect(() => {
    if (id) fetchNote(id)
  }, [id, fetchNote])

  useEffect(() => {
    if (selectedNote && editor) {
      editor.commands.setContent(selectedNote.content || '')
      setEditTitle(selectedNote.title || '')
    }
  }, [selectedNote, editor])

  const handleTogglePin = async () => {
    if (selectedNote) {
      await togglePin(selectedNote.id)
      await fetchNote(id)
    }
  }

  const handleDelete = async () => {
    if (selectedNote && confirm('Delete this note permanently?')) {
      await deleteNote(selectedNote.id)
      navigate('/notes')
    }
  }

  const handleSave = async () => {
    if (!selectedNote) return
    setSaving(true)
    const content = editor?.getHTML() || ''
    await updateNote(selectedNote.id, { title: editTitle || 'Untitled', content })
    setSaving(false)
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    if (selectedNote && editor) {
      editor.commands.setContent(selectedNote.content || '')
      setEditTitle(selectedNote.title || '')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: selectedNote?.title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleDownloadPdf = () => {
    window.print()
  }

  const visibilityIcons = {
    private: { icon: Lock, label: t('notes.private'), className: 'text-danger' },
    course: { icon: Users, label: t('notes.course'), className: 'text-primary' },
    public: { icon: Globe, label: t('notes.public'), className: 'text-success' },
  }

  const vis = selectedNote ? (visibilityIcons[selectedNote.visibility] || visibilityIcons.private) : null
  const createdDate = selectedNote?.createdAt ? format(parseISO(selectedNote.createdAt), 'MMMM d, yyyy') : ''
  const updatedDate = selectedNote?.updatedAt ? format(parseISO(selectedNote.updatedAt), 'MMMM d, yyyy HH:mm') : ''

  if (loading || !selectedNote) {
    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton variant="text" className="h-8 w-24" />
          <Skeleton variant="text" className="h-10 w-2/3" />
          <Skeleton variant="text" className="h-4 w-1/3" />
          <Skeleton variant="chart" className="h-64" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text dark:hover:text-text-dark transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Notes
        </button>

        <div className="bg-white dark:bg-primary-dark rounded-md border border-border dark:border-border-dark shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              {editing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-xl lg:text-2xl font-display font-bold bg-transparent border-b-2 border-primary dark:border-accent text-text dark:text-text-dark focus:outline-none pb-1"
                  autoFocus
                />
              ) : (
                <h1 className="text-xl lg:text-2xl font-display font-bold text-text dark:text-text-dark">
                  {selectedNote.title || 'Untitled'}
                </h1>
              )}

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleTogglePin}
                  className="p-2 rounded-md hover:bg-border dark:hover:bg-border-dark text-muted transition-colors"
                  title={selectedNote.pinned ? t('notes.unpinNote') : t('notes.pinNote')}
                >
                  {selectedNote.pinned ? <PinOff size={16} className="text-accent" /> : <Pin size={16} />}
                </button>
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-2 rounded-md hover:bg-border dark:hover:bg-border-dark text-success transition-colors"
                      title="Save"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded-md hover:bg-border dark:hover:bg-border-dark text-muted transition-colors"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 rounded-md hover:bg-border dark:hover:bg-border-dark text-muted transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {selectedNote.course && <Badge variant="info">{selectedNote.course}</Badge>}
              {vis && (
                <Badge variant={selectedNote.visibility === 'public' ? 'success' : selectedNote.visibility === 'course' ? 'info' : 'default'}>
                  <vis.icon size={12} className="inline mr-1" />
                  {vis.label}
                </Badge>
              )}
              {(selectedNote.tags || []).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-border/50 dark:bg-border-dark/50 text-muted">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} />
                {createdDate}
              </span>
              {updatedDate && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Updated {updatedDate}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-border dark:border-border-dark">
            {editing ? (
              <div>
                <TiptapToolbar editor={editor} />
                <EditorContent editor={editor} className="min-h-[300px]" />
              </div>
            ) : (
              <div
                className="tiptap px-6 py-4"
                dangerouslySetInnerHTML={{ __html: selectedNote.content || '<p class="text-muted">No content</p>' }}
              />
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border dark:border-border-dark no-print">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={Download} onClick={handleDownloadPdf}>
                {t('notes.downloadPdf')}
              </Button>
              <Button variant="ghost" size="sm" icon={Share2} onClick={handleShare}>
                Share
              </Button>
            </div>
            <Button variant="ghost" size="sm" icon={Trash2} onClick={handleDelete} className="text-danger hover:text-danger">
              {t('notes.delete')}
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
