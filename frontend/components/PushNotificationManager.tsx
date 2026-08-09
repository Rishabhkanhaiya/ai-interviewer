'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  // Default to true to prevent hydration mismatch/flicker
  const [isDismissed, setIsDismissed] = useState(true) 
  
  useEffect(() => {
    // Only run on client and if service workers/push managers are supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorkerAndCheckSubscription()
      
      if ('Notification' in window) {
        const dismissedInStorage = localStorage.getItem('push_prompt_dismissed')
        if (Notification.permission === 'default' && !dismissedInStorage) {
          setIsDismissed(false)
        }
      }
    }
  }, [])

  const registerServiceWorkerAndCheckSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        setIsSubscribed(true)
      }
    } catch (err) {
      console.error('Service worker registration failed:', err)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribeToPush = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Notification permission denied.')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      if (!vapidPublicKey) {
        console.warn('VAPID public key not found in environment variables.')
        return
      }
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })

      // Send subscription to backend
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const subJSON = subscription.toJSON()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          p256dh: subJSON.keys?.p256dh,
          auth: subJSON.keys?.auth
        })
      })

      if (response.ok) {
        setIsSubscribed(true)
        console.log('Successfully subscribed to push notifications.')
      }
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err)
    } finally {
      localStorage.setItem('push_prompt_dismissed', 'true')
      setIsDismissed(true)
    }
  }

  if (isSubscribed || isDismissed) return null

  return (
    <div id="toast-region">
      <div className="toast-item" style={{ maxWidth: 320, flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Never miss a drive!
          </p>
          <button
            onClick={() => {
              localStorage.setItem('push_prompt_dismissed', 'true')
              setIsDismissed(true)
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, flexShrink: 0 }}
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
          Enable push notifications for placement drive alerts.
        </p>
        <button
          onClick={subscribeToPush}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Enable notifications
        </button>
      </div>
    </div>
  )
}
