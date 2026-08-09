'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopBar } from '@/components/ui/TopBar'
import { FeaturedPostCard, Post } from '@/components/ui/FeaturedPostCard'
import { NewsletterStrip } from '@/components/ui/NewsletterStrip'
import Link from 'next/link'
import { Check } from 'lucide-react'

// Dummy fallback if no posts
const FALLBACK_POSTS: Post[] = [
  {
    slug: 'how-to-ace-mock-interview',
    title: 'How to Ace Your Mock Interview: A Complete Playbook',
    excerpt: 'Mock interviews are the closest you can get to the real thing. Here is how to prepare, what to expect, and how to analyze your feedback to guarantee a placement offer.',
    category: 'Interview Tips',
    date: 'Aug 1, 2026',
    readTime: '6 min read',
    author: {
      name: 'Rishabh Joshi'
    }
  }
]

const CATEGORIES = ['All', 'Interview Tips', 'System Design', 'Behavioral', 'Company Guides']

export default function BlogIndexPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  const [posts, setPosts] = useState<Post[]>([])
  
  const [showSuggest, setShowSuggest] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [suggested, setSuggested] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { 
        router.push('/auth') 
        return 
      }
      
      try {
        const { apiClient } = await import('@/lib/api')
        const profileRes = await apiClient.getProfile()
        setUserName(profileRes.data.name || '')
        
        const cat = activeCategory === 'All' ? undefined : activeCategory
        const postsRes = await apiClient.getPosts(cat)
        
        // Map backend posts to frontend Post interface
        const mapped = postsRes.data.map((p: any) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt || '',
          category: p.category,
          coverImage: p.cover_image_url || undefined,
          date: new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          readTime: `${p.read_time_minutes || 5} min read`,
          author: { name: 'InterviewAI Team' }
        }))
        setPosts(mapped)
        
      } catch (e) {
        // Handle gracefully
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, activeCategory])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const displayPosts = posts.length > 0 ? posts : FALLBACK_POSTS



  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex' }}>
      <Sidebar onSignOut={handleSignOut} userName={userName} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar breadcrumb="Blog & Resources" />

        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 64px 32px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>Loading blog...</div>
            </div>
          ) : (
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight mb-2">
                Blog & Resources
              </h1>
              <p className="text-base text-[var(--color-text-secondary)] max-w-2xl">
                Tips, guides, and playbooks for cracking your placement interviews.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`pill-tab whitespace-nowrap ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Content: If < 3 posts, stack featured cards instead of grid */}
            <div className="flex flex-col gap-6">
              {displayPosts.length > 0 ? (
                displayPosts.map((post, i) => (
                  <FeaturedPostCard key={post.slug} post={post} />
                ))
              ) : (
                <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                  No posts found for this category yet.
                </div>
              )}
            </div>

            {/* Empty State / Coming Soon */}
            {displayPosts.length < 3 && (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-t border-[var(--color-border)] mt-8">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  More guides coming soon
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-md">
                  Want a specific topic covered? Tell us what you'd like to learn next.
                </p>
                {!showSuggest && !suggested && (
                  <button onClick={() => setShowSuggest(true)} className="btn-ghost" style={{ padding: '0 16px', height: 36 }}>
                    Suggest a topic →
                  </button>
                )}
                {showSuggest && !suggested && (
                  <div className="flex gap-2 w-full max-w-sm mt-2">
                    <input 
                      type="text" 
                      value={suggestion}
                      onChange={e => setSuggestion(e.target.value)}
                      placeholder="e.g. System Design for freshers" 
                      className="ui-input flex-1" 
                    />
                    <button 
                      onClick={() => setSuggested(true)}
                      disabled={!suggestion.trim()}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Submit
                    </button>
                  </div>
                )}
                {suggested && (
                  <div className="text-sm text-[var(--color-success)] bg-[var(--color-success-subtle)] px-4 py-2 rounded-lg font-medium mt-2 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Thanks for your suggestion!
                  </div>
                )}
              </div>
            )}

            {/* Newsletter */}
            <div className="mt-8">
              <NewsletterStrip />
            </div>

          </div>
          )}
        </main>
      </div>
    </div>
  )
}
