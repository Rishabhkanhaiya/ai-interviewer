'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  
  useEffect(() => {
    // Only run on client and if service workers/push managers are supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorkerAndCheckSubscription()
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
    }
  }

  // We only want to show this prompt after their first session ideally, but for now we can render a simple non-intrusive prompt
  const [isDismissed, setIsDismissed] = useState(false)

  // We only want to show this prompt after their first session ideally, but for now we can render a simple non-intrusive prompt
  if (isSubscribed || isDismissed) return null

  return (
    <div className="fixed bottom-6 right-6 bg-white p-4 rounded-xl shadow-2xl border border-black/5 z-50 flex items-start gap-4 animate-in slide-in-from-bottom-5">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">Never miss a drive!</p>
        <p className="text-xs text-gray-500 mt-1">Enable push notifications for drive alerts.</p>
        <button 
          onClick={subscribeToPush}
          className="mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full"
        >
          Enable notifications
        </button>
      </div>
      <button 
        onClick={() => setIsDismissed(true)}
        className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  )
}
