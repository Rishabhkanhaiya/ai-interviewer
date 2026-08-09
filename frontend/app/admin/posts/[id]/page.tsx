'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'

export default function AdminPostEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('Interview Tips')
  const [status, setStatus] = useState('draft')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] outline-none focus:outline-none p-4',
      },
    },
  })

  useEffect(() => {
    if (isNew) return

    const fetchPost = async () => {
      try {
        const { data } = await apiClient.getAdminPost(id)
        setTitle(data.title)
        setSlug(data.slug)
        setExcerpt(data.excerpt || '')
        setCategory(data.category)
        setStatus(data.status)
        setCoverImageUrl(data.cover_image_url || '')
        setSeoTitle(data.seo_title || '')
        setSeoDescription(data.seo_description || '')
        if (editor) {
          editor.commands.setContent(data.content || '')
        }
      } catch (e: any) {
        setError('Failed to load post.')
      } finally {
        setLoading(false)
      }
    }

    if (editor) {
      fetchPost()
    }
  }, [id, isNew, editor])

  // Auto-generate slug from title if new
  useEffect(() => {
    if (isNew && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }, [title, isNew])

  const [uploadingCover, setUploadingCover] = useState(false)

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isCover) setUploadingCover(true)

    try {
      const res = await apiClient.uploadImage(file)
      const publicUrl = res.data.publicUrl

      if (isCover) {
        setCoverImageUrl(publicUrl)
      } else if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run()
      }
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Failed to upload image')
    } finally {
      if (isCover) setUploadingCover(false)
    }
  }

  const handleSave = async (forceStatus?: string) => {
    if (!title || !slug || !editor) {
      alert('Title, slug, and content are required')
      return
    }

    setSaving(true)
    const payload = {
      title,
      slug,
      excerpt,
      content: editor.getHTML(),
      cover_image_url: coverImageUrl,
      category,
      status: forceStatus || status,
      seo_title: seoTitle,
      seo_description: seoDescription,
    }

    try {
      if (isNew) {
        const { data } = await apiClient.createAdminPost(payload)
        router.push(`/admin/posts/${data.id}`)
      } else {
        await apiClient.updateAdminPost(id, payload)
        if (forceStatus) setStatus(forceStatus)
        alert('Saved successfully')
      }
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white/40 text-sm">Loading editor...</div>
      </div>
    )
  }

  const wordCount = editor?.getText().split(/\s+/).filter(Boolean).length || 0
  const readTime = Math.max(1, Math.round(wordCount / 200))

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          <span>›</span>
          <Link href="/admin/posts" className="hover:text-white transition-colors">Posts</Link>
          <span>›</span>
          <span className="text-white">{isNew ? 'New Post' : title || 'Untitled'}</span>
        </div>

        <div className="flex gap-8 items-start">
          {/* Main Column */}
          <div className="flex-1 space-y-6">
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-4xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-700"
            />
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">interviewai.com/blog/</span>
              <input
                type="text"
                placeholder="slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="bg-transparent border-b border-white/10 outline-none focus:border-[var(--color-accent)] text-gray-300 w-64 px-1"
              />
            </div>

            <textarea
              placeholder="Excerpt (optional) — shown on cards, target ~160 chars"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              maxLength={200}
              rows={2}
              className="w-full bg-gray-900 border border-white/10 rounded-xl p-4 text-sm text-gray-300 outline-none focus:border-[var(--color-accent)] resize-none"
            />

            <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden tiptap-editor">
              <div className="bg-gray-800 border-b border-white/10 p-2 flex flex-wrap gap-1 items-center">
                <button onClick={() => editor?.chain().focus().toggleBold().run()} className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white"><b>B</b></button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white"><i>I</i></button>
                <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white font-serif">H2</button>
                <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white font-serif">H3</button>
                <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white">• List</button>
                <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className="p-2 hover:bg-white/5 rounded text-gray-400 hover:text-white">" Quote</button>
                
                <div className="relative ml-2">
                  <input type="file" accept="image/*" onChange={e => handleUploadImage(e, false)} className="absolute inset-0 opacity-0 cursor-pointer w-full" />
                  <button className="px-3 py-1.5 bg-white/5 rounded text-xs text-gray-300 hover:bg-white/10 pointer-events-none">
                    🖼️ Insert Image
                  </button>
                </div>
              </div>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 space-y-6 flex-shrink-0 sticky top-8">
            {/* Status & Action */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Publishing</h3>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="radio" checked={status === 'draft'} onChange={() => setStatus('draft')} className="accent-[var(--color-accent)]" /> Draft
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="radio" checked={status === 'published'} onChange={() => setStatus('published')} className="accent-[var(--color-accent)]" /> Published
                </label>
              </div>

              <div className="text-xs text-gray-500 pt-2 border-t border-white/5">
                Word count: {wordCount} (~{readTime} min read)
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => handleSave(status === 'published' ? 'published' : 'draft')} 
                  disabled={saving}
                  className="w-full py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (isNew ? 'Create Post' : 'Update Post')}
                </button>
                {!isNew && (
                  <Link 
                    href={`/blog/${slug}`} 
                    target="_blank"
                    className="w-full py-2 bg-white/5 text-gray-300 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors text-center"
                  >
                    Preview Live
                  </Link>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="Interview Tips">Interview Tips</option>
                  <option value="System Design">System Design</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Company Guides">Company Guides</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Cover Image</label>
                {coverImageUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video">
                    <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button onClick={() => setCoverImageUrl('')} className="text-xs text-red-400 font-medium bg-red-400/10 px-2 py-1 rounded">Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-white/20 hover:text-gray-400 transition-colors">
                    <span className="text-sm">{uploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                    <input type="file" accept="image/*" disabled={uploadingCover} onChange={e => handleUploadImage(e, true)} className="absolute inset-0 opacity-0 cursor-pointer w-full disabled:cursor-not-allowed" />
                  </div>
                )}
              </div>
            </div>
            
            {/* SEO */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Advanced SEO</h3>
              <input
                type="text"
                placeholder="SEO Title (Optional)"
                value={seoTitle}
                onChange={e => setSeoTitle(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-sm text-gray-300 outline-none focus:border-[var(--color-accent)]"
              />
              <textarea
                placeholder="SEO Description (Optional)"
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-white/10 rounded-lg p-2 text-sm text-gray-300 outline-none focus:border-[var(--color-accent)] resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
