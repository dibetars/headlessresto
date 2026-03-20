'use client'

import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({ label, value, icon, change, trend, color }: { 
  label: string, 
  value: string, 
  icon: React.ReactNode, 
  change: number, 
  trend: 'up' | 'down',
  color: string
}) {
  return (
    <div className="bg-white/[0.01] rounded-[40px] p-8 shadow-2xl border border-white/[0.03] hover:bg-white/[0.02] hover:border-white/[0.06] transition-all duration-700 group relative overflow-hidden">
      {/* Ambient background glow */}
      <div className={cn(
        "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl transition-all duration-1000",
        color === 'bg-brand-orange' ? "bg-brand-orange/[0.03] group-hover:bg-brand-orange/[0.08]" :
        color === 'bg-emerald-500' ? "bg-emerald-500/[0.03] group-hover:bg-emerald-500/[0.08]" :
        color === 'bg-blue-500' ? "bg-blue-500/[0.03] group-hover:bg-blue-500/[0.08]" :
        "bg-white/[0.03] group-hover:bg-white/[0.06]"
      )} />
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className={cn("w-14 h-14 rounded-[18px] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-[8deg] relative overflow-hidden", 
          color === 'bg-brand-orange' ? "bg-brand-orange text-black shadow-brand-orange/20" : 
          color === 'bg-emerald-500' ? "bg-emerald-500 text-white shadow-emerald-500/20" : 
          color === 'bg-blue-500' ? "bg-blue-500 text-white shadow-blue-500/20" : 
          color === 'bg-purple-500' ? "bg-purple-500 text-white shadow-purple-500/20" :
          "bg-white/[0.03] text-white shadow-white/5 border border-white/[0.05]"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
          <span className="relative z-10">{icon}</span>
        </div>
        <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full italic backdrop-blur-md border border-white/[0.05] transition-all duration-500", 
          trend === 'up' ? "text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20" : "text-rose-400 bg-rose-500/10 group-hover:bg-rose-500/20"
        )}>
          {trend === 'up' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="space-y-2 relative z-10">
        <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic group-hover:text-white/40 transition-colors">{label}</h4>
        <div className="flex items-end gap-3">
          <p className="text-4xl font-black tracking-tighter text-white italic leading-none group-hover:text-brand-orange transition-colors">{value}</p>
          <div className="flex gap-1 h-3 mb-1 items-end">
            {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
              <div 
                key={i} 
                className={cn("w-1 rounded-full transition-all duration-700 group-hover:bg-brand-orange", 
                  trend === 'up' ? "bg-emerald-500/20" : "bg-rose-500/20"
                )} 
                style={{ height: `${h * 100}%` }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PopularItem({ name, sales, price, color }: { name: string, sales: number, price: number, color: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer p-4 -mx-4 rounded-[24px] hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all duration-500 italic relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-14 h-14 rounded-[18px] flex items-center justify-center text-black font-black text-xl shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-[10deg] tracking-tighter relative overflow-hidden" style={{ backgroundColor: color }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50" />
          <span className="relative z-10">{name.charAt(0)}</span>
        </div>
        <div>
          <div className="text-xl font-black tracking-tighter text-white group-hover:text-brand-orange transition-colors leading-none uppercase italic mb-2">{name}</div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-brand-orange/40" />
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-white/40 transition-colors">{sales} units processed</div>
          </div>
        </div>
      </div>
      <div className="text-2xl font-black tracking-tighter text-white italic relative z-10 group-hover:scale-110 transition-transform duration-500">
        <span className="text-brand-orange mr-1.5 opacity-50">$</span>
        {price.toFixed(2)}
      </div>
    </div>
  )
}

export function DashboardHeader({ title, subtitle, badge, children }: { 
  title: string | React.ReactNode, 
  subtitle: string, 
  badge?: string,
  children?: React.ReactNode 
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative overflow-hidden p-12 bg-white/[0.01] border border-white/[0.03] rounded-[48px] backdrop-blur-3xl group transition-all duration-700 hover:bg-white/[0.02] hover:border-white/[0.06]">
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-brand-orange/[0.03] rounded-full blur-[120px] group-hover:bg-brand-orange/[0.06] transition-all duration-1000" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/[0.02] rounded-full blur-[100px] group-hover:bg-blue-500/[0.04] transition-all duration-1000" />
      
      <div className="relative z-10">
        {badge && (
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[9px] font-black uppercase tracking-[0.4em] mb-6 italic animate-in fade-in slide-in-from-left-4 duration-1000">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_rgba(245,124,0,0.5)]" />
            {badge}
          </div>
        )}
        <h2 className="text-5xl font-black tracking-tighter mb-4 text-white uppercase italic leading-none group-hover:translate-x-1 transition-transform duration-700">
          {title}
        </h2>
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-brand-orange/40" />
          <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] italic">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 relative z-10">
        {children}
      </div>
    </div>
  )
}
