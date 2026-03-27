'use client'

import React from 'react'
import { RestaurantAdminDashboard } from '@/components/dashboards/RestaurantAdminDashboard'
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard'
import { KitchenDashboard } from '@/components/dashboards/KitchenDashboard'
import { StaffDashboard } from '@/components/dashboards/StaffDashboard'
import { useProfile } from '../profile-context'

export default function DashboardPage() {
  const { profile } = useProfile()

  if (!profile) return null

  const renderDashboard = () => {
    switch (profile.role) {
      case 'super_admin':
        return <SuperAdminDashboard />
      case 'owner':
      case 'manager':
        return <RestaurantAdminDashboard />
      case 'kitchen_staff':
        return <KitchenDashboard />
      case 'wait_staff':
      case 'cashier':
      case 'delivery_driver':
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
