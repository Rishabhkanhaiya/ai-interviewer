'use client'

import { Bell, Check, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  /** e.g. "Dashboard" or ["My Sessions", "Wipro NLTH"] */
  breadcrumb: string | string[]
  action?: React.ReactNode
}

interface AppNotification {
  id: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export function TopBar({ breadcrumb, action }: TopBarProps) {
  const parts = Array.isArray(breadcrumb) ? breadcrumb : [breadcrumb]
  const router = useRouter()

  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch notifications
    apiClient.getInAppNotifications().then(({ data }) => {
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    }).catch(err => console.error('Failed to load notifications:', err))

    // Click outside to close
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (n: AppNotification) => {
    if (!n.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif))
      try {
        await apiClient.markNotificationRead(n.id)
      } catch (e) {
        console.error("Failed to mark read", e)
      }
    }
    setShowNotifs(false)
    if (n.link) {
      router.push(n.link)
    }
  }

  return (
    <div className="topbar">
      {/* Left: breadcrumb */}
      <div className="topbar-breadcrumb" aria-label="Breadcrumb">
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && (
              <span style={{ margin: '0 6px', color: 'var(--color-text-tertiary)' }}>›</span>
            )}
            {i === parts.length - 1
              ? <strong>{part}</strong>
              : <span>{part}</span>
            }
          </span>
        ))}
      </div>

      {/* Right: actions + notification bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }} ref={dropdownRef}>
        {action}
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          aria-label="Notifications"
          style={{
            position: 'relative',
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            background: showNotifs ? 'var(--color-surface-sunken)' : 'none',
            cursor: 'pointer',
            color: showNotifs ? 'var(--color-ink)' : 'var(--color-text-secondary)',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
          }}
          onMouseEnter={e => {
            if (!showNotifs) {
              e.currentTarget.style.background = 'var(--color-surface-sunken)'
              e.currentTarget.style.color = 'var(--color-ink)'
            }
          }}
          onMouseLeave={e => {
            if (!showNotifs) {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }
          }}
        >
          <Bell size={16} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: 'white',
              fontSize: '10px', fontWeight: 'bold',
              height: 16, minWidth: 16, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div style={{
            position: 'absolute',
            top: '100%', right: 0,
            marginTop: 8,
            width: 320,
            maxHeight: 400,
            overflowY: 'auto',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            zIndex: 100,
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Notifications
              {unreadCount > 0 && <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 'normal' }}>{unreadCount} unread</span>}
            </div>
            
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                You have no notifications right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.map(n => (
                  <button 
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      background: n.is_read ? 'transparent' : 'var(--color-surface-sunken)',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-sunken)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'var(--color-surface-sunken)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{n.title}</strong>
                      {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: 4, background: '#6366f1', flexShrink: 0, marginTop: 4 }} />}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{n.message}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
