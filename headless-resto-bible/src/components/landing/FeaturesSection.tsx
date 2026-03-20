
import React from 'react';

const features = [
  {
    title: 'Total Brand Control',
    description: 'Customize every pixel of the customer journey. Your brand, your rules. No more platform constraints.',
  },
  {
    title: 'Built for Scale',
    description: 'From a single pop-up to a global franchise, our architecture is designed for growth and reliability.',
  },
  {
    title: 'Radically Open & Free',
    description: 'HeadlessResto is open-source and free forever. No monthly fees, no per-order commissions.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="space-y-4">
            <p className="text-xs font-black text-brand-orange uppercase tracking-[0.3em]">Benefits for guests</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-tight">
              Menu, orders, and <br />
              communication with the <br />
              <span className="text-brand-blue">waiter — all in one app</span>
            </h2>
          </div>
            
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Guests no longer waste time waiting for a waiter or searching for dishes in a printed menu. Just scan the QR code on the table to open the restaurant menu without downloading an app or registering.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shadow-sm group hover:bg-brand-blue hover:text-white transition-all duration-300">
                <span className="text-2xl">💳</span>
                <span className="font-black uppercase tracking-widest text-[10px]">Instant Payment</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shadow-sm group hover:bg-brand-orange hover:text-white transition-all duration-300">
                <span className="text-2xl">🌍</span>
                <span className="font-black uppercase tracking-widest text-[10px]">Multi-language</span>
              </div>
            </div>

            <div className="space-y-6 pt-10 border-t border-slate-100">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight">Real-time Order Tracking</p>
                  <p className="text-sm text-slate-400 font-medium">Guests see exactly when their pizza will be ready.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-10 duration-1000">
            {/* App Mockup Visual */}
            <div className="relative z-10 bg-slate-900 rounded-[64px] p-4 shadow-2xl border-[8px] border-slate-800 max-w-sm mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="bg-white rounded-[48px] overflow-hidden aspect-[9/19] relative">
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1074" 
                  alt="App Interface" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 space-y-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                    <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest">New Order</p>
                    <p className="text-white font-bold">Margherita Pizza</p>
                  </div>
                  <div className="bg-brand-blue p-4 rounded-2xl shadow-xl">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Status</p>
                    <p className="text-white font-bold">Being prepared... 5 mins left</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-blue/30 rounded-full blur-[80px] -z-10 animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
