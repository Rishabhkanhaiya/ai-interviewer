'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

interface Post {
  id: string
  slug: string
  title: string
  category: string
  status: string
  updated_at: string
}

export default function AdminPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { 
        router.push('/auth')
        return 
      }
      try {
        const { data } = await apiClient.getAdminPosts()
        setPosts(data as Post[])
      } catch (e: any) {
        if (e?.response?.status === 403) {
          router.push('/dashboard')
        } else {
          setError('Failed to load posts.')
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await apiClient.deleteAdminPost(id)
      setPosts(posts.filter(p => p.id !== id))
    } catch (e) {
      alert('Failed to delete post.')
    }
  }

  const categories = ['All', 'Interview Tips', 'System Design', 'Behavioral', 'Company Guides']
  
  const filteredPosts = posts.filter(p => {
    if (filter !== 'All' && p.category !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white/40 text-sm">Loading posts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
              <span>›</span>
              <span className="text-white">Posts</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Blog CMS</h1>
          </div>
          <Link 
            href="/admin/posts/new"
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            + New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === c 
                    ? 'bg-[var(--color-accent)] text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="Search posts..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-white/10 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        {/* Posts Table */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No posts found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-400">
                  <th className="px-6 py-4 font-medium">Post</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Last Updated</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">{post.title}</span>
                        <span className="text-xs text-gray-500 mt-1">{post.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.status === 'published' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Published
                        </span>
                      ) : post.status === 'scheduled' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Scheduled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-400 border border-white/10">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(post.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link 
                        href={`/admin/posts/${post.id}`} 
                        className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="text-xs font-medium text-gray-400 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
