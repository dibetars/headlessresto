'use client'

import React, { useState } from 'react'
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
  Menu,
  X,
  ChevronDown
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
  enabledFeatures?: Record<string, boolean>
}

export function DashboardLayout({ children, role, userName, restaurantName, fullScreen = false, enabledFeatures = {} }: DashboardLayoutProps) {
  const feat = (key: string) => enabledFeatures[key] !== false
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (fullScreen) {
    return <div className="h-screen bg-brand-black overflow-hidden">{children}</div>
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="p-6 h-full flex flex-col">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8 group" onClick={() => setSidebarOpen(false)}>
        <div className="w-9 h-9 bg-brand-orange rounded-xl flex items-center justify-center shadow-[0_4px_16px_rgba(245,124,0,0.3)] transition-transform duration-300 group-hover:scale-105 shrink-0">
          <UtensilsCrossed className="w-4.5 h-4.5 text-black stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight font-fugaz italic uppercase truncate max-w-[160px]">
            {restaurantName || 'HeadlessResto'}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">Online</span>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar space-y-0.5">
        <NavGroup label="General">
          <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} onClick={() => setSidebarOpen(false)} />
        </NavGroup>

        {(role === 'owner' || role === 'manager' || role === 'cashier') && (
          <NavGroup label="Operations">
            {feat('pos') && <NavItem icon={<Calculator className="w-4 h-4" />} label="POS Terminal" href="/dashboard/pos" active={pathname === '/dashboard/pos'} onClick={() => setSidebarOpen(false)} />}
            {feat('kds') && <NavItem icon={<MonitorPlay className="w-4 h-4" />} label="Kitchen Display" href="/dashboard/kds" active={pathname === '/dashboard/kds'} onClick={() => setSidebarOpen(false)} />}
            {feat('orders') && <NavItem icon={<ShoppingBag className="w-4 h-4" />} label="Orders" href="/dashboard/orders" active={pathname === '/dashboard/orders'} onClick={() => setSidebarOpen(false)} />}
            {feat('reservations') && <NavItem icon={<Clock className="w-4 h-4" />} label="Reservations" href="/dashboard/reservations" active={pathname === '/dashboard/reservations'} onClick={() => setSidebarOpen(false)} />}
          </NavGroup>
        )}

        {role === 'super_admin' && (
          <NavGroup label="Platform">
            <NavItem icon={<Users className="w-4 h-4" />} label="Restaurants" href="/dashboard/restaurants" active={pathname === '/dashboard/restaurants'} onClick={() => setSidebarOpen(false)} />
            <NavItem icon={<TrendingUp className="w-4 h-4" />} label="System Stats" href="/dashboard/stats" active={pathname === '/dashboard/stats'} onClick={() => setSidebarOpen(false)} />
          </NavGroup>
        )}

        {(role === 'owner' || role === 'manager') && (
          <NavGroup label="Insights">
            {feat('analytics') && <NavItem icon={<TrendingUp className="w-4 h-4" />} label="Analytics" href="/dashboard/analytics" active={pathname === '/dashboard/analytics'} onClick={() => setSidebarOpen(false)} />}
            {feat('inventory') && <NavItem icon={<Package className="w-4 h-4" />} label="Inventory" href="/dashboard/inventory" active={pathname === '/dashboard/inventory'} onClick={() => setSidebarOpen(false)} />}
            {feat('staff') && <NavItem icon={<Users className="w-4 h-4" />} label="Staff" href="/dashboard/staff" active={pathname === '/dashboard/staff'} onClick={() => setSidebarOpen(false)} />}
          </NavGroup>
        )}

        <NavGroup label="System">
          <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" href="/dashboard/settings" active={pathname === '/dashboard/settings'} onClick={() => setSidebarOpen(false)} />
        </NavGroup>
      </nav>

      {/* User footer */}
      <div className="pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/[0.06] transition-colors cursor-pointer group" onClick={() => { router.push('/dashboard/settings'); setSidebarOpen(false) }}>
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-white truncate">{userName}</div>
            <div className="text-[10px] text-white/30 truncate capitalize">{role.replace('_', ' ')}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleSignOut() }}
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden font-work-sans selection:bg-brand-orange/20 selection:text-brand-orange">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: always visible | mobile: drawer) ── */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-64 bg-brand-dark flex flex-col border-r border-white/[0.06] shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Mobile close button */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-brand-cream min-w-0">

        {/* Top header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-black/[0.06] bg-brand-sand/80 backdrop-blur-xl shrink-0 gap-3">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl bg-white border border-black/[0.07] text-gray-500 hover:text-gray-800 transition-colors shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-black/[0.07] rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all"
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-black/[0.07] rounded-xl cursor-pointer hover:border-brand-orange/30 transition-colors group">
              <Calendar className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-orange transition-colors" />
              <span className="text-sm font-medium text-gray-600">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <button className="relative p-2 bg-white border border-black/[0.07] rounded-xl text-gray-500 hover:text-brand-orange hover:border-brand-orange/30 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-orange rounded-full ring-1 ring-brand-sand" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-4 first:pt-0">
      <p className="px-3 mb-1.5 text-[9px] font-bold text-white/20 uppercase tracking-[0.15em]">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItem({ icon, label, href, active = false, onClick }: { icon: React.ReactNode; label: string; href?: string; active?: boolean; onClick?: () => void }) {
  const className = cn(
    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group',
    active
      ? 'bg-brand-orange text-black shadow-[0_4px_12px_rgba(245,124,0,0.3)]'
      : 'text-white/40 hover:bg-white/[0.06] hover:text-white/80'
  )

  const content = (
    <>
      <span className={cn('transition-transform duration-200 shrink-0', !active && 'group-hover:scale-110')}>{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />}
    </>
  )

  if (href) return <Link href={href} className={className} onClick={onClick}>{content}</Link>
  return <button className={className} onClick={onClick}>{content}</button>
}
