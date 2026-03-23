'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboards/DashboardLayout'
import { cn } from '@headlessresto/ui'
import { Clock, ChefHat, CheckCircle2, AlertCircle, Play, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
  table_number?: string
}

interface ServiceCall {
  id: string
  created_at: string
  table_number: string
  status: 'pending' | 'dismissed'
  type: 'waiter' | 'bill'
}

export default function KDSPage() {
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStation, setSelectedStation] = useState<string>('all')
  const supabase = createClient()

  const stations = [
    { id: 'all', name: 'ALL STATIONS' },
    { id: 'Kitchen', name: 'KITCHEN' },
    { id: 'Bar', name: 'BAR' },
    { id: 'Dessert', name: 'DESSERTS' }
  ]

  useEffect(() => {
    fetchProfile()
    fetchOrders()
    fetchServiceCalls()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('kds_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => fetchOrders()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_calls' },
        () => fetchServiceCalls()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: membershipData } = await supabase
      .from('org_memberships')
      .select('*, organization:organizations(name)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    setProfile({
      ...profileData,
      role: membershipData?.role || 'user',
      organization: (membershipData as any)?.organization
    })
  }

  const fetchServiceCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('service_calls')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error && error.code !== 'PGRST116') throw error
      setServiceCalls(data || [])
    } catch (error) {
      console.error('Error fetching service calls:', error)
    }
  }

  const dismissServiceCall = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_calls')
        .update({ status: 'dismissed' })
        .eq('id', id)
      
      if (error) throw error
      // fetchServiceCalls will be triggered by realtime
    } catch (error) {
      console.error('Error dismissing service call:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          table_number,
          order_items (
            id,
            quantity,
            menu_items (
              name,
              category
            )
          )
        `)
        .neq('status', 'completed')
        .order('created_at', { ascending: true })

      if (error) throw error
      setOrders(data || [])
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
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId)
      
      if (error) throw error
      // fetchOrders will be triggered by realtime subscription
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getWaitTime = (createdAt: string) => {
    const start = new Date(createdAt).getTime()
    const now = new Date().getTime()
    const diff = Math.floor((now - start) / 60000)
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

  if (!profile) return null

  return (
    <DashboardLayout 
      role={profile.role} 
      userName={profile.full_name || 'User'} 
      restaurantName={profile.organization?.name}
      fullScreen={true}
    >
      <div className="h-screen bg-[#020202] flex flex-col overflow-hidden text-slate-200 font-sans selection:bg-amber-500/30">
        <header className="h-28 bg-black/60 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,1)] z-20">
          <div className="flex items-center space-x-10">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[28px] blur-xl opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-zinc-900 to-black rounded-[26px] flex items-center justify-center border border-white/10 shadow-2xl transition-all hover:scale-105 hover:border-amber-500/30 duration-500">
                <ChefHat className="w-10 h-10 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tighter text-white">KITCHEN <span className="text-amber-500">CORE</span></h1>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Live Engine v2.4</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {stations.map(station => (
                  <button
                    key={station.id}
                    onClick={() => setSelectedStation(station.id)}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-[0.25em] px-6 py-2.5 rounded-xl transition-all duration-500 border relative overflow-hidden group",
                      selectedStation === station.id 
                        ? "bg-amber-500 border-amber-400 text-white shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] scale-105 z-10" 
                        : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white hover:border-white/10"
                    )}
                  >
                    {selectedStation === station.id && (
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite] skew-x-12"></div>
                    )}
                    {station.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-16">
            {serviceCalls.length > 0 && (
              <div className="flex items-center space-x-6 bg-red-500/5 px-8 py-4 rounded-[40px] border border-red-500/20 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 blur-2xl opacity-30 animate-pulse"></div>
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    <AlertCircle className="w-6 h-6 text-white animate-bounce" />
                  </div>
                </div>
                <div className="flex -space-x-4">
                  {serviceCalls.slice(0, 5).map((call) => (
                    <button 
                      key={call.id}
                      onClick={() => dismissServiceCall(call.id)}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-b from-red-500 to-red-700 border-[4px] border-[#020202] flex flex-col items-center justify-center hover:scale-110 hover:-translate-y-2 transition-all shadow-2xl z-10 group"
                    >
                      <span className="text-[10px] font-black text-white/80 uppercase tracking-tighter leading-none mb-0.5 group-hover:hidden">Table</span>
                      <span className="text-sm font-black text-white leading-none">{call.table_number}</span>
                      <X className="w-4 h-4 text-white hidden group-hover:block" />
                    </button>
                  ))}
                  {serviceCalls.length > 5 && (
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border-[4px] border-[#020202] flex items-center justify-center text-[11px] font-black text-zinc-500 z-0 shadow-2xl">
                      +{serviceCalls.length - 5}
                    </div>
                  )}
                </div>
                <div className="h-10 w-px bg-white/10 mx-2" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] leading-none mb-1">Alert Protocol</span>
                  <span className="text-xs font-black text-white/60 uppercase tracking-widest">{serviceCalls.length} CALLS ACTIVE</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-12">
              <div className="text-right">
                <div className="text-5xl font-black text-white tracking-tighter leading-none mb-1">{filteredOrders.length}</div>
                <div className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.4em]">Active Payload</div>
              </div>
              <div className="h-16 w-px bg-white/10" />
              <div className="text-right">
                <div className="text-4xl font-black text-white tracking-tighter leading-none mb-1 tabular-nums">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">System Chrono</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto p-12 flex items-start space-x-10 no-scrollbar bg-[radial-gradient(circle_at_50%_-20%,rgba(245,158,11,0.05),transparent_60%)]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-10">
              <div className="relative">
                <div className="w-32 h-32 border-t-4 border-amber-500 rounded-full animate-spin shadow-[0_0_50px_rgba(245,158,11,0.2)]"></div>
                <div className="absolute inset-0 w-32 h-32 border-4 border-white/5 rounded-full"></div>
                <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-amber-500/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-[0.6em] text-white mb-2">Syncing Core</p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">Establishing Neural Link...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in duration-1000">
              <div className="relative">
                <div className="absolute -inset-24 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="w-56 h-56 bg-gradient-to-br from-zinc-900 to-black rounded-[70px] flex items-center justify-center border border-white/10 shadow-3xl relative z-10 group overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-1000"></div>
                  <CheckCircle2 className="w-24 h-24 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors duration-700" />
                </div>
              </div>
              <div className="text-center relative z-10">
                <p className="text-6xl font-black tracking-tighter text-white mb-4">SECTOR CLEAR</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-emerald-500/30"></div>
                  <p className="text-xs font-black text-emerald-500/60 uppercase tracking-[0.5em]">Ready for transmissions</p>
                  <div className="h-px w-12 bg-emerald-500/30"></div>
                </div>
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
                    "w-[460px] flex-shrink-0 bg-zinc-900/40 backdrop-blur-3xl rounded-[56px] overflow-hidden flex flex-col shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border transition-all duration-700 hover:translate-y-[-12px] hover:scale-[1.01] group relative",
                    isLate ? "border-red-500/40 shadow-red-500/10 ring-1 ring-red-500/20" : 
                    isWarning ? "border-amber-500/40 shadow-amber-500/10 ring-1 ring-amber-500/20" : 
                    "border-white/10 shadow-black/80"
                  )}
                >
                  {/* Order Header */}
                  <div className={cn(
                    "p-10 flex justify-between items-start relative overflow-hidden",
                    isLate ? "bg-gradient-to-br from-red-500/20 to-transparent" : 
                    isWarning ? "bg-gradient-to-br from-amber-500/20 to-transparent" : 
                    "bg-gradient-to-br from-white/5 to-transparent"
                  )}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="px-4 py-1.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                          <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Table {order.table_number || 'TBD'}</span>
                        </div>
                      </div>
                      <h2 className="text-4xl font-black leading-none tracking-tighter text-white group-hover:text-amber-500 transition-colors duration-500">#{order.id.slice(0, 5).toUpperCase()}</h2>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Incoming Transmission</p>
                    </div>
                    
                    <div className="text-right relative z-10">
                      <div className={cn(
                        "flex items-center justify-end font-black text-4xl tracking-tighter mb-3 transition-all duration-700",
                        isLate ? "text-red-500 scale-110 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" : 
                        isWarning ? "text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" : 
                        "text-white"
                      )}>
                        <Clock className={cn("w-7 h-7 mr-3 opacity-50", isLate && "animate-spin-slow")} />
                        {waitTime}m
                      </div>
                      <div className={cn(
                        "inline-flex items-center gap-2 text-[10px] font-black px-5 py-2 rounded-2xl uppercase tracking-[0.25em] border shadow-2xl transition-all duration-500",
                        order.status === 'pending' ? "bg-zinc-800/80 border-white/5 text-zinc-400" : 
                        order.status === 'preparing' ? "bg-amber-500 border-amber-400 text-white shadow-amber-500/20" : 
                        "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20"
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          order.status === 'pending' ? "bg-zinc-500" : "bg-white"
                        )} />
                        {order.status}
                      </div>
                    </div>
                    
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000">
                      <ChefHat className="w-32 h-32 rotate-12" />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 p-10 space-y-6 overflow-y-auto no-scrollbar min-h-[400px] bg-gradient-to-b from-transparent to-black/20">
                    {order.order_items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-start space-x-6 p-6 rounded-[36px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-amber-500/20 transition-all duration-500 group/item"
                      >
                        <div className="w-16 h-16 rounded-[22px] bg-black border border-white/10 flex items-center justify-center font-black text-amber-500 text-3xl tracking-tighter shadow-2xl group-hover/item:scale-110 group-hover/item:border-amber-500/30 transition-all duration-500">
                          {item.quantity}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="font-black text-white text-2xl leading-tight mb-1.5 group-hover/item:text-amber-500 transition-colors">
                            {Array.isArray(item.menu_items) ? item.menu_items[0]?.name : item.menu_items?.name || 'Unknown Item'}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">
                              {Array.isArray(item.menu_items) ? item.menu_items[0]?.category : item.menu_items?.category || 'General'}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest">Priority Alpha</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="p-10 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
                    <button 
                      onClick={() => updateOrderStatus(order.id, order.status)}
                      className={cn(
                        "w-full py-8 rounded-[32px] flex items-center justify-center space-x-4 font-black text-[13px] uppercase tracking-[0.4em] transition-all duration-700 shadow-3xl relative overflow-hidden group/btn",
                        order.status === 'pending' ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30" : 
                        order.status === 'preparing' ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30" : 
                        "bg-white hover:bg-zinc-100 text-black shadow-white/10"
                      )}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                      {order.status === 'pending' ? (
                        <>
                          <Play className="w-6 h-6 fill-current" />
                          <span>Initiate Prep</span>
                        </>
                      ) : order.status === 'preparing' ? (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          <span>Finalize Prep</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          <span>Dispatch Order</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Status Bar */}
                  <div className={cn(
                    "h-2 w-full",
                    isLate ? "bg-red-500 animate-pulse" : 
                    isWarning ? "bg-amber-500" : 
                    "bg-white/10"
                  )} />
                </div>
              )
            })
          )}
        </main>
      </div>
    </DashboardLayout>
  )
}
