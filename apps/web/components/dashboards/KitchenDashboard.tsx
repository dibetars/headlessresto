'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart2
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { StatCard, DashboardHeader } from './DashboardComponents'

export function KitchenDashboard() {
  const [stats, setStats] = useState({
    activeOrders: 8,
    avgPrepTime: '12m',
    itemsCompleted: 145,
    efficiency: '94%'
  })

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      {/* Header Info */}
      <DashboardHeader 
        title={<>Kitchen <span className="text-brand-orange">Operations</span></>}
        subtitle="Real-time performance feed and prep tracking."
        badge="Active Kitchen Session"
      />

      {/* Kitchen Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard 
          label="Active Tickets" 
          value={stats.activeOrders.toString()} 
          icon={<ShoppingBag className="w-5 h-5" />}
          change={12.5}
          trend="up"
          color="bg-blue-500"
        />
        <StatCard 
          label="Avg. Prep Time" 
          value={stats.avgPrepTime} 
          icon={<Clock className="w-5 h-5" />}
          change={-2.4}
          trend="down"
          color="bg-brand-orange"
        />
        <StatCard 
          label="Items Ready" 
          value={stats.itemsCompleted.toString()} 
          icon={<CheckCircle className="w-5 h-5" />}
          change={8.2}
          trend="up"
          color="bg-emerald-500"
        />
        <StatCard 
          label="Efficiency" 
          value={stats.efficiency} 
          icon={<BarChart2 className="w-5 h-5" />}
          change={4.1}
          trend="up"
          color="bg-purple-500"
        />
      </div>

      {/* Preparation Stats */}
      <div className="bg-white/[0.01] rounded-[48px] p-10 shadow-2xl border border-white/[0.03] group overflow-hidden relative transition-all duration-700 hover:bg-white/[0.02] hover:border-white/[0.06]">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-orange/[0.02] rounded-full blur-[100px]" />
        <h3 className="text-2xl font-black tracking-tighter mb-10 text-white uppercase italic leading-none relative z-10">Preparation Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <PrepStat label="Mains" value={65} color="blue" />
          <PrepStat label="Sides" value={45} color="emerald" />
          <PrepStat label="Desserts" value={22} color="purple" />
          <PrepStat label="Appetizers" value={13} color="orange" />
        </div>
      </div>
    </div>
  )
}

function PrepStat({ label, value, color }: { label: string, value: number, color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    emerald: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    purple: 'bg-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    orange: 'bg-brand-orange shadow-[0_0_15px_rgba(245,124,0,0.3)]'
  }

  return (
    <div className="space-y-5 group/stat">
      <div className="flex justify-between items-end px-1">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic group-hover/stat:text-white/40 transition-colors">{label}</span>
          <div className="text-2xl font-black tracking-tighter text-white mt-1 uppercase italic leading-none group-hover/stat:text-brand-orange transition-colors">{value} items</div>
        </div>
        <div className="text-right">
          <span className="text-xl font-black tracking-tighter text-white italic">{Math.round((value / 150) * 100)}%</span>
        </div>
      </div>
      <div className="h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.03] relative shadow-inner">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out relative", colorMap[color] || 'bg-brand-orange')} 
          style={{ width: `${(value / 150) * 100}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  )
}
