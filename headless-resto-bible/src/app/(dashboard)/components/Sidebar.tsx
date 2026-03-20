import Link from 'next/link';
import Image from 'next/image';
import { signout } from '@/actions/auth';

const platformAdminLinks = [
  { href: '/dashboard', label: 'Platform Overview', roles: ['super_admin'] },
  { href: '/dashboard/leads', label: 'Inbound Leads', roles: ['super_admin'] },
  { href: '/dashboard/waitlist', label: 'Waitlist', roles: ['super_admin'] },
  { href: '/dashboard/restaurants', label: 'Restaurants', roles: ['super_admin'] },
  { href: '/staff', label: 'Platform Staff', roles: ['super_admin'] },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', roles: ['super_admin'] },
  { href: '/dashboard/platform-revenue', label: 'Platform Revenue', roles: ['super_admin'] },
  { href: '/dashboard/profile', label: 'My Profile', roles: ['super_admin'] },
];

const restaurantLinks = [
  { href: '/dashboard', label: 'Dashboard', roles: ['owner', 'manager', 'chef', 'waitstaff'] },
  { href: '/orders', label: 'Orders', roles: ['owner', 'manager', 'chef', 'waitstaff'] },
  { href: '/kds', label: 'Kitchen (KDS)', roles: ['owner', 'manager', 'chef'] },
  { href: '/menu', label: 'Menu', roles: ['owner', 'manager'] },
  { href: '/tables', label: 'Tables', roles: ['owner', 'manager', 'waitstaff'] },
  { href: '/reservations', label: 'Reservations', roles: ['owner', 'manager', 'waitstaff'] },
  { href: '/payments', label: 'Payments', roles: ['owner', 'manager'] },
  { href: '/reporting', label: 'Reporting', roles: ['owner'] },
  { href: '/staff', label: 'Staff Management', roles: ['owner', 'manager'] },
  { href: '/staff/scheduling', label: 'Scheduling', roles: ['owner', 'manager'] },
  { href: '/customers', label: 'Customers', roles: ['owner', 'manager'] },
  { href: '/settings', label: 'Settings', roles: ['owner'] },
  { href: '/profile', label: 'My Profile', roles: ['owner', 'manager', 'chef', 'waitstaff'] },
];

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const links = userRole === 'super_admin' ? platformAdminLinks : restaurantLinks;
  const filteredLinks = links.filter(link => !userRole || link.roles.includes(userRole));

  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-6 mb-4">
        <Link href="/dashboard" className="flex items-center space-x-3 mb-10 px-2 group cursor-pointer">
          <Image 
            src="/favicon.png" 
            alt="HeadlessResto Logo" 
            width={40} 
            height={40} 
            className="h-10 w-auto transition-transform group-hover:scale-105 duration-500 brightness-0 invert"
          />
          <p className="text-xl font-black text-white tracking-tighter italic uppercase group-hover:text-brand-orange transition-colors duration-300">
            Headless<span className="text-brand-orange group-hover:text-white transition-colors duration-300">Resto</span>
          </p>
        </Link>
      </div>
      
      <div className="px-4 mb-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 opacity-80">
          {userRole === 'super_admin' ? 'Platform Nexus' : 'Operations'}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className="group flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 hover:bg-brand-blue/10 hover:text-brand-orange text-slate-400"
          >
            <span className="flex-1 tracking-tight">{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 mt-auto space-y-4">
        <div className="flex items-center space-x-4 p-4 bg-slate-800/40 rounded-3xl border border-white/5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-sm font-black text-brand-orange shadow-lg">
            {userRole?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate capitalize tracking-tight">
              {userRole?.replace('_', ' ')}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {userRole === 'super_admin' ? 'Global Admin' : 'Local Staff'}
            </p>
          </div>
        </div>
        
        <form action={signout}>
          <button className="w-full px-4 py-3 bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center space-x-2 border border-white/5">
            <span>Sign Out</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
