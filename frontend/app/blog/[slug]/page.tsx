'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopBar } from '@/components/ui/TopBar'
import { CategoryBadge } from '@/components/ui/FeaturedPostCard'
import { PostCard } from '@/components/ui/PostCard'
import { NewsletterStrip } from '@/components/ui/NewsletterStrip'
import Link from 'next/link'

export default function BlogPostDetail() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { 
        router.push('/auth') 
        return 
      }
      try {
        const { apiClient } = await import('@/lib/api')
        const [profileRes, postRes] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getPostBySlug(slug)
        ])
        setUserName(profileRes.data.name || '')
        setPost(postRes.data)
      } catch (e: any) {
        if (e?.response?.status === 404) {
          setError('Post not found.')
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }





  const title = post ? post.title : ''
  const category = post ? post.category : ''

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex' }}>
      <Sidebar onSignOut={handleSignOut} userName={userName} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar breadcrumb={["Blog & Resources", title]} action={
          <Link href="/blog" className="btn-ghost" style={{ padding: '0 12px', height: 32, fontSize: 13 }}>
            ← Back to Blog
          </Link>
        } />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>Loading post...</div>
            </div>
          ) : error || !post ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>{error || 'Post not found.'}</div>
            </div>
          ) : (
            // Detail Container - max-w-720px for prose readability
            <article className="max-w-[720px] mx-auto px-6 py-12 md:py-16">
            
            {/* Header */}
            <header className="mb-10">
              <div className="mb-6">
                <CategoryBadge category={category} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] leading-tight tracking-tight mb-6">
                {title}
              </h1>
              
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-8">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center font-bold text-[var(--color-text-secondary)]">
                  {title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">
                    InterviewAI Team
                  </div>
                  <div className="flex items-center text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="mx-1.5">·</span>
                    <span className="font-mono">{post.read_time_minutes || 5} min read</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Hero Image */}
            {post.cover_image_url && (
              <div className="mb-12 aspect-[21/9] rounded-2xl overflow-hidden bg-[var(--color-surface-sunken)]">
                <img 
                  src={post.cover_image_url} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Body */}
            <div 
              className="prose prose-invert prose-p:text-[var(--color-text-secondary)] prose-p:leading-relaxed prose-headings:text-[var(--color-text-primary)] prose-a:text-[var(--color-accent)] max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[var(--color-border)]">
              {/* Author Bio */}
              <div className="flex items-center gap-4 bg-[var(--color-surface-sunken)] p-6 rounded-[var(--radius-md)] mb-12">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-indigo-600">{category === 'Interview Tips' ? 'R' : 'I'}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--color-text-primary)]">
                    {category === 'Interview Tips' ? 'Rishabh Joshi' : 'InterviewAI Team'}
                  </h4>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    Helping engineers crack product company interviews. Building InterviewAI to make high-quality practice accessible to everyone.
                  </p>
                </div>
              </div>

              {/* Newsletter */}
              <NewsletterStrip />
            </footer>
          </article>
          )}
        </main>
      </div>
    </div>
  )
}
