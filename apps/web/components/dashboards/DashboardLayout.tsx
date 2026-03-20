'use client'

import React from 'react'
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
  Calculator,
  Zap
} from 'lucide-react'
import { cn } from '@headlessresto/ui'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: string
  userName: string
  restaurantName?: string
  fullScreen?: boolean
}

export function DashboardLayout({ children, role, userName, restaurantName, fullScreen = false }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  if (fullScreen) {
    return <div className="h-screen bg-brand-black overflow-hidden">{children}</div>
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-brand-black overflow-hidden font-work-sans text-white selection:bg-brand-orange/30 selection:text-brand-orange">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-brand-dark/40 backdrop-blur-3xl flex flex-col z-30 relative border-r border-white/5 shadow-momentum-sidebar">
        <div className="p-10 h-full flex flex-col">
          <Link href="/" className="flex items-center gap-5 mb-16 group">
            <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-momentum-glow transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <UtensilsCrossed className="w-7 h-7 text-black stroke-[2.5] relative z-10" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black leading-none tracking-tighter text-white uppercase font-fugaz italic">
                {restaurantName || 'Momentum'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">
                  Terminal OS v2.0
                </span>
              </div>
            </div>
          </Link>

          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-2">
            <div className="px-5 pb-4 pt-2 flex items-center justify-between">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em] italic flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/40" />
                Systems
              </span>
              <span className="text-[8px] font-black text-white/5 uppercase tracking-widest italic">Live Feed</span>
            </div>
            <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" href="/dashboard" active={pathname === '/dashboard'} />
            
            <div className="pt-10 pb-4 px-5 flex items-center justify-between">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em] italic flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                Terminal
              </span>
              <span className="text-[8px] font-black text-blue-500/20 uppercase tracking-widest italic">Active</span>
            </div>

            {(role === 'restaurant_admin' || role === 'cashier' || role === 'owner' || role === 'manager' || role === 'admin') && (
              <div className="space-y-2">
                <NavItem icon={<Calculator className="w-5 h-5" />} label="POS Terminal" href="/dashboard/pos" active={pathname === '/dashboard/pos'} />
                <NavItem icon={<MonitorPlay className="w-5 h-5" />} label="KDS Feed" href="/dashboard/kds" active={pathname === '/dashboard/kds'} />
                <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Orders" href="/dashboard/orders" active={pathname === '/dashboard/orders'} />
                <NavItem icon={<LayoutGrid className="w-5 h-5" />} label="Tables" href="/dashboard/tables" active={pathname === '/dashboard/tables'} />
                <NavItem icon={<Clock className="w-5 h-5" />} label="Reservations" href="/dashboard/reservations" active={pathname === '/dashboard/reservations'} />
              </div>
            )}

            <div className="pt-10 pb-4 px-5 flex items-center justify-between">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em] italic flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
                Insight
              </span>
              <span className="text-[8px] font-black text-purple-500/20 uppercase tracking-widest italic">Reports</span>
            </div>

            {role === 'super_admin' && (
              <div className="space-y-2">
                <NavItem icon={<Users className="w-5 h-5" />} label="Restaurants" href="/dashboard/restaurants" active={pathname === '/dashboard/restaurants'} />
                <NavItem icon={<TrendingUp className="w-5 h-5" />} label="System Stats" href="/dashboard/stats" active={pathname === '/dashboard/stats'} />
              </div>
            )}

            {(role === 'restaurant_admin' || role === 'owner' || role === 'manager' || role === 'admin') && (
              <div className="space-y-2">
                <NavItem icon={<TrendingUp className="w-5 h-5" />} label="Analytics" href="/dashboard/analytics" active={pathname === '/dashboard/analytics'} />
                <NavItem icon={<Package className="w-5 h-5" />} label="Inventory" href="/dashboard/inventory" active={pathname === '/dashboard/inventory'} />
                <NavItem icon={<Users className="w-5 h-5" />} label="Staff" href="/dashboard/staff" active={pathname === '/dashboard/staff'} />
              </div>
            )}

            <div className="pt-10 pb-4 px-5 flex items-center justify-between">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em] italic flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                Control
              </span>
              <span className="text-[8px] font-black text-white/5 uppercase tracking-widest italic">Config</span>
            </div>
            <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" href="/dashboard/settings" active={pathname === '/dashboard/settings'} />
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-6 bg-white/[0.01] border-t border-white/5">
          <div className="flex items-center gap-4 px-2 group cursor-pointer" onClick={() => router.push('/dashboard/settings')}>
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:border-brand-orange/50 transition-all duration-700 relative shadow-2xl">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-brand-orange/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-black truncate text-white uppercase italic group-hover:text-brand-orange transition-colors duration-500">{userName}</div>
              <div className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] truncate mt-1 italic flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-orange/40" />
                {role.replace('_', ' ')}
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
              className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-500 group/btn"
            >
              <LogOut className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-brand-black relative">
        {/* Ambient background layers */}
        <div className="absolute inset-0 bg-momentum-gradient pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-orange/[0.02] rounded-full blur-[150px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-24 flex items-center justify-between px-12 z-20 border-b border-white/5 bg-brand-black/20 backdrop-blur-3xl">
          <div className="flex-1 max-w-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
            <div className="relative flex items-center">
              <Search className="absolute left-6 w-4 h-4 text-white/10 group-focus-within:text-brand-orange group-focus-within:scale-110 transition-all duration-700" />
              <input 
                type="text" 
                placeholder="Search Terminal OS..." 
                className="w-full pl-16 pr-24 py-4 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] text-white placeholder:text-white/10 focus:bg-white/[0.08] focus:border-brand-orange/30 transition-all outline-none italic"
              />
              <div className="absolute right-6 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-black text-white/20 uppercase tracking-widest italic">CMD</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-black text-white/20 uppercase tracking-widest italic">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer group">
              <Calendar className="w-4 h-4 text-white/20 group-hover:text-brand-orange group-hover:scale-110 transition-all duration-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/40 group-hover:text-white/90 uppercase tracking-[0.2em] italic transition-colors leading-none">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em] italic mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
              </div>
            </div>
            
            <button className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white/20 hover:text-brand-orange hover:bg-white/[0.08] transition-all duration-500 group relative">
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-all duration-700" />
              <span className="absolute top-4 right-4 w-2 h-2 bg-brand-orange rounded-full ring-4 ring-brand-black shadow-[0_0_10px_rgba(245,124,0,0.5)]" />
            </button>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <div className="flex items-center gap-3 px-4 py-2 bg-brand-orange/5 rounded-xl border border-brand-orange/10 group cursor-pointer hover:bg-brand-orange/10 transition-all duration-500">
              <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_rgba(245,124,0,0.5)]" />
              <span className="text-[9px] font-black text-brand-orange uppercase tracking-[0.3em] italic">System Online</span>
            </div>
          </div>
        </header>


        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto px-12 pb-12 pt-10 no-scrollbar relative z-10">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href?: string, active?: boolean }) {
  const content = (
    <>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700 relative z-10",
        active 
          ? "bg-black text-brand-orange shadow-[0_0_20px_rgba(245,124,0,0.3)]" 
          : "bg-white/5 text-white/20 group-hover:text-brand-orange group-hover:bg-brand-orange/10 group-hover:scale-110 group-hover:rotate-3"
      )}>
        {icon}
        {active && (
          <div className="absolute inset-0 rounded-xl bg-brand-orange/20 animate-pulse" />
        )}
      </div>
      <span className="flex-1 text-[11px] font-black uppercase tracking-[0.3em] relative z-10 transition-colors duration-500">{label}</span>
      {active && (
        <div className="absolute right-6 w-1.5 h-1.5 rounded-full bg-black/60 shadow-[0_0_8px_rgba(0,0,0,0.8)] z-10" />
      )}
      
      {/* Animated background on hover/active */}
      <div className={cn(
        "absolute inset-0 transition-all duration-700",
        active 
          ? "opacity-100" 
          : "opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/[0.03] to-transparent"
      )} />
      
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black shadow-[2px_0_10px_rgba(0,0,0,0.5)]" />
      )}
    </>
  )

  const className = cn(
    "w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-700 group relative overflow-hidden italic",
    active 
      ? "bg-brand-orange text-black shadow-[0_20px_40px_-10px_rgba(245,124,0,0.4)] scale-[1.02] z-10" 
      : "text-white/30 hover:bg-white/5 hover:text-white/90 border border-transparent hover:border-white/10"
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button className={className}>
      {content}
    </button>
  )
}
