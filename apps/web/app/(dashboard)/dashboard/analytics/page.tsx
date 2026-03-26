'use client'

import React, { useState, useEffect } from 'react'
import { getDashboardStats } from '@/app/auth/actions'
import { TrendingUp, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function MetricCard({ label, value, change, trend, prefix = '' }: { label: string; value: string; change: number; trend: 'up' | 'down'; prefix?: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
      <p className="text-sm text-gray-500 font-medium mb-3">{label}</p>
      <p className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{prefix}{value}</p>
      <div className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full', trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500')}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(change)}% vs last period
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(data => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  // Period-over-period calculations
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const currentPeriod = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo)
  const previousPeriod = orders.filter(o => {
    const d = new Date(o.created_at)
    return d >= sixtyDaysAgo && d < thirtyDaysAgo
  })

  function calcChange(current: number, previous: number): { change: number; trend: 'up' | 'down' } {
    if (previous === 0) return { change: 0, trend: 'up' }
    const change = Math.round(((current - previous) / previous) * 100)
    return { change: Math.abs(change), trend: change >= 0 ? 'up' : 'down' }
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const completedOrders = orders.filter(o => o.status === 'completed').length
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0

  const currentRevenue = currentPeriod.reduce((s, o) => s + (o.total || 0), 0)
  const previousRevenue = previousPeriod.reduce((s, o) => s + (o.total || 0), 0)
  const revenueChange = calcChange(currentRevenue, previousRevenue)

  const ordersChange = calcChange(currentPeriod.length, previousPeriod.length)

  const currentCompleted = currentPeriod.filter(o => o.status === 'completed').length
  const previousCompleted = previousPeriod.filter(o => o.status === 'completed').length
  const completedChange = calcChange(currentCompleted, previousCompleted)

  const currentAvgTicket = currentPeriod.length > 0 ? currentRevenue / currentPeriod.length : 0
  const previousAvgTicket = previousPeriod.length > 0 ? previousRevenue / previousPeriod.length : 0
  const avgTicketChange = calcChange(
    Math.round(currentAvgTicket * 100),
    Math.round(previousAvgTicket * 100)
  )

  // Weekly breakdown
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short' }) }
  })

  const weeklyData = last7Days.map(({ date, label }) => {
    const dayOrders = currentPeriod.filter(o => o.created_at?.startsWith(date))
    const revenue = dayOrders.reduce((s, o) => s + (o.total || 0), 0)
    return { label, revenue, count: dayOrders.length }
  })
  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 1)

  // Status breakdown
  const statusGroups: Record<string, number> = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const statusColors: Record<string, string> = {
    completed: 'bg-emerald-500',
    pending: 'bg-amber-400',
    cancelled: 'bg-red-400',
    preparing: 'bg-blue-500',
    ready: 'bg-purple-500',
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">

      {/* Header */}
      <div className="pb-4 border-b border-gray-200/80">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          Analytics
        </div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight normal-case not-italic font-work-sans">Performance Overview</div>
        <p className="text-sm text-gray-500 mt-1">All-time metrics for your restaurant</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change={revenueChange.change} trend={revenueChange.trend} />
        <MetricCard label="Total Orders" value={orders.length.toString()} change={ordersChange.change} trend={ordersChange.trend} />
        <MetricCard label="Completed" value={completedOrders.toString()} change={completedChange.change} trend={completedChange.trend} />
        <MetricCard label="Avg. Ticket" value={`$${avgTicket.toFixed(2)}`} change={avgTicketChange.change} trend={avgTicketChange.trend} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">

        {/* Weekly revenue bar chart */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Weekly Revenue</div>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-orange" />
          </div>
          <div className="h-48 flex items-end gap-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full rounded-t-xl bg-brand-orange/15 hover:bg-brand-orange/70 transition-all duration-300 cursor-pointer relative group"
                  style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 6)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded-lg text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                    ${d.revenue.toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
          <div className="text-base font-bold text-gray-900 mb-5 normal-case not-italic font-work-sans">Order Status</div>
          {Object.keys(statusGroups).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-300">
              <ShoppingBag className="w-8 h-8 mb-2 opacity-40" />
              <span className="text-xs font-medium">No orders yet</span>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(statusGroups).map(([status, count]) => {
                const pct = Math.round((count / orders.length) * 100)
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                      <span className="text-sm font-bold text-gray-900">{count} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', statusColors[status] || 'bg-gray-400')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
