'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const PricingSection = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPlans() {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (data) {
        setPlans(data);
      }
    }
    fetchPlans();
  }, [supabase]);

  if (plans.length === 0) return null;

  return (
    <section id="pricing" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.3em]">Plans</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Flexible plans: <span className="text-brand-blue">choose features</span> <br />
            and get connected
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={plan.id} 
              className={`relative p-12 rounded-[56px] border border-slate-100 shadow-2xl transition-all duration-500 hover:-translate-y-4 group ${
                plan.is_dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-orange text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-orange/20">
                  Most Popular
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <h3 className={`text-xl font-black ${plan.is_dark ? 'text-white/60' : 'text-slate-400'}`}>{plan.name}</h3>
                  <div className="mt-4 flex items-baseline space-x-3">
                    <span className="text-5xl font-black text-brand-orange">{plan.price}</span>
                    <span className={`text-xl line-through ${plan.is_dark ? 'text-white/40' : 'text-slate-300'}`}>{plan.old_price}</span>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-900 px-3 py-1 rounded-full uppercase tracking-widest">{plan.save_label}</span>
                  </div>
                </div>

                <button className={`w-full py-6 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 shadow-2xl ${
                  plan.is_dark ? 'bg-gradient-to-r from-brand-orange to-brand-orange-light text-white shadow-brand-orange/40 hover:scale-105' : 'bg-brand-blue text-white shadow-brand-blue/20 hover:bg-brand-blue-dark hover:scale-105'
                }`}>
                  <span>Select this plan</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </button>

                <div className="space-y-6 pt-8 border-t border-slate-100/10">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${plan.is_dark ? 'text-white/40' : 'text-slate-400'}`}>The basic plan includes:</p>
                  <ul className="space-y-4">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-3 group/item">
                        <svg className={`w-5 h-5 ${plan.is_dark ? 'text-brand-orange' : 'text-brand-blue'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className={`text-sm font-medium tracking-tight group-hover/item:translate-x-2 transition-transform duration-300 ${plan.is_dark ? 'text-white/80' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-[120px] -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[150px]"></div>
    </section>
  );
};

export default PricingSection;
