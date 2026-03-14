'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChefHat,
  Users,
  ShoppingBag,
  Truck,
  DollarSign,
  Settings,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { createClient } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { canAccessModule, type UserRole } from '@restaurantos/shared';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3, module: null },
  { href: '/dashboard/kitchen', label: 'Kitchen', icon: ChefHat, module: 'kitchen' },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag, module: 'orders' },
  { href: '/dashboard/deliveries', label: 'Deliveries', icon: Truck, module: 'deliveries' },
  { href: '/dashboard/staff', label: 'Staff', icon: Users, module: 'staff' },
  { href: '/dashboard/finances', label: 'Finances', icon: DollarSign, module: 'finances' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, module: 'settings' },
] as const;

interface Props {
  userRole: UserRole;
  orgName: string;
}

export function Sidebar({ userRole, orgName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-gray-700">
        <p className="text-xs text-gray-400 uppercase tracking-wider">RestaurantOS</p>
        <p className="font-semibold text-sm mt-0.5 truncate">{orgName}</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, module }) => {
          if (module && !canAccessModule(userRole, module as any)) return null;
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
