import Link from 'next/link';
import { ChefHat, Package, Calendar, Tag } from 'lucide-react';

const CARDS = [
  { href: '/dashboard/kitchen/menu', label: 'Menu Items', icon: ChefHat, desc: 'Manage your menu, prices, and availability' },
  { href: '/dashboard/kitchen/daily-menu', label: 'Daily Menu', icon: Calendar, desc: "Build and publish today's menu" },
  { href: '/dashboard/kitchen/stock', label: 'Stock', icon: Package, desc: 'Track inventory and record movements' },
  { href: '/dashboard/kitchen/coupons', label: 'Coupons', icon: Tag, desc: 'Create and manage discount codes' },
];

export default function KitchenPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kitchen</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-brand-300 transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition">
                <Icon size={20} className="text-brand-600" />
              </div>
              <h2 className="font-semibold text-gray-800">{label}</h2>
            </div>
            <p className="text-sm text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
