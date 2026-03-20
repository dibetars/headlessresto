import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export default function KDSPage() {
  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      <LandingNav />
      
      {/* Hero Section with Video */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105">
            <source src="/header4.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-4">Kitchen Intelligence</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
            The Ultimate <br />
            <span className="text-brand-orange">KDS System</span>
          </h1>
        </div>
      </div>

      <div className="pb-32 px-6 -mt-24 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white/80 backdrop-blur-3xl p-12 md:p-20 rounded-[64px] border border-slate-100 shadow-2xl space-y-20">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic leading-tight">Streamlined Operations</h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Our Kitchen Display System (KDS) is designed to handle the most intense restaurant environments. 
                Reduce ticket times and eliminate order errors with a unified view of your kitchen operations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Real-Time Sync</h3>
                <p className="text-slate-500 leading-relaxed text-lg">Orders are pushed instantly from POS or mobile devices to the kitchen display.</p>
              </div>

              <div className="group p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Custom Workflows</h3>
                <p className="text-slate-500 leading-relaxed text-lg">Configure routing based on preparation stations, priority, and order type.</p>
              </div>

              <div className="group p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Performance Metrics</h3>
                <p className="text-slate-500 leading-relaxed text-lg">Track preparation times and bottlenecks to optimize kitchen performance.</p>
              </div>

              <div className="group p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4">Offline Resilient</h3>
                <p className="text-slate-500 leading-relaxed text-lg">The KDS continues to function even if the internet connection is interrupted.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <LandingFooter />
    </main>
  );
}
