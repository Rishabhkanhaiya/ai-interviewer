'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import { Copy, CheckCheck, Plus } from 'lucide-react'

interface SubLink { id: string; source_name: string; clicks: number; conversions: number; full_url: string }

export default function LinksPage() {
  const [links, setLinks] = useState<SubLink[]>([])
  const [code, setCode] = useState('')
  const [newSource, setNewSource] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.getLinks().then(d => { setLinks(d.links || []); setCode(d.code || '') })
  }, [])

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const createLink = async () => {
    if (!newSource.trim()) return
    setCreating(true)
    const link = await api.createLink(newSource.trim())
    setLinks(l => [...l, link])
    setNewSource('')
    setCreating(false)
  }

  const rate = (l: SubLink) => l.clicks > 0 ? `${((l.conversions / l.clicks) * 100).toFixed(1)}%` : '—'

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="ml-[220px] p-8">
        <h1 className="text-2xl font-semibold text-[#111827] mb-2">My Links</h1>
        <p className="text-sm text-[#6B7280] mb-8">Create separate links for each platform. See which one converts best.</p>

        {/* Create new link */}
        <div className="bg-white border border-black/8 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-[#111827] mb-4">Create custom link</h2>
          <div className="flex gap-3">
            <input
              value={newSource}
              onChange={e => setNewSource(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createLink()}
              placeholder="e.g. telegram, facebook, college-group"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4F46E5] transition"
            />
            <button onClick={createLink} disabled={creating} className="flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-[#4338CA] transition disabled:opacity-50">
              <Plus size={14} /> Create link
            </button>
          </div>
          {code && <p className="text-xs text-[#9CA3AF] mt-2">Preview: {process.env.NEXT_PUBLIC_MAIN_PRODUCT_URL}/?ref={code}&src={newSource || 'channel'}</p>}
        </div>

        {/* Links table */}
        <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-black/8">
                {['Channel', 'Link', 'Clicks', 'Conversions', 'Rate', ''].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.map(l => (
                <tr key={l.id} className="border-b border-black/8 last:border-0 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-medium text-[#111827] capitalize">{l.source_name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#6B7280] max-w-[220px] truncate">{l.full_url}</td>
                  <td className="px-6 py-4 text-[#374151]">{l.clicks}</td>
                  <td className="px-6 py-4 text-[#374151]">{l.conversions}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold ${parseFloat(rate(l)) > 5 ? 'text-[#10B981]' : 'text-[#374151]'}`}>{rate(l)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => copy(l.full_url, l.id)} className="flex items-center gap-1 text-xs text-[#4F46E5] hover:underline">
                      {copied === l.id ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-[#9CA3AF]">No links yet. Create your first one above!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
