'use client'

import React, { useState, useEffect } from 'react'
import { Store, ShoppingBag, DollarSign, Users, TrendingUp, ArrowUpRight } from 'lucide-react'
import { getPlatformStats, getOrganizations } from '@/app/auth/actions'

function StatCard({ label, value, icon, color, sub }: { label: string; value: string; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${color} rounded-2xl flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <ArrowUpRight className="w-3 h-3" />
          Live
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function PlatformStatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPlatformStats(), getOrganizations()])
      .then(([s, o]) => {
        setStats(s)
        setOrgs(o)
        setLoading(false)
      })
      .catch(err => {
        console.error('Stats page error:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">

      {/* Header */}
      <div className="pb-4 border-b border-gray-200/80">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          Super Admin
        </div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight normal-case not-italic font-work-sans">System Stats</div>
        <p className="text-sm text-gray-500 mt-1">Live platform-wide metrics across all restaurants</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading stats…</p>
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Restaurants"
              value={stats.totalOrganizations.toString()}
              icon={<Store className="w-4 h-4" />}
              color="bg-brand-orange"
            />
            <StatCard
              label="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              icon={<ShoppingBag className="w-4 h-4" />}
              color="bg-blue-500"
            />
            <StatCard
              label="Platform Revenue"
              value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<DollarSign className="w-4 h-4" />}
              color="bg-emerald-500"
              sub="From completed orders"
            />
            <StatCard
              label="Total Users"
              value={stats.totalUsers.toString()}
              icon={<Users className="w-4 h-4" />}
              color="bg-purple-500"
            />
          </div>

          {/* Restaurants list */}
          <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">All Restaurants</div>
                <p className="text-xs text-gray-400 mt-0.5">{orgs.length} registered</p>
              </div>
              <TrendingUp className="w-4 h-4 text-brand-orange" />
            </div>
            <div className="divide-y divide-gray-100">
              {orgs.map(org => {
                const featuresObj = org.brand_assets?.features || {}
                const totalFeatures = 7
                const FEATURE_KEYS = ['pos','kds','orders','reservations','inventory','analytics','staff']
                const displayEnabled = FEATURE_KEYS.filter(k => featuresObj[k] !== false).length

                return (
                  <div key={org.id} className="flex items-center gap-4 px-7 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="w-9 h-9 bg-brand-orange/10 rounded-xl flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4 text-brand-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{org.name}</div>
                      <div className="text-xs text-gray-400">/{org.slug}</div>
                    </div>
                    <div className="text-xs text-gray-400 hidden sm:block">
                      {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      displayEnabled === totalFeatures
                        ? 'bg-emerald-50 text-emerald-600'
                        : displayEnabled === 0
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {displayEnabled}/{totalFeatures} features
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
