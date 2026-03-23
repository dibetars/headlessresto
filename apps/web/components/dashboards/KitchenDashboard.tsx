'use client'

import React, { useState } from 'react'
import { ShoppingBag, Clock, CheckCircle, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard, DashboardHeader } from './DashboardComponents'

export function KitchenDashboard() {
  const [stats] = useState({
    activeOrders: 8,
    avgPrepTime: '12m',
    itemsCompleted: 145,
    efficiency: '94%'
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
      <DashboardHeader
        title={<>Kitchen <span className="text-brand-orange">Operations</span></>}
        subtitle="Real-time prep tracking and kitchen performance."
        badge="Active Kitchen Session"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Active Tickets" value={stats.activeOrders.toString()} icon={<ShoppingBag className="w-4 h-4" />} change={12.5} trend="up" color="bg-blue-500" />
        <StatCard label="Avg. Prep Time" value={stats.avgPrepTime} icon={<Clock className="w-4 h-4" />} change={-2.4} trend="down" color="bg-brand-orange" />
        <StatCard label="Items Ready" value={stats.itemsCompleted.toString()} icon={<CheckCircle className="w-4 h-4" />} change={8.2} trend="up" color="bg-emerald-500" />
        <StatCard label="Efficiency" value={stats.efficiency} icon={<BarChart2 className="w-4 h-4" />} change={4.1} trend="up" color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-3xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
        <div className="text-base font-bold text-gray-900 mb-6 normal-case not-italic font-work-sans">Preparation Breakdown</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PrepStat label="Mains" value={65} color="blue" />
          <PrepStat label="Sides" value={45} color="emerald" />
          <PrepStat label="Desserts" value={22} color="purple" />
          <PrepStat label="Appetizers" value={13} color="orange" />
        </div>
      </div>
    </div>
  )
}

function PrepStat({ label, value, color }: { label: string; value: number; color: string }) {
  const barColorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    orange: 'bg-brand-orange'
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">{value}</span>
          <span className="text-xs text-gray-400">{Math.round((value / 150) * 100)}%</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColorMap[color] || 'bg-brand-orange')}
          style={{ width: `${(value / 150) * 100}%` }}
        />
      </div>
    </div>
  )
}
