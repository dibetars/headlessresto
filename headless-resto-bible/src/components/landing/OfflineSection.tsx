import React from 'react';

const OfflineSection = () => {
  return (
    <section className="py-32 bg-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <p className="text-xs font-black text-brand-orange uppercase tracking-[0.3em]">Resilience</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic uppercase leading-tight">
              Never Miss <span className="text-brand-orange">an Order</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
              Our offline-first architecture means your business keeps running, even when your internet isn't. 
              Orders, payments, and kitchen tickets are all processed locally and sync to the cloud 
              the moment you're back online.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">📡</div>
                <div>
                  <p className="font-black text-white uppercase italic text-sm">Local Sync</p>
                  <p className="text-xs text-slate-500">Peer-to-peer data mesh</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">🔋</div>
                <div>
                  <p className="font-black text-white uppercase italic text-sm">Zero Downtime</p>
                  <p className="text-xs text-slate-500">Continuous operation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Visual representation of offline sync */}
            <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[64px] border border-white/10 relative z-10 overflow-hidden group">
              <div className="flex justify-between items-center mb-12">
                <div className="w-16 h-16 bg-brand-orange rounded-3xl flex items-center justify-center text-3xl shadow-2xl shadow-brand-orange/40 animate-pulse">
                  🍽️
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-brand-orange to-brand-blue mx-8 relative">
                  <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
                <div className="w-16 h-16 bg-brand-blue rounded-3xl flex items-center justify-center text-3xl shadow-2xl shadow-brand-blue/40">
                  ☁️
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-white/10 rounded-full"></div>
                <div className="h-4 w-1/2 bg-white/10 rounded-full"></div>
                <div className="h-4 w-5/6 bg-white/10 rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 via-transparent to-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>
            
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-orange/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfflineSection;
