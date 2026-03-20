'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Package, 
  Clock, 
  Settings, 
  Bell, 
  Search, 
  Calendar,
  UtensilsCrossed,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MonitorPlay,
  Calculator
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUserProfile } from '@/app/auth/actions'

import { DashboardLayout as NewDashboardLayout } from '@/components/dashboards/DashboardLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setError(null)
      const data = await getUserProfile()
      
      if (!data) {
        router.push('/login')
        return
      }

      setProfile(data)
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      setError(err.message || 'Failed to synchronize with Management OS')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020202]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-orange/10 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="mt-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] animate-pulse italic">
          Synchronizing Management OS...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020202] p-8 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20">
          <Bell className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">System Link Error</h1>
        <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] max-w-xs mb-10 leading-relaxed">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="h-16 px-10 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase italic tracking-widest border border-white/10 transition-all active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  const role = profile?.role || 'user'
  const userName = profile?.full_name || 'User'
  const restaurantName = profile?.organization?.name || 'HeadlessResto'
  const isFullScreen = pathname === '/dashboard/pos' || pathname === '/dashboard/kds'

  return (
    <NewDashboardLayout 
      role={role} 
      userName={userName} 
      restaurantName={restaurantName}
      fullScreen={isFullScreen}
    >
      {children}
    </NewDashboardLayout>
  )
}
  )
}

function NavItem({ icon, label, href, active = false, onClick }: { icon: React.ReactNode, label: string, href?: string, active?: boolean, onClick?: () => void }) {
  const content = (
    <>
      <span className={cn("transition-all duration-500", active ? "scale-110 text-black" : "group-hover:scale-110 group-hover:text-amber-500")}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {active && (
        <div className="absolute right-6 w-2 h-2 rounded-full bg-black shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
      )}
    </>
  )

  const className = cn(
    "w-full flex items-center gap-5 px-8 py-4.5 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 group relative overflow-hidden italic",
    active 
      ? "bg-amber-500 text-black shadow-2xl shadow-amber-500/40 border-none scale-[1.02]" 
      : "text-white/40 hover:bg-white/[0.05] hover:text-white border border-transparent hover:border-white/5"
  )

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button className={className} onClick={onClick}>
      {content}
    </button>
  )
}
