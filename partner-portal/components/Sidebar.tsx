'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, IndianRupee, Link2, Package, Trophy, Settings, HelpCircle, LogOut, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/earnings', label: 'Earnings', icon: IndianRupee },
  { href: '/links', label: 'My Links', icon: Link2 },
  { href: '/kit', label: 'Marketing Kit', icon: Package },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ tier }: { tier?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-white border-r border-black/8 flex flex-col z-40">
      <div className="px-5 py-5 border-b border-black/8">
        <div className="font-semibold text-[#111827]">InterviewAI</div>
        <div className="text-xs text-[#4F46E5] font-medium">Partners</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium' : 'text-[#374151] hover:bg-gray-50'}`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-black/8 space-y-2">
        {tier && (
          <div className="px-3 py-2 bg-[#EEF2FF] rounded-lg">
            <div className="text-xs text-[#6B7280] mb-0.5">Your tier</div>
            <div className="text-xs font-semibold text-[#4F46E5]">{tier}</div>
          </div>
        )}
        <a
          href={process.env.NEXT_PUBLIC_MAIN_PRODUCT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:bg-gray-50 transition-colors"
        >
          <ExternalLink size={16} />
          Main product
        </a>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:bg-gray-50 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
        <a href="https://wa.me/+91" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:bg-gray-50 transition-colors">
          <HelpCircle size={16} />
          Help (WhatsApp)
        </a>
      </div>
    </aside>
  )
}
