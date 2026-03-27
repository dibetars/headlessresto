'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@headlessresto/ui'
import { getKDSOrders, updateOrderStatusAction, dismissServiceCallAction } from '@/app/auth/actions'
import { Clock, ChefHat, CheckCircle2, AlertCircle, Play, X } from 'lucide-react'

interface OrderItem {
  id: string
  quantity: number
  menu_items: {
    name: string
    category?: string
  } | {
    name: string
    category?: string
  }[] | null
}

interface Order {
  id: string
  created_at: string
  status: string
  order_items: OrderItem[]
  table_id?: string | null
}

interface ServiceCall {
  id: string
  created_at: string
  table_number: string
  status: 'pending' | 'dismissed'
  type: 'waiter' | 'bill'
}

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStation, setSelectedStation] = useState<string>('all')
  const [tick, setTick] = useState(0)
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null)
  const supabase = createClient()

  const stations = [
    { id: 'all', name: 'All' },
    { id: 'Kitchen', name: 'Kitchen' },
    { id: 'Bar', name: 'Bar' },
    { id: 'Dessert', name: 'Desserts' }
  ]

  useEffect(() => {
    fetchOrders()
    fetchServiceCalls()

    const channel = supabase
      .channel('kds_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchOrders())
      .subscribe()

    // Clock tick every second
    const interval = setInterval(() => setTick(t => t + 1), 1000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const fetchServiceCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('service_calls')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      // Silently ignore if table doesn't exist yet
      if (error) return
      setServiceCalls(data || [])
    } catch {
      // service_calls table not yet in schema
    }
  }

  const dismissServiceCall = async (id: string) => {
    try {
      await dismissServiceCallAction(id)
      setServiceCalls(prev => prev.filter(c => c.id !== id))
    } catch {
      // silently ignore — service_calls table may not exist
    }
  }

  const fetchOrders = async () => {
    try {
      const data = await getKDSOrders()
      setOrders(data as Order[])
    } catch (error) {
      console.error('Error fetching KDS orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'pending'
    if (currentStatus === 'pending') nextStatus = 'preparing'
    else if (currentStatus === 'preparing') nextStatus = 'ready'
    else if (currentStatus === 'ready') nextStatus = 'completed'

    // Optimistic update
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
    )
    setLoadingOrderId(orderId)
    try {
      await updateOrderStatusAction(orderId, nextStatus)
      // Re-fetch in background to sync server state
      fetchOrders()
    } catch (error) {
      console.error('Error updating status:', error)
      // Revert optimistic update on error
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: currentStatus } : o)
      )
    } finally {
      setLoadingOrderId(null)
    }
  }

  const getWaitTime = (createdAt: string) => {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
    return diff
  }

  const filteredOrders = orders.map(order => {
    const items = order.order_items.filter(item => {
      if (selectedStation === 'all') return true
      const category = Array.isArray(item.menu_items) ? item.menu_items[0]?.category : item.menu_items?.category
      return category?.toLowerCase() === selectedStation.toLowerCase()
    })
    return { ...order, order_items: items }
  }).filter(order => order.order_items.length > 0)

  const now = new Date()

  return (
    <div className="h-screen bg-brand-cream flex flex-col overflow-hidden font-work-sans">

      {/* Header */}
      <header className="h-20 bg-white border-b border-black/[0.06] flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
          {/* Logo mark */}
          <div className="w-11 h-11 bg-brand-orange rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(245,124,0,0.25)] shrink-0">
            <ChefHat className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900 tracking-tight">Kitchen Display</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live</span>
              </div>
            </div>
            {/* Station filters */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {stations.map(station => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station.id)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200',
                    selectedStation === station.id
                      ? 'bg-brand-orange text-white shadow-[0_2px_8px_rgba(245,124,0,0.3)]'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  )}
                >
                  {station.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {/* Service call alerts */}
          {serviceCalls.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in duration-500">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex -space-x-2">
                {serviceCalls.slice(0, 4).map((call) => (
                  <button
                    key={call.id}
                    onClick={() => dismissServiceCall(call.id)}
                    className="w-8 h-8 rounded-lg bg-red-500 border-2 border-white flex items-center justify-center hover:bg-red-600 transition-colors group shadow-sm"
                    title={`Table ${call.table_number} — click to dismiss`}
                  >
                    <span className="text-[10px] font-black text-white group-hover:hidden leading-none">{call.table_number}</span>
                    <X className="w-3 h-3 text-white hidden group-hover:block" />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-red-600">{serviceCalls.length} alert{serviceCalls.length > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">{filteredOrders.length}</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Active</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-right">
              <div className="text-xl font-black text-gray-900 tracking-tight leading-none tabular-nums">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
                {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Order cards */}
      <main className="flex-1 overflow-x-auto p-6 flex items-start gap-5 no-scrollbar">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-400">Loading orders…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-700">All clear</p>
              <p className="text-sm text-gray-400 mt-1">No active orders right now</p>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const waitTime = getWaitTime(order.created_at)
            const isLate = waitTime > 15
            const isWarning = waitTime > 10

            return (
              <div
                key={order.id}
                className={cn(
                  'w-80 flex-shrink-0 bg-white rounded-3xl overflow-hidden flex flex-col border transition-all duration-300 hover:-translate-y-1 shadow-[0_2px_16px_rgba(0,0,0,0.06)]',
                  isLate
                    ? 'border-red-300 shadow-red-100 ring-1 ring-red-200'
                    : isWarning
                    ? 'border-amber-300 shadow-amber-100 ring-1 ring-amber-200'
                    : 'border-gray-200'
                )}
              >
                {/* Card header */}
                <div className={cn(
                  'px-5 pt-5 pb-4',
                  isLate ? 'bg-red-50' : isWarning ? 'bg-amber-50' : 'bg-gray-50'
                )}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider',
                          isLate ? 'bg-red-100 text-red-600' :
                          isWarning ? 'bg-amber-100 text-amber-600' :
                          'bg-gray-200 text-gray-500'
                        )}>
                          {order.table_id ? `Table ${order.table_id.slice(0, 4)}` : 'Takeaway'}
                        </span>
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider',
                          order.status === 'pending' ? 'bg-blue-100 text-blue-600' :
                          order.status === 'preparing' ? 'bg-brand-orange/10 text-brand-orange' :
                          'bg-emerald-100 text-emerald-600'
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xl font-black text-gray-900 tracking-tight">
                        #{order.id.slice(0, 6).toUpperCase()}
                      </div>
                    </div>

                    <div className={cn(
                      'flex items-center gap-1.5 text-lg font-black tracking-tight',
                      isLate ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-500'
                    )}>
                      <Clock className="w-4 h-4" />
                      <span>{waitTime}m</span>
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar min-h-[180px]">
                  {order.order_items.map((item) => {
                    const name = Array.isArray(item.menu_items) ? item.menu_items[0]?.name : item.menu_items?.name
                    const category = Array.isArray(item.menu_items) ? item.menu_items[0]?.category : item.menu_items?.category
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-brand-orange/5 border border-gray-100 hover:border-brand-orange/20 rounded-2xl transition-all duration-200 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center font-black text-white text-sm shrink-0 shadow-[0_2px_8px_rgba(245,124,0,0.25)] group-hover:scale-105 transition-transform">
                          {item.quantity}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-800 truncate group-hover:text-brand-orange transition-colors">
                            {name || 'Unknown Item'}
                          </div>
                          {category && (
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">{category}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Action button */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <button
                    onClick={() => updateOrderStatus(order.id, order.status)}
                    disabled={loadingOrderId === order.id}
                    className={cn(
                      'w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed',
                      order.status === 'pending'
                        ? 'bg-brand-orange hover:bg-brand-orange/90 text-white shadow-[0_4px_12px_rgba(245,124,0,0.3)]'
                        : order.status === 'preparing'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
                        : 'bg-gray-900 hover:bg-gray-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
                    )}
                  >
                    {loadingOrderId === order.id ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : order.status === 'pending' ? (
                      <><Play className="w-4 h-4 fill-current" /><span>Start Prep</span></>
                    ) : order.status === 'preparing' ? (
                      <><CheckCircle2 className="w-4 h-4" /><span>Mark Ready</span></>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /><span>Dispatch</span></>
                    )}
                  </button>
                </div>

                {/* Status stripe */}
                <div className={cn(
                  'h-1.5 w-full',
                  isLate ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-gray-200'
                )} />
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
