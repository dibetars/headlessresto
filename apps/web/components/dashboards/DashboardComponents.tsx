'use client'

import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({ label, value, icon, change, trend, color }: {
  label: string
  value: string
  icon: React.ReactNode
  change: number
  trend: 'up' | 'down'
  color: string
}) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] transition-all duration-300 border border-black/[0.04] group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
          color === 'bg-brand-orange' ? 'bg-brand-orange/10 text-brand-orange' :
          color === 'bg-blue-500' ? 'bg-blue-50 text-blue-500' :
          color === 'bg-purple-500' ? 'bg-purple-50 text-purple-500' :
          color === 'bg-emerald-500' ? 'bg-emerald-50 text-emerald-500' :
          'bg-gray-100 text-gray-500'
        )}>
          {icon}
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
          trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        )}>
          {trend === 'up' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight mb-0.5">{value}</p>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </div>
  )
}

export function PopularItem({ name, sales, price, color }: { name: string; sales: number; price: number; color: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer p-2.5 -mx-2.5 rounded-2xl hover:bg-gray-50 transition-all duration-150">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm transition-transform duration-200 group-hover:scale-105 shrink-0"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800 group-hover:text-brand-orange transition-colors leading-tight">{name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{sales} sold</div>
        </div>
      </div>
      <div className="text-sm font-bold text-gray-700 group-hover:text-brand-orange transition-colors">${price.toFixed(2)}</div>
    </div>
  )
}

// Kept for SuperAdminDashboard / KitchenDashboard / StaffDashboard compatibility
export function DashboardHeader({ title, subtitle, badge, children }: {
  title: string | React.ReactNode
  subtitle: string
  badge?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 pb-6 border-b border-gray-200/80">
      <div>
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            {badge}
          </div>
        )}
        <div className="text-2xl font-bold text-gray-900 tracking-tight normal-case font-work-sans not-italic leading-tight">{title}</div>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  )
}
