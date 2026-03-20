'use client';

import { MenuItem } from '@/lib/types';
import { useState } from 'react';
import { createOrder } from '@/actions/orders';
import { createCheckoutSession } from '@/actions/payments';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function PublicMenu({ 
  menuItems, 
  tableNumber,
  tableId 
}: { 
  menuItems: MenuItem[]; 
  tableNumber: string;
  tableId: string;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [placedOrders, setPlacedOrders] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    try {
      const order = await createOrder({
        table_id: tableId,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total
      });
      setPlacedOrders(prev => [order, ...prev]);
      setCart([]);
      setOrderStatus('success');
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderStatus('error');
    } finally {
      setIsOrdering(false);
    }
  };

  const handlePayment = async (amount: number, orderId: string) => {
    try {
      const { url } = await createCheckoutSession(amount, orderId);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Could not initiate payment. Please ask a staff member for assistance.');
    }
  };

  if (orderStatus === 'success') {
    const latestOrder = placedOrders[0];
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-sm w-full">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Order Placed!</h1>
          <p className="text-gray-600 mb-6">Our kitchen has received your order for Table {tableNumber}.</p>
          
          <div className="bg-brand-blue/5 p-4 rounded-xl mb-6 border border-brand-blue/10">
            <p className="text-sm font-bold text-brand-blue mb-1 uppercase tracking-widest">Amount Due</p>
            <p className="text-3xl font-black text-slate-900">${latestOrder.total.toFixed(2)}</p>
            <button 
              onClick={() => handlePayment(latestOrder.total, latestOrder.id)}
              className="w-full mt-4 bg-brand-blue text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-blue-dark transition-colors shadow-lg shadow-brand-blue/20"
            >
              Pay Now with Card
            </button>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setOrderStatus('idle')}
              className="w-full bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Order More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b sticky top-0 z-10 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Table {tableNumber}</h1>
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Scanning Active
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {placedOrders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-brand-orange rounded-full mr-2 animate-pulse"></span>
              Your Active Orders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {placedOrders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-xl border border-brand-orange/20 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-gray-500">#{order.id.slice(0, 8)}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                      order.status === 'preparing' ? 'bg-blue-50 text-blue-600' :
                      order.status === 'ready' ? 'bg-green-50 text-green-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.quantity}x {item.menu_item?.name || 'Item'}</span>
                      </div>
                    ))}
                  </div>
                  {order.status !== 'completed' && (
                    <button 
                      onClick={() => handlePayment(order.total, order.id)}
                      className="w-full py-2 bg-brand-blue/10 text-brand-blue rounded-lg text-xs font-black uppercase tracking-widest hover:bg-brand-blue/20 transition-colors"
                    >
                      Pay Now (${Number(order.total).toFixed(2)})
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Our Menu</h2>
          <p className="text-gray-600">Select items to add to your order</p>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar -mx-4 px-4 space-x-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-sm transition-all ${
                selectedCategory === category 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-4 flex flex-col h-full hover:shadow-md transition-shadow">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-grow">{item.description}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t">
                <span className="text-xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                <div className="flex items-center space-x-3">
                  {cart.find(i => i.id === item.id) ? (
                    <>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-600"
                      >
                        -
                      </button>
                      <span className="font-bold text-gray-800">{cart.find(i => i.id === item.id)?.quantity}</span>
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => addToCart(item)}
                      className="px-4 py-1.5 rounded-lg bg-gray-800 text-white font-bold text-sm hover:bg-gray-900 transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {cart.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-gray-600 font-medium">{itemCount} items in cart</span>
              <span className="text-xl font-bold text-gray-900">Total: ${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handlePlaceOrder}
              disabled={isOrdering}
              className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isOrdering ? 'Placing Order...' : 'Place Order Now'}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
