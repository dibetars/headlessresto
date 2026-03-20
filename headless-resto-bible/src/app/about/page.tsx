import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      <LandingNav />
      
      {/* Hero Section with Video */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105">
            <source src="/header2.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Building the <br />
            <span className="text-brand-orange">Future of Hospitality</span>
          </h1>
        </div>
      </div>

      <div className="pb-32 px-6 -mt-24 relative z-20">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white/80 backdrop-blur-3xl p-12 md:p-20 rounded-[64px] border border-slate-100 shadow-2xl space-y-16">
            <div className="prose prose-slate lg:prose-xl max-w-none">
              <p className="text-2xl text-slate-900 font-black italic uppercase tracking-tight leading-snug mb-8">
                HeadlessResto was founded with a simple mission: to give restaurant owners their time back. 
              </p>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                In an industry where margins are thin and the pace is relentless, we believe technology should be a multiplier, not a burden.
                We've built a "headless" operating system that separates the complexity of management from the experience of dining. 
              </p>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Whether you're running a single high-end bistro or a global chain of fast-casual spots, 
                HeadlessResto provides the infrastructure to scale without the friction.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: 'Efficiency First', desc: 'Every feature we build is measured by how many seconds it saves a chef, a server, or an owner.', icon: '⚡' },
                { title: 'Fair Pricing', desc: 'No per-order fees. Ever. We believe you should keep the profits from the food you create.', icon: '💰' },
                { title: 'Offline-Ready', desc: 'The internet goes down. Your kitchen shouldn\'t. Our system is designed to work regardless of connectivity.', icon: '📡' },
                { title: 'Developer Friendly', desc: 'Built with modern APIs and webhooks, allowing you to integrate with any tool in your stack.', icon: '🛠️' }
              ].map((item, i) => (
                <div key={i} className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-orange/20 hover:shadow-xl transition-all duration-500 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4 group-hover:text-brand-orange transition-colors">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <LandingFooter />
      
      {/* Background Accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[150px] -z-10"></div>
    </main>
  );
}
