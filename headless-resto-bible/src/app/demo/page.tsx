'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { MenuItem } from '@/lib/types';

// Mock Data for Demo
const DEMO_MENU: MenuItem[] = [
  { id: '1', name: 'Signature Truffle Burger', price: 18.50, description: 'Aged beef, black truffle aioli, caramelized onions.', category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
  { id: '2', name: 'Hand-Cut Parmesan Fries', price: 6.00, description: 'Double-fried, 24-month aged parmesan, rosemary.', category: 'Sides', imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&q=80&w=400' },
  { id: '3', name: 'Yuzu Craft Lemonade', price: 4.50, description: 'Fresh yuzu, mint, sparkling spring water.', category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400' },
];

export default function DemoPage() {
  const [step, setStep] = useState(0); // 0: Intro, 1: Guest, 2: Kitchen, 3: Manager
  const [guestSubStep, setGuestSubStep] = useState<'menu' | 'checkout' | 'success'>('menu');
  const [cart, setCart] = useState<{item: MenuItem, qty: number}[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [revenue, setRevenue] = useState(1450.50);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const total = cart.reduce((acc: number, curr) => acc + (curr.item.price * curr.qty), 0);

  const nextStep = () => {
    setStep((s: number) => {
      const next = s + 1;
      // Reset guest sub-step and cart when moving away from guest step (1 -> 2)
      if (s === 1) {
        setGuestSubStep('menu');
        setCart([]);
      }
      return next;
    });
  };

  const NARRATIONS = [
    {
      title: "Experience the Future",
      description: "We've built a zero-friction ecosystem. Start the tour to see how it works from guest to owner.",
      insight: "Friction is the enemy of revenue. Our stack removes it entirely."
    },
    {
      title: "The Guest Experience",
      description: "Scanning the QR code opens the menu instantly. No app required. Apple Pay & Google Pay are baked in for zero-friction conversion.",
      insight: "Average ticket size increases by 18% through automated upsells and high-quality visual browsing."
    },
    {
      title: "Kitchen Intelligence",
      description: "The moment the order is placed, it hits the KDS. No paper tickets. Real-time status tracking keeps the front and back of house in perfect sync.",
      insight: "Reduction in order errors and ticket times by 22% leads to higher table turnover and happier guests."
    },
    {
      title: "Owner Insight",
      description: "Data is the real product. Every order flows into real-time analytics, giving owners a 360° view of revenue, labor, and station performance.",
      insight: "SaaS model + Operational Efficiency. We turn restaurants from manual businesses into high-margin data assets."
    }
  ];

  const placeOrder = () => {
    setGuestSubStep('checkout');
    // Simulate Apple Pay processing
    setTimeout(() => {
      const newOrder = {
        id: Math.random().toString(36).slice(2, 8).toUpperCase(),
        items: cart,
        total,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      setOrders([newOrder, ...orders]);
      setGuestSubStep('success');
      setShowNotification(`Order #${newOrder.id} sent to kitchen!`);
      setTimeout(() => setShowNotification(null), 5000);
    }, 2000);
  };

  const completeOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'ready', prepProgress: 100 } : o));
    setShowNotification(`Order #${id.slice(0,4)} is ready for pickup!`);
    setTimeout(() => {
      setRevenue(prev => prev + total);
      nextStep();
      setShowNotification(null);
    }, 2000);
  };

  const toggleItemDone = (orderId: string, itemIdx: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newItems = [...o.items];
        newItems[itemIdx] = { ...newItems[itemIdx], done: !newItems[itemIdx].done };
        const doneCount = newItems.filter(i => i.done).length;
        const progress = Math.round((doneCount / newItems.length) * 100);
        return { ...o, items: newItems, prepProgress: progress };
      }
      return o;
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <LandingNav variant="light" />
      
      {/* Global Notifications */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-4 shadow-2xl border border-white/10"
          >
            <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></div>
            {showNotification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-48 pb-32 container mx-auto px-6">
        {/* Progress Bar */}
        {step > 0 && (
          <div className="max-w-4xl mx-auto mb-20 flex gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: step >= s ? '100%' : '0%' }}
                  className={`h-full ${step >= s ? (s === 1 ? 'bg-brand-orange' : s === 2 ? 'bg-brand-blue' : 'bg-slate-900') : ''}`}
                />
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto text-center py-20"
            >
              <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-6">Interactive Simulation</p>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-8">
                Experience the <br />
                <span className="text-brand-blue">Future of Food</span>
              </h1>
              <p className="text-xl text-slate-600 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Take a 2-minute guided tour through the entire HeadlessResto ecosystem. 
                From the guest's first tap to the owner's final report.
              </p>
              <button 
                onClick={nextStep}
                className="bg-slate-900 text-white px-12 py-6 rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-brand-blue hover:scale-105 transition-all shadow-2xl shadow-slate-900/20"
              >
                Start Real-Time Demo
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="guest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Narration Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-[40px] border-2 border-brand-orange shadow-xl relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-orange text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">{step}</div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-4">{NARRATIONS[step].title}</h2>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6">
                    {NARRATIONS[step].description}
                  </p>
                  <div className="bg-brand-orange/5 p-6 rounded-3xl border border-brand-orange/10">
                    <p className="text-xs font-black text-brand-orange uppercase tracking-widest mb-2">Investor Insight</p>
                    <p className="text-sm font-bold text-slate-800">{NARRATIONS[step].insight}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Simulator */}
              <div className="lg:col-span-8 flex justify-center">
                <div className="w-[380px] h-[780px] bg-slate-900 rounded-[60px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
                  {/* Phone Header */}
                  <div className="h-14 bg-white flex items-center justify-center border-b">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full"></div>
                  </div>
                  
                  {/* Menu Content */}
                  <div className="flex-1 bg-white overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                      {guestSubStep === 'menu' && (
                        <motion.div 
                          key="menu"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-6 space-y-6"
                        >
                          <div className="flex justify-between items-end mb-4">
                            <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">The Bistro</h3>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Table 12</p>
                            </div>
                          </div>

                          {DEMO_MENU.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 rounded-3xl border border-slate-50 hover:border-slate-100 transition-colors group">
                              <img src={item.imageUrl} className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
                              <div className="flex-1">
                                <h4 className="font-black text-slate-800 uppercase text-sm">{item.name}</h4>
                                <p className="text-[10px] text-slate-400 font-medium mb-2">{item.description}</p>
                                <div className="flex justify-between items-center">
                                  <span className="font-black text-slate-900">${item.price.toFixed(2)}</span>
                                  <button 
                                    onClick={() => {
                                      const existing = cart.find(c => c.item.id === item.id);
                                      if (existing) {
                                        setCart(cart.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
                                      } else {
                                        setCart([...cart, { item, qty: 1 }]);
                                      }
                                    }}
                                    className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black hover:bg-brand-blue transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {guestSubStep === 'checkout' && (
                        <motion.div 
                          key="checkout"
                          initial={{ y: 300, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="absolute inset-0 bg-slate-900/10 flex items-end"
                        >
                          <div className="w-full bg-white rounded-t-[40px] p-8 shadow-2xl">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
                            <div className="flex flex-col items-center text-center">
                              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.96.95-2.06 1.18-3.12.73-1.09-.45-2.01-.48-3.14 0-1.21.52-2.1.27-3.11-.73C4.83 17.5 3.34 11.23 6.13 8.3c1.43-1.48 3.01-1.63 4.14-1.02 1.09.58 1.83.61 2.94 0 1.34-.73 2.7-.6 4.01.7 1.18 1.17 1.8 2.68 1.8 4.2 0 4.11-2.43 7.6-1.97 8.1zm-3.08-14.93c.36-1.46-.5-2.92-1.46-3.79-1.39-1.26-3-1.04-3.52-.96-.08 1.33.68 2.82 1.48 3.61.94 1.05 2.62 1.08 3.5.14z"/></svg>
                              </div>
                              <h4 className="text-xl font-black text-slate-900 uppercase italic mb-2">Apple Pay</h4>
                              <p className="text-sm text-slate-500 font-bold mb-8">Double-click to confirm</p>
                              
                              <div className="w-full space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm font-bold">
                                  <span className="text-slate-400 uppercase tracking-widest">Amount</span>
                                  <span className="text-slate-900">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                  <span className="text-slate-400 uppercase tracking-widest">To</span>
                                  <span className="text-slate-900 italic">The Bistro</span>
                                </div>
                              </div>

                              <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {guestSubStep === 'success' && (
                        <motion.div 
                          key="success"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-8 flex flex-col items-center justify-center h-full text-center"
                        >
                          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Ordered!</h3>
                          <p className="text-slate-500 font-bold mb-8">Your food is being prepared at Table 12.</p>
                          
                          <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Receipt Details</p>
                            <div className="space-y-2">
                              {orders[0]?.items.map((c: any, i: number) => (
                                <div key={i} className="flex justify-between text-xs font-bold text-slate-700">
                                  <span>{c.qty}x {c.item.name}</span>
                                  <span>${(c.item.price * c.qty).toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center font-black text-slate-900">
                                <span className="uppercase text-[10px] tracking-widest">Total Paid</span>
                                <span>${total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={nextStep}
                            className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-blue/20"
                          >
                            See what happens in the kitchen
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && guestSubStep === 'menu' && (
                    <div className="p-6 bg-white border-t shadow-2xl">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black uppercase text-slate-400">Total Due</span>
                        <span className="text-2xl font-black text-slate-900">${total.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={placeOrder}
                        className="w-full py-4 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-orange/20"
                      >
                        Place Order & Pay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="kitchen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Narration Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-[40px] border-2 border-brand-blue shadow-xl relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-blue text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">{step}</div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-4">{NARRATIONS[step].title}</h2>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6">
                    {NARRATIONS[step].description}
                  </p>
                  <div className="bg-brand-blue/5 p-6 rounded-3xl border border-brand-blue/10">
                    <p className="text-xs font-black text-brand-blue uppercase tracking-widest mb-2">Investor Insight</p>
                    <p className="text-sm font-bold text-slate-800">{NARRATIONS[step].insight}</p>
                  </div>
                </div>
              </div>

              {/* KDS View */}
              <div className="lg:col-span-8">
                <div className="bg-slate-900 rounded-[48px] p-8 shadow-2xl min-h-[600px] border-[12px] border-slate-800">
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Kitchen Display</h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-brand-orange text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">Live</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map(order => (
                      <motion.div 
                        key={order.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-6 shadow-xl border-t-[8px] border-brand-blue flex flex-col h-full"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Table 12</p>
                            <h4 className="font-black text-slate-900 uppercase">Order #{order.id.slice(0,4)}</h4>
                          </div>
                          <span className="text-xs font-mono text-brand-blue font-bold">01:42</span>
                        </div>
                        
                        {/* Prep Progress */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preparation</span>
                            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{order.prepProgress || 0}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${order.prepProgress || 0}%` }}
                              className="h-full bg-brand-blue"
                            />
                          </div>
                        </div>

                        <div className="flex-1 space-y-3 mb-6">
                          {order.items.map((c: any, i: number) => (
                            <button 
                              key={i} 
                              onClick={() => toggleItemDone(order.id, i)}
                              className={`w-full flex justify-between items-center p-3 rounded-2xl border-2 transition-all ${
                                c.done 
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-900 line-through opacity-50' 
                                  : 'bg-slate-50 border-transparent text-slate-700 hover:border-slate-200'
                              }`}
                            >
                              <span className="text-sm font-bold">{c.qty}x {c.item.name}</span>
                              {c.done && <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => completeOrder(order.id)}
                          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                            order.status === 'ready' 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-900 text-white hover:bg-brand-blue'
                          }`}
                        >
                          {order.status === 'ready' ? '✅ Completed' : 'Mark as Ready'}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="manager"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Narration Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-900 shadow-xl relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">{step}</div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-4">{NARRATIONS[step].title}</h2>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6">
                    {NARRATIONS[step].description}
                  </p>
                  <div className="bg-slate-900/5 p-6 rounded-3xl border border-slate-900/10">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Investor Insight</p>
                    <p className="text-sm font-bold text-slate-800">{NARRATIONS[step].insight}</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="w-full mt-8 py-4 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-orange/20"
                  >
                    Finish Tour
                  </button>
                </div>
              </div>

              {/* Dashboard View */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-[48px] p-10 shadow-2xl border-2 border-slate-100">
                  <div className="flex justify-between items-center mb-12">
                    <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Performance Hub</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates Enabled</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-20 h-20 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Revenue</p>
                      <motion.p 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-5xl font-black text-slate-900"
                      >
                        ${revenue.toFixed(2)}
                      </motion.p>
                      <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path></svg>
                        +12.4% vs Yesterday
                      </p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Avg. Ticket</p>
                      <p className="text-5xl font-black text-slate-900">$32.14</p>
                      <p className="text-xs font-bold text-brand-orange mt-2">+8.2% vs Industry Avg</p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mb-12">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent Activity</h4>
                    <div className="space-y-4">
                      {orders.map((order, i) => (
                        <motion.div 
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                        >
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-xs font-black text-slate-900">#{order.id.slice(0,4)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 uppercase italic">Order Completed</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Table 12 • {order.items.length} items</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900">${order.total.toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Paid</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Growth Chart Mockup */}
                  <div className="h-48 bg-slate-50 rounded-[32px] border border-slate-100 p-8 relative overflow-hidden">
                    <div className="flex justify-between items-end h-full gap-2">
                      {[40, 65, 45, 80, 55, 90, 100].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-full rounded-t-xl ${i === 6 ? 'bg-brand-blue' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LandingFooter />
    </main>
  );
}
