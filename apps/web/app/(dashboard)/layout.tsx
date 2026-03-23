'use client'

import React, { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { DashboardLayout as NewDashboardLayout } from '@/components/dashboards/DashboardLayout'
import { getUserProfile } from '@/app/auth/actions'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setError(null)
      const data = await getUserProfile()

      if (!data) {
        router.push('/login')
        return
      }

      setProfile(data)
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-cream">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-brand-orange/15 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="mt-5 text-xs font-semibold text-gray-400 uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-cream p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 mb-6 border border-red-100">
          <Bell className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h1>
        <p className="text-sm text-gray-500 max-w-xs mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="h-10 px-6 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  const role = profile?.role || 'user'
  const userName = profile?.full_name || 'User'
  const restaurantName = profile?.organization?.name || 'HeadlessResto'
  const isFullScreen = pathname === '/dashboard/pos' || pathname === '/dashboard/kds'

  // Route-level protection for restricted roles
  const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
    kitchen: ['/dashboard', '/dashboard/kds', '/dashboard/settings'],
    waiter: ['/dashboard', '/dashboard/orders', '/dashboard/reservations', '/dashboard/settings'],
  }
  const allowedPaths = ROLE_ALLOWED_PATHS[role]
  if (allowedPaths) {
    const isAllowed = allowedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (!isAllowed) {
      router.replace('/dashboard')
      return null
    }
  }

  // Build enabled features map from org brand_assets (default all ON)
  const FEATURE_KEYS = ['pos', 'kds', 'orders', 'reservations', 'inventory', 'analytics', 'staff']
  const savedFeatures = profile?.organization?.brand_assets?.features || {}
  const enabledFeatures: Record<string, boolean> = Object.fromEntries(
    FEATURE_KEYS.map(k => [k, savedFeatures[k] !== false])
  )

  return (
    <NewDashboardLayout
      role={role}
      userName={userName}
      restaurantName={restaurantName}
      fullScreen={isFullScreen}
      enabledFeatures={enabledFeatures}
    >
      {children}
    </NewDashboardLayout>
  )
}
