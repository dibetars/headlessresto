import { createClient } from '@/lib/supabase/server';
import AddRestaurantButton from './components/AddRestaurantButton';
import RestaurantActions from './components/RestaurantActions';
import { redirect } from 'next/navigation';
import EmptyState from '../components/EmptyState';

export default async function RestaurantsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is super_admin
  const { data: staff } = await supabase
    .from('staff')
    .select('role')
    .eq('id', user.id)
    .single();

  if (staff?.role !== 'super_admin') {
    redirect('/dashboard');
  }

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
            Managed <span className="text-brand-orange underline decoration-brand-orange/20">Restaurants</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Platform-wide establishment directory.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            Export List
          </button>
          <AddRestaurantButton />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {!restaurants || restaurants.length === 0 ? (
          <EmptyState 
            title="No Restaurants" 
            description="The platform establishment directory is currently empty. Start by adding a new restaurant."
            icon="🏢"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Restaurant</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                          🍽️
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tight">{restaurant.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                      {restaurant.email}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                      {restaurant.address || 'N/A'}
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-400 font-medium">
                      {new Date(restaurant.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      <RestaurantActions id={restaurant.id} currentStatus={restaurant.status || 'pending'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}