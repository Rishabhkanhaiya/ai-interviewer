'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Mic, ListChecks, CreditCard,
  Share2, BookOpen, HelpCircle, Settings, LogOut,
  ChevronUp, Moon, Sun
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const NAV_ITEMS = [
  { href: '/dashboard',         label: 'Dashboard',       Icon: LayoutDashboard },
  { href: '/interview/setup',   label: 'Start Interview', Icon: Mic },
  { href: '/dashboard/history', label: 'My Sessions',     Icon: ListChecks },
  { href: '/buy',               label: 'Buy Pack',        Icon: CreditCard },
  { href: '/affiliate',         label: 'Refer & Earn',    Icon: Share2 },
  { href: '/blog',              label: 'Blog & Resources', Icon: BookOpen },
  { href: '/help',              label: 'Help & FAQ',      Icon: HelpCircle },
  { href: '/settings',          label: 'Settings',        Icon: Settings },
]

interface SidebarProps {
  onSignOut: () => void
  userName?: string
}

export function Sidebar({ onSignOut, userName }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside style={{
      width: 240,
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden', /* prevent whole sidebar scroll — inner nav scrolls */
    }}>
      {/* ── Logo — fixed 56px ── */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 26, height: 26,
          background: 'var(--color-accent)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginRight: 10,
        }}>
          <Mic size={14} color="white" strokeWidth={2} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-ink)', letterSpacing: '-0.01em' }}>
          InterviewAI
        </span>
      </div>

      {/* ── Nav — flex-1, scrollable ── */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ── Account footer — fixed 56px, NEVER overlaps nav ── */}
      <div
        ref={menuRef}
        style={{
          height: 56,
          flexShrink: 0,
          borderTop: '1px solid var(--color-border)',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Account menu popup — anchored above footer */}
        {menuOpen && (
          <div className="account-menu">
            <Link href="/settings" className="account-menu-item" onClick={() => setMenuOpen(false)}>
              <Settings size={14} strokeWidth={1.75} />
              Settings
            </Link>
            <Link href="/buy" className="account-menu-item" onClick={() => setMenuOpen(false)}>
              <CreditCard size={14} strokeWidth={1.75} />
              Buy Pack
            </Link>
            <button
              className="account-menu-item"
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark')
                setMenuOpen(false)
              }}
            >
              {theme === 'dark' ? <Sun size={14} strokeWidth={1.75} /> : <Moon size={14} strokeWidth={1.75} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button className="account-menu-item danger" onClick={() => { setMenuOpen(false); onSignOut() }}>
              <LogOut size={14} strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        )}

        {/* Trigger button */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', border: 'none', background: 'none',
            cursor: 'pointer', padding: '6px 4px',
            borderRadius: 'var(--radius-sm)',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-sunken)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          {/* Avatar */}
          <div style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: 'var(--color-accent-subtle)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
            color: 'var(--color-accent)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          {/* Name */}
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: 'var(--color-ink)',
            flex: 1, textAlign: 'left',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            {userName || 'Account'}
          </span>
          {/* Chevron */}
          <ChevronUp
            size={14}
            strokeWidth={2}
            style={{
              color: 'var(--color-text-tertiary)',
              flexShrink: 0,
              transform: menuOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform var(--transition-fast)',
            }}
          />
        </button>
      </div>
    </aside>
  )
}
