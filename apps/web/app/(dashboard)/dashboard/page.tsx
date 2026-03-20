'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RestaurantAdminDashboard } from '@/components/dashboards/RestaurantAdminDashboard'
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard'
import { KitchenDashboard } from '@/components/dashboards/KitchenDashboard'
import { StaffDashboard } from '@/components/dashboards/StaffDashboard'
import { getUserProfile } from '@/app/auth/actions'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  role: string
  full_name: string
  restaurant_id?: string
  organization?: {
    name: string
  }
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile()
      if (!data) {
        router.push('/login')
        return
      }

      setProfile(data as any)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-black relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-momentum-gradient pointer-events-none opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/[0.03] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 border-2 border-brand-orange/10 rounded-[32px] absolute inset-0 animate-ping opacity-20" />
            <div className="w-24 h-24 border-2 border-brand-orange/20 rounded-[32px] flex items-center justify-center relative shadow-momentum-glow">
              <div className="w-12 h-12 border-4 border-brand-orange/10 rounded-full" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-brand-orange border-t-transparent rounded-[32px] animate-spin" />
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="text-[10px] font-black text-brand-orange uppercase tracking-[0.6em] animate-pulse italic">
              Terminal OS
            </div>
            <div className="text-[12px] font-black text-white/40 uppercase tracking-[0.4em] italic">
              Synchronizing System...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const renderDashboard = () => {
    switch (profile.role) {
      case 'super_admin':
        return <SuperAdminDashboard />
      case 'admin':
      case 'restaurant_admin':
      case 'owner':
      case 'manager':
        return <RestaurantAdminDashboard />
      case 'kitchen':
        return <KitchenDashboard />
      case 'waiter':
      case 'cashier':
        return <StaffDashboard />
      default:
        return <RestaurantAdminDashboard />
    }
  }

  return (
    <>
      {renderDashboard()}
    </>
  )
}
