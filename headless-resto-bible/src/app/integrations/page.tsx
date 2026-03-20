import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export default function IntegrationsPage() {
  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      <LandingNav />
      
      {/* Hero Section with Video */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105">
            <source src="/header3.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-4">Seamless Workflow</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
            Everything <span className="text-brand-orange">Integrates</span>
          </h1>
        </div>
      </div>

      <div className="pb-32 px-6 -mt-24 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white/80 backdrop-blur-3xl p-12 md:p-20 rounded-[64px] border border-slate-100 shadow-2xl space-y-20">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 uppercase italic">Connected Ecosystem</h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                HeadlessResto is built to be the central hub of your restaurant operations. 
                Our platform integrates seamlessly with your favorite tools.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: 'Payments', desc: 'Stripe, Square, PayPal, and local payment gateways.', icon: '💳' },
                { title: 'Delivery', desc: 'DoorDash, UberEats, and GrubHub via unified order management.', icon: '🚗' },
                { title: 'Accounting', desc: 'QuickBooks, Xero, and other financial tools.', icon: '📊' },
                { title: 'Marketing', desc: 'Mailchimp, HubSpot, and custom loyalty programs.', icon: '✉️' }
              ].map((item, i) => (
                <div key={i} className="group p-12 rounded-[48px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-blue/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic group-hover:text-brand-blue transition-colors">{item.title}</h3>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-[48px] p-12 text-center space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/10 to-brand-blue/10 opacity-50"></div>
              <h3 className="text-2xl font-black text-white uppercase italic relative z-10">Need a custom integration?</h3>
              <p className="text-slate-400 font-medium relative z-10">Our open API allows you to build custom connections for your unique workflow.</p>
              <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all relative z-10">
                View API Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <LandingFooter />
    </main>
  );
}
