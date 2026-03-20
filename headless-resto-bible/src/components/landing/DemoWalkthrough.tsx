'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DemoWalkthrough = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'customer',
      label: 'The Guest Experience',
      title: 'Zero-Friction QR Ordering',
      description: 'Guests scan a QR code at their table and order instantly. No app downloads, no waiting for staff. Built-in Apple/Google Pay integration for 10-second checkouts.',
      features: ['Instant Menu Access', 'Real-time Item Availability', 'Seamless Mobile Payments'],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      color: 'bg-brand-orange',
      image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'kitchen',
      label: 'The Kitchen Ops',
      title: 'Real-Time KDS Intelligence',
      description: 'Orders hit the kitchen display instantly. Automated routing, priority alerts for late orders, and station-specific views ensure the back-of-house runs like clockwork.',
      features: ['Automated Ticket Routing', 'Late Order Alerts', 'Station Performance Tracking'],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'bg-brand-blue',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'owner',
      label: 'The Investor View',
      title: 'Data-Driven Scalability',
      description: 'The dashboard provides 360° visibility. From labor cost optimization to real-time revenue analytics, HeadlessResto turns operational data into actionable profit.',
      features: ['Real-time ROI Tracking', 'Multi-unit Management', 'Automated Financial Reporting'],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'bg-slate-900',
      image: 'https://images.unsplash.com/photo-1551288049-bbda48336ad9?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <section className="py-32 bg-white overflow-hidden" id="demo">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-20">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-4">Live Ecosystem Demo</p>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
            One Platform. <br />
            <span className="text-brand-blue">Total Control.</span>
          </h2>
          <p className="mt-8 text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            Experience the end-to-end flow that makes HeadlessResto the choice for serious restaurant operators and investors.
          </p>
          <div className="mt-10">
            <a 
              href="/demo" 
              className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-brand-blue hover:scale-105 transition-all shadow-2xl shadow-slate-900/20"
            >
              Launch Interactive Simulator
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`w-full text-left p-8 rounded-[32px] transition-all duration-500 border-2 ${
                  activeStep === index 
                    ? 'bg-slate-50 border-slate-200 shadow-xl' 
                    : 'bg-white border-transparent hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    activeStep === index ? step.color : 'bg-slate-200 text-slate-400'
                  } transition-all duration-500`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${
                      activeStep === index ? 'text-brand-orange' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </p>
                    <h3 className={`text-xl font-black italic uppercase ${
                      activeStep === index ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  {activeStep === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 mt-6 border-t border-slate-200">
                        <p className="text-slate-600 font-medium leading-relaxed mb-6">
                          {step.description}
                        </p>
                        <ul className="space-y-3">
                          {step.features.map((feature, i) => (
                            <li key={i} className="flex items-center text-sm font-bold text-slate-800 uppercase tracking-tight">
                              <span className="w-2 h-2 bg-brand-orange rounded-full mr-3"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          {/* Visual Preview */}
          <div className="lg:col-span-7 relative">
            <div className="aspect-[4/3] rounded-[64px] overflow-hidden bg-slate-100 border-[12px] border-slate-900 shadow-2xl relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={steps[activeStep].image} 
                    alt={steps[activeStep].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                  
                  {/* Floating Metric Card */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20"
                  >
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Metric</p>
                    <p className="text-2xl font-black text-slate-900 italic">
                      {activeStep === 0 ? '14s Avg. Order' : activeStep === 1 ? '-22% Waste' : '+18% Revenue'}
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Background Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoWalkthrough;
