'use client'

import React, { useState, useEffect } from 'react'
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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-gray-400 uppercase tracking-widest animate-pulse">Loading...</p>
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
