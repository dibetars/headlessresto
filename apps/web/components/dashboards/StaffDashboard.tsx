'use client'

import React, { useState } from 'react'
import { ShoppingBag, Clock, TrendingUp, Star, CheckCircle } from 'lucide-react'
import { StatCard, DashboardHeader } from './DashboardComponents'

export function StaffDashboard() {
  const [stats] = useState({
    myOrders: 12,
    avgServiceTime: '18m',
    tipsEarned: '$45.00',
    rating: 4.8
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
      <DashboardHeader
        title={<>Service <span className="text-brand-orange">Insights</span></>}
        subtitle="Personal performance and activity metrics."
        badge="Active Service Session"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Orders Handled" value={stats.myOrders.toString()} icon={<ShoppingBag className="w-4 h-4" />} change={12.5} trend="up" color="bg-brand-orange" />
        <StatCard label="Avg. Service Time" value={stats.avgServiceTime} icon={<Clock className="w-4 h-4" />} change={-2.4} trend="down" color="bg-blue-500" />
        <StatCard label="Tips Earned" value={stats.tipsEarned} icon={<TrendingUp className="w-4 h-4" />} change={8.2} trend="up" color="bg-emerald-500" />
        <StatCard label="Service Rating" value={stats.rating.toString()} icon={<Star className="w-4 h-4" />} change={4.1} trend="up" color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-3xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
        <div className="text-base font-bold text-gray-900 mb-5 normal-case not-italic font-work-sans">Recent Activity</div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-orange-50/60 hover:border-brand-orange/20 border border-gray-100 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-all duration-200">
                  <CheckCircle className="w-5 h-5 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 group-hover:text-brand-orange transition-colors">Order #{i} Completed</div>
                  <div className="text-xs text-gray-400 mt-0.5">Dine-in · Table 0{i}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-gray-900">$45.50</div>
                <div className="text-xs text-gray-400 mt-0.5">15 mins ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
