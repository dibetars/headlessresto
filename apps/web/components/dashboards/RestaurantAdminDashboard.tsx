'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  ChevronUp, 
  ChevronDown,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatCard, PopularItem, DashboardHeader } from './DashboardComponents'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeTables: number
  avgOrderValue: number
  revenueChange: number
  ordersChange: number
  popularItems: { name: string; sales: number; price: number; color: string }[]
  dailyRevenue: { day: string; amount: number; percentage: number }[]
}

export function RestaurantAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeTables: 0,
    avgOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    popularItems: [],
    dailyRevenue: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
    
    // Subscribe to order updates for live stats
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch all orders with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          total, 
          status, 
          created_at,
          order_items (
            quantity,
            menu_items (
              name,
              price
            )
          )
        `)
      
      if (ordersError) throw ordersError

      if (orders) {
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
        const active = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length
        
        // 2. Calculate popular items
        const itemSales: Record<string, { sales: number; price: number }> = {}
        orders.forEach(order => {
          order.order_items?.forEach((item: any) => {
            const name = item.menu_items?.name || 'Unknown'
            if (!itemSales[name]) {
              itemSales[name] = { sales: 0, price: item.menu_items?.price || 0 }
            }
            itemSales[name].sales += item.quantity
          })
        })

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
        const popularItems = Object.entries(itemSales)
          .map(([name, data], index) => ({
            name,
            sales: data.sales,
            price: data.price,
            color: colors[index % colors.length]
          }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5)

        // 3. Calculate daily revenue for last 7 days
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - i)
          return d.toISOString().split('T')[0]
        }).reverse()

        const dailyData = last7Days.map(date => {
          const dayOrders = orders.filter(o => o.created_at.startsWith(date))
          const amount = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
          return {
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            amount
          }
        })

        const maxRevenue = Math.max(...dailyData.map(d => d.amount), 1)
        const dailyRevenue = dailyData.map(d => ({
          ...d,
          percentage: (d.amount / maxRevenue) * 100
        }))

        setStats(prev => ({
          ...prev,
          totalRevenue: revenue,
          totalOrders: orders.length,
          activeTables: active,
          avgOrderValue: orders.length > 0 ? revenue / orders.length : 0,
          popularItems,
          dailyRevenue
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      {/* Header Info */}
      <DashboardHeader 
        title={<>Terminal <span className="text-brand-orange">Control</span></>}
        subtitle="System Monitoring & Performance Analytics"
      >
        <Button variant="outline" size="sm" className="h-14 rounded-[20px] px-8 border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08] text-white/50 hover:text-white font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-500 italic">
          Export Report
        </Button>
        <Button size="sm" className="h-14 rounded-[20px] px-8 bg-brand-orange hover:bg-brand-orange/90 text-black shadow-[0_15px_30px_rgba(245,124,0,0.2)] border-none font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-500 italic scale-105">
          New Transaction
        </Button>
      </DashboardHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard 
          label="Gross Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign className="w-5 h-5" />}
          change={12.5}
          trend="up"
          color="bg-brand-orange"
        />
        <StatCard 
          label="Total Vol." 
          value={stats.totalOrders.toString()} 
          icon={<ShoppingBag className="w-5 h-5" />}
          change={8.2}
          trend="up"
          color="bg-blue-500"
        />
        <StatCard 
          label="Active Load" 
          value={stats.activeTables.toString()} 
          icon={<Clock className="w-5 h-5" />}
          change={-2.4}
          trend="down"
          color="bg-purple-500"
        />
        <StatCard 
          label="Avg. Tick" 
          value={`$${stats.avgOrderValue.toFixed(2)}`} 
          icon={<TrendingUp className="w-5 h-5" />}
          change={4.1}
          trend="up"
          color="bg-white/10"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white/[0.01] rounded-[48px] p-10 shadow-2xl border border-white/[0.03] transition-all duration-700 hover:bg-white/[0.02] hover:border-white/[0.06] group overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-orange/[0.02] rounded-full blur-[100px]" />
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
              <h3 className="text-2xl font-black tracking-tighter mb-2 text-white uppercase italic leading-none">Revenue Analytics</h3>
              <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] italic">Real-time performance feed</p>
            </div>
            <select className="bg-white/[0.02] border-white/[0.05] text-white/40 rounded-[16px] px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] focus:ring-1 focus:ring-brand-orange/20 transition-all outline-none italic cursor-pointer hover:bg-white/[0.04]">
              <option>Cycle: 7D</option>
              <option>Cycle: 30D</option>
            </select>
          </div>
          <div className="h-[360px] w-full bg-black/20 rounded-[32px] flex items-end justify-between px-10 pb-6 relative overflow-hidden border border-white/[0.03] shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-orange/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            {stats.dailyRevenue.map((data, i) => (
              <div key={i} className="flex flex-col items-center gap-5 w-full group/bar relative z-10">
                <div 
                  className="w-12 bg-white/[0.03] rounded-t-[16px] transition-all duration-700 hover:bg-brand-orange/20 cursor-pointer relative flex flex-col justify-end border-x border-t border-white/[0.03] group-hover/bar:border-brand-orange/30 group-hover/bar:shadow-[0_0_30px_rgba(245,124,0,0.1)]" 
                  style={{ height: `${data.percentage}%` }}
                >
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-brand-orange text-black px-4 py-2 rounded-[14px] text-[9px] font-black opacity-0 group-hover/bar:opacity-100 transition-all duration-500 whitespace-nowrap shadow-[0_10px_30px_rgba(245,124,0,0.3)] tracking-tighter z-10 scale-90 group-hover/bar:scale-100 italic">
                    ${data.amount.toLocaleString()}
                  </div>
                  <div className="h-2 w-full bg-brand-orange rounded-t-[16px] shadow-[0_-4px_12px_rgba(245,124,0,0.3)] opacity-40 group-hover/bar:opacity-100 transition-opacity" />
                </div>
                <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic group-hover/bar:text-white/40 transition-colors">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white/[0.01] rounded-[48px] p-10 shadow-2xl border border-white/[0.03] transition-all duration-700 hover:bg-white/[0.02] hover:border-white/[0.06] flex flex-col relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-brand-orange/[0.02] rounded-full blur-[80px]" />
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black tracking-tighter mb-2 text-white uppercase italic leading-none">Top Feed</h3>
              <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] italic">High-velocity items</p>
            </div>
            <button className="text-white/10 hover:text-brand-orange p-3 rounded-[16px] transition-all duration-500 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.05]">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-8 flex-1 relative z-10">
            {stats.popularItems.length > 0 ? (
              stats.popularItems.map((item, i) => (
                <PopularItem key={i} name={item.name} sales={item.sales} price={item.price} color={item.color} />
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center space-y-5 text-white/5 font-black uppercase tracking-[0.4em] text-[9px] italic">
                <ShoppingBag className="w-10 h-10 opacity-10" />
                <span>Empty Feed</span>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-10 h-14 rounded-[20px] font-black uppercase tracking-[0.2em] text-[9px] border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08] text-white/40 hover:text-white transition-all duration-500 italic relative z-10">
            Terminal Explorer
          </Button>
        </div>
      </div>
    </div>
  )
}
