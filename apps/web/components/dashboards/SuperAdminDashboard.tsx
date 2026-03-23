'use client'

import React, { useState, useEffect } from 'react'
import { Store, Users, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { StatCard, DashboardHeader } from './DashboardComponents'
import { getOrganizations, getPlatformStats } from '@/app/auth/actions'

export function SuperAdminDashboard() {
  const [orgs, setOrgs] = useState<any[]>([])
  const [stats, setStats] = useState({ totalOrganizations: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getOrganizations(), getPlatformStats()]).then(([o, s]) => {
      setOrgs(o)
      setStats(s)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
      <DashboardHeader
        title={<>Platform <span className="text-brand-orange">Control</span></>}
        subtitle="Global management and restaurant oversight."
        badge="Super Admin"
      >
        <Link
          href="/dashboard/restaurants"
          className="inline-flex items-center gap-2 h-9 rounded-xl px-4 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all"
        >
          Manage Restaurants
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </DashboardHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Restaurants"
          value={loading ? '—' : stats.totalOrganizations.toString()}
          icon={<Store className="w-4 h-4" />}
          change={0}
          trend="up"
          color="bg-brand-orange"
        />
        <StatCard
          label="Total Orders"
          value={loading ? '—' : stats.totalOrders.toLocaleString()}
          icon={<TrendingUp className="w-4 h-4" />}
          change={0}
          trend="up"
          color="bg-blue-500"
        />
        <StatCard
          label="Platform Revenue"
          value={loading ? '—' : `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={<TrendingUp className="w-4 h-4" />}
          change={0}
          trend="up"
          color="bg-emerald-500"
        />
        <StatCard
          label="Total Users"
          value={loading ? '—' : stats.totalUsers.toString()}
          icon={<Users className="w-4 h-4" />}
          change={0}
          trend="up"
          color="bg-purple-500"
        />
      </div>

      {/* Recent restaurants */}
      <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Recent Restaurants</div>
            <p className="text-xs text-gray-400 mt-0.5">Latest registered restaurants</p>
          </div>
          <Link
            href="/dashboard/restaurants"
            className="text-xs font-semibold text-brand-orange hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70">
                <th className="px-7 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Restaurant</th>
                <th className="px-7 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Slug</th>
                <th className="px-7 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Registered</th>
                <th className="px-7 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-7 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : orgs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-7 py-12 text-center text-sm text-gray-400">No restaurants yet</td>
                </tr>
              ) : (
                orgs.slice(0, 5).map(org => {
                  const featuresObj = org.brand_assets?.features || {}
                  const totalFeatures = 7
                  const enabledFeatures = Object.keys(featuresObj).length === 0
                    ? totalFeatures
                    : Object.values(featuresObj).filter(Boolean).length

                  return (
                    <tr key={org.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-7 py-4">
                        <div className="font-semibold text-gray-900 text-sm">{org.name}</div>
                      </td>
                      <td className="px-7 py-4">
                        <div className="text-sm text-gray-500">/{org.slug}</div>
                      </td>
                      <td className="px-7 py-4">
                        <div className="text-sm text-gray-500">
                          {new Date(org.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-7 py-4 text-right">
                        <Link
                          href="/dashboard/restaurants"
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                            enabledFeatures === totalFeatures
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : enabledFeatures === 0
                              ? 'bg-red-50 text-red-500 hover:bg-red-100'
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                          }`}
                        >
                          {enabledFeatures}/{totalFeatures}
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
