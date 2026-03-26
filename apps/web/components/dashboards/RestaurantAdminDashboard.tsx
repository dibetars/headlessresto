'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard, PopularItem } from './DashboardComponents'
import { getDashboardStats } from '@/app/auth/actions'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeTables: number
  avgOrderValue: number
  popularItems: { name: string; sales: number; price: number; color: string }[]
  dailyRevenue: { day: string; amount: number; percentage: number }[]
}

// ─── Hero Card ────────────────────────────────────────────────────────────────
function HeroCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl min-h-[200px] flex flex-col justify-between p-7"
      style={{ background: 'linear-gradient(135deg, #F57C00 0%, #FF9800 55%, #FFB74D 100%)' }}>
      {/* Ambient blur layer */}
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/[0.12] blur-3xl pointer-events-none" />

      {/* Decorative orb */}
      <div className="absolute right-7 top-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(200,80,0,0.4))' }}>
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55) 0%, rgba(255,160,0,0.7) 40%, rgba(180,60,0,0.85) 100%)' }} />
      </div>
      <div className="absolute right-7 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FFD54F, #FF8F00, #E65100)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
          <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Live Service</span>
        </div>
        <div className="text-2xl font-bold text-white leading-snug normal-case not-italic font-work-sans">
          Maximize your<br />restaurant's potential
        </div>
        <p className="text-white/70 text-sm mt-2 leading-relaxed">
          Every order counts. Keep your team<br />and guests connected — all in one place.
        </p>
      </div>

      <div className="flex items-center gap-3 relative z-10 mt-5">
        <button className="flex items-center gap-1.5 bg-white text-brand-orange text-sm font-semibold px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-sm">
          View Analytics
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button className="text-white/75 text-sm font-medium hover:text-white transition-colors">
          Quick actions →
        </button>
      </div>
    </div>
  )
}

// ─── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const days: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]
  while (days.length % 7 !== 0) days.push(null)

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-800">{monthName}</span>
        <div className="flex gap-1">
          <button className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors text-xs font-bold">‹</button>
          <button className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors text-xs font-bold">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square flex items-center justify-center rounded-lg text-[11px] font-medium transition-colors',
              day === null ? '' :
              day === today.getDate()
                ? 'bg-brand-orange text-white font-bold shadow-[0_2px_8px_rgba(245,124,0,0.35)]'
                : 'text-gray-600 hover:bg-orange-50 hover:text-brand-orange cursor-pointer'
            )}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Upcoming Reservations Card ────────────────────────────────────────────────
function UpcomingCard({ items }: { items: { title: string; time: string; guests: number }[] }) {
  const defaults = items.length > 0 ? items : [
    { title: 'Business Lunch', time: '12:30 PM', guests: 4 },
    { title: 'Birthday Dinner', time: '07:15 PM', guests: 6 },
  ]

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-gray-800 normal-case not-italic font-work-sans">Upcoming</div>
        <button className="text-xs text-brand-orange font-semibold hover:underline">View all</button>
      </div>
      {defaults.map((item, i) => (
        <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-orange-50/50 transition-colors cursor-pointer group">
          <div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-orange transition-colors">{item.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.guests} guests</p>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-lg border border-black/[0.05] shrink-0">
            {item.time}
          </span>
        </div>
      ))}
      <button className="w-full text-center text-xs font-semibold text-brand-orange py-2 rounded-xl border border-brand-orange/20 hover:bg-brand-orange/5 transition-colors">
        + Add Reservation
      </button>
    </div>
  )
}

// ─── Revenue Chart Card ────────────────────────────────────────────────────────
function RevenueChartCard({ dailyRevenue }: { dailyRevenue: { day: string; amount: number; percentage: number }[] }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04] group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Revenue Analytics</div>
          <p className="text-xs text-gray-400 mt-0.5">Last 7 days performance</p>
        </div>
        <select className="bg-gray-100 border-0 text-gray-500 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-brand-orange/20 outline-none cursor-pointer hover:bg-gray-200 transition-colors">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      <div className="h-40 flex items-end justify-between gap-2">
        {dailyRevenue.length > 0 ? (
          dailyRevenue.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
              <div
                className="w-full rounded-t-xl bg-brand-orange/15 hover:bg-brand-orange/80 transition-all duration-300 cursor-pointer relative group-hover/bar:shadow-[0_-4px_12px_rgba(245,124,0,0.2)]"
                style={{ height: `${Math.max(data.percentage, 8)}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded-lg text-[10px] font-semibold opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                  ${data.amount.toLocaleString()}
                </div>
              </div>
              <span className="text-[10px] font-medium text-gray-400">{data.day}</span>
            </div>
          ))
        ) : (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-xl bg-gray-100 animate-pulse" style={{ height: `${20 + Math.random() * 60}%` }} />
              <span className="text-[10px] font-medium text-gray-300">—</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Popular Items Card ─────────────────────────────────────────────────────────
function TopItemsCard({ items }: { items: { name: string; sales: number; price: number; color: string }[] }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Top Items</div>
        <button className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1 flex-1">
        {items.length > 0 ? (
          items.map((item, i) => (
            <PopularItem key={i} name={item.name} sales={item.sales} price={item.price} color={item.color} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-300">
            <ShoppingBag className="w-8 h-8 mb-2 opacity-40" />
            <span className="text-xs font-medium">No items yet</span>
          </div>
        )}
      </div>

      <button className="mt-4 w-full text-xs font-semibold text-gray-500 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-brand-orange hover:border-brand-orange/20 transition-all">
        View full menu →
      </button>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function RestaurantAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeTables: 0,
    avgOrderValue: 0,
    popularItems: [],
    dailyRevenue: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const orders = await getDashboardStats()

      if (orders) {
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
        const active = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length

        const itemSales: Record<string, { sales: number; price: number }> = {}
        orders.forEach(order => {
          order.order_items?.forEach((item: any) => {
            const name = item.menu_items?.name || 'Unknown'
            if (!itemSales[name]) itemSales[name] = { sales: 0, price: item.menu_items?.price || 0 }
            itemSales[name].sales += item.quantity
          })
        })

        const colors = ['#F57C00', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']
        const popularItems = Object.entries(itemSales)
          .map(([name, data], index) => ({ name, sales: data.sales, price: data.price, color: colors[index % colors.length] }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5)

        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - i)
          return d.toISOString().split('T')[0]
        }).reverse()

        const dailyData = last7Days.map(date => {
          const dayOrders = orders.filter(o => o.created_at.startsWith(date))
          const amount = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
          return { day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), amount }
        })

        const maxRevenue = Math.max(...dailyData.map(d => d.amount), 1)
        const dailyRevenue = dailyData.map(d => ({ ...d, percentage: (d.amount / maxRevenue) * 100 }))

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          activeTables: active,
          avgOrderValue: orders.length > 0 ? revenue / orders.length : 0,
          popularItems,
          dailyRevenue
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">

      {/* Greeting */}
      <div>
        <div className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight normal-case font-work-sans not-italic leading-tight">
          Hi there! <span className="text-brand-orange">Here's your overview</span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{today} — let's see what's happening.</p>
      </div>

      {/* ── Row 1: 4 stat cards (always visible, responsive grid) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
          change={12.5}
          trend="up"
          color="bg-brand-orange"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          icon={<ShoppingBag className="w-4 h-4" />}
          change={8.2}
          trend="up"
          color="bg-blue-500"
        />
        <StatCard
          label="Active Tables"
          value={stats.activeTables.toString()}
          icon={<Clock className="w-4 h-4" />}
          change={-2.4}
          trend="down"
          color="bg-purple-500"
        />
        <StatCard
          label="Avg. Ticket"
          value={`$${stats.avgOrderValue.toFixed(2)}`}
          icon={<TrendingUp className="w-4 h-4" />}
          change={4.1}
          trend="up"
          color="bg-emerald-500"
        />
      </div>

      {/* ── Row 2: Hero card + Calendar (desktop side-by-side, mobile stacked) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
        <HeroCard />
        <div className="flex flex-col gap-4">
          <MiniCalendar />
          <UpcomingCard items={[]} />
        </div>
      </div>

      {/* ── Row 3: Revenue chart + Top items ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
        <RevenueChartCard dailyRevenue={stats.dailyRevenue} />
        <TopItemsCard items={stats.popularItems} />
      </div>
    </div>
  )
}
