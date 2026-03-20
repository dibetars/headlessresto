import React from 'react';

const CtaBlock = () => {
  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-slate-900 rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden group">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 animate-pulse delay-700"></div>

          <div className="relative z-10 space-y-10">
            <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em]">Get Started</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-none max-w-4xl mx-auto">
              Ready to build the <br />
              <span className="text-brand-orange">Future of your Restaurant?</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Join the new standard of hospitality. Automate your operations, 
              increase your margins, and focus on what matters most: your guests.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <button className="px-12 py-6 bg-brand-orange text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-orange/40 hover:scale-105 active:scale-95 transition-all">
                Create your account
              </button>
              <button className="px-12 py-6 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all">
                Book a demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBlock;
