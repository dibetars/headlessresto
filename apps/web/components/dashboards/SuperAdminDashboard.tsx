'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Store, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatCard, DashboardHeader } from './DashboardComponents'

interface PendingRestaurant {
  id: string
  name: string
  slug: string
  status: string
  created_at: string
  owner_email?: string
}

export function SuperAdminDashboard() {
  const [pendingRestaurants, setPendingRestaurants] = useState<PendingRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPendingRestaurants()
  }, [])

  const fetchPendingRestaurants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, profiles(email)')
      .eq('status', 'pending')
    
    if (data) {
      setPendingRestaurants(data.map(r => ({
        ...r,
        owner_email: (r.profiles as any)?.[0]?.email
      })))
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('restaurants')
      .update({ status: 'active' })
      .eq('id', id)
    
    if (!error) {
      // Also approve the restaurant_admin profile
      await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('restaurant_id', id)
        .eq('role', 'restaurant_admin')
      
      fetchPendingRestaurants()
    }
  }

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('restaurants')
      .update({ status: 'suspended' })
      .eq('id', id)
    
    if (!error) {
      fetchPendingRestaurants()
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      <DashboardHeader 
        title={<>Platform <span className="text-brand-orange">Control</span></>}
        subtitle="Global management and restaurant verification feed."
        badge="Super Admin Mode"
      >
        <Button 
          onClick={fetchPendingRestaurants} 
          variant="outline"
          className="h-14 rounded-[20px] px-8 border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08] text-white/50 hover:text-white font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-500 italic"
        >
          Refresh Feed
        </Button>
      </DashboardHeader>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Total Restaurants" 
          value="24" 
          icon={<Store className="w-5 h-5" />}
          change={15.2}
          trend="up"
          color="bg-brand-orange"
        />
        <StatCard 
          label="Pending Approvals" 
          value={pendingRestaurants.length.toString()} 
          icon={<AlertCircle className="w-5 h-5" />}
          change={-5.4}
          trend="down"
          color="bg-blue-500"
        />
        <StatCard 
          label="Platform Revenue" 
          value="$12,450" 
          icon={<TrendingUp className="w-5 h-5" />}
          change={8.9}
          trend="up"
          color="bg-emerald-500"
        />
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white/[0.01] rounded-[48px] border border-white/[0.03] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-1000 backdrop-blur-3xl group relative">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-orange/[0.02] rounded-full blur-[100px]" />
        
        <div className="p-10 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01] relative z-10">
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">Verification Queue</h3>
            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em] mt-3 italic">Awaiting System Action</p>
          </div>
          <div className="flex items-center gap-4 px-5 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_rgba(245,124,0,0.8)]"></div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] italic">Live Feed</span>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-12 py-8 text-left text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic">Identity</th>
                <th className="px-12 py-8 text-left text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic">Ownership</th>
                <th className="px-12 py-8 text-left text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic">Registration</th>
                <th className="px-12 py-8 text-right text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {pendingRestaurants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-12 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-white/[0.01] rounded-[32px] flex items-center justify-center mb-8 border border-white/[0.03] shadow-inner">
                        <Check className="w-10 h-10 text-white/5" />
                      </div>
                      <p className="text-2xl font-black text-white/40 tracking-tight uppercase italic leading-none">Queue Synchronized</p>
                      <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em] mt-4 italic">No pending verifications</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="group hover:bg-white/[0.02] transition-all duration-500">
                    <td className="px-12 py-10">
                      <div className="font-black text-xl text-white group-hover:text-brand-orange transition-colors uppercase italic tracking-tighter leading-none">{restaurant.name}</div>
                      <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mt-2 italic">ID: {restaurant.slug}</div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="text-sm font-black text-white uppercase italic tracking-tight group-hover:text-white/80 transition-colors">{restaurant.owner_email || 'N/A'}</div>
                      <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mt-2 italic">Verified Principal</div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="text-sm font-black text-white uppercase italic tracking-tight">{new Date(restaurant.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mt-2 italic">Timestamp</div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex items-center justify-end space-x-5">
                        <button 
                          onClick={() => handleReject(restaurant.id)}
                          className="w-14 h-14 flex items-center justify-center text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-[20px] border border-white/[0.03] hover:border-red-500/20 transition-all duration-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <Button 
                          onClick={() => handleApprove(restaurant.id)}
                          className="h-14 rounded-[20px] bg-brand-orange hover:bg-brand-orange/90 text-black shadow-[0_15px_30px_rgba(245,124,0,0.2)] px-10 font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-500 italic"
                        >
                          <Check className="w-4 h-4 mr-3 stroke-[3]" />
                          Authorize
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
}
