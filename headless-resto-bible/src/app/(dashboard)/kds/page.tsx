import { getOrders } from '@/actions/orders';
import KDSGrid from './components/KDSGrid';

export default async function KDSPage() {
  const orders = await getOrders();
  
  // Filter for active orders
  const activeOrders = orders.filter(
    (order) => order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kitchen Display System (KDS)</h1>
          <p className="text-sm text-gray-500">Live view of active orders for the kitchen staff</p>
        </div>
        <div className="flex space-x-2">
           <div className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {activeOrders.filter(o => o.status === 'pending').length} New
          </div>
          <div className="flex items-center bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-200">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            {activeOrders.filter(o => o.status === 'preparing').length} Preparing
          </div>
          <div className="flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {activeOrders.filter(o => o.status === 'ready').length} Ready
          </div>
        </div>
      </div>
      
      <KDSGrid initialOrders={activeOrders} />
    </div>
  );
}
