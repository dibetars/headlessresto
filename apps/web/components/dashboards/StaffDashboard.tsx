'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { StatCard, DashboardHeader } from './DashboardComponents'

export function StaffDashboard() {
  const [stats, setStats] = useState({
    myOrders: 12,
    avgServiceTime: '18m',
    tipsEarned: '$45.00',
    rating: 4.8
  })

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      {/* Header Info */}
      <DashboardHeader 
        title={<>Service <span className="text-brand-orange">Insights</span></>}
        subtitle="Personal performance feed and activity metrics."
        badge="Active Service Session"
      />

      {/* Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard 
          label="Orders Handled" 
          value={stats.myOrders.toString()} 
          icon={<ShoppingBag className="w-5 h-5" />}
          change={12.5}
          trend="up"
          color="bg-brand-orange"
        />
        <StatCard 
          label="Avg. Service" 
          value={stats.avgServiceTime} 
          icon={<Clock className="w-5 h-5" />}
          change={-2.4}
          trend="down"
          color="bg-blue-500"
        />
        <StatCard 
          label="Tips Earned" 
          value={stats.tipsEarned} 
          icon={<TrendingUp className="w-5 h-5" />}
          change={8.2}
          trend="up"
          color="bg-emerald-500"
        />
        <StatCard 
          label="Service Rating" 
          value={stats.rating.toString()} 
          icon={<Star className="w-5 h-5" />}
          change={4.1}
          trend="up"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white/[0.01] rounded-[48px] p-10 shadow-2xl border border-white/[0.03] group overflow-hidden relative transition-all duration-700 hover:bg-white/[0.02] hover:border-white/[0.06]">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-orange/[0.02] rounded-full blur-[100px]" />
        <h3 className="text-2xl font-black tracking-tighter mb-10 text-white uppercase italic leading-none relative z-10">Recent Activity</h3>
        <div className="space-y-6 relative z-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-8 rounded-[32px] bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-brand-orange/20 transition-all duration-500 group/item cursor-pointer italic">
              <div className="flex items-center space-x-8">
                <div className="w-16 h-16 bg-white/[0.02] rounded-2xl flex items-center justify-center shadow-2xl border border-white/[0.05] transition-all duration-700 group-hover/item:scale-110 group-hover/item:-rotate-3 group-hover/item:bg-brand-orange group-hover/item:text-black">
                  <CheckCircle className="w-8 h-8 text-emerald-500 group-hover/item:text-black transition-colors" />
                </div>
                <div>
                  <div className="text-xl font-black tracking-tighter text-white group-hover/item:text-brand-orange transition-colors uppercase">Order #{i} Completed</div>
                  <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mt-2 italic group-hover/item:text-white/40 transition-colors">Dine-in • Table 0{i}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none"><span className="text-brand-orange mr-1">$</span>45.50</div>
                <div className="text-[9px] text-white/10 font-black uppercase tracking-[0.4em] mt-3 italic">15 mins ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
