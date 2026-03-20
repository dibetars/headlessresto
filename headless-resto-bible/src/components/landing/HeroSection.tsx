
'use client';

import React from 'react';
import Link from 'next/link';
import LeadForm from './LeadForm';

const HeroSection = () => {
  const [videoSrc, setVideoSrc] = React.useState('/header.mp4');

  React.useEffect(() => {
    const videos = [
      '/header.mp4',
      '/header2.mp4',
      '/header3.mp4',
      '/header4.mp4',
      '/header5.mp4',
      '/header6.mp4',
      '/header7.mp4'
    ];
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    setVideoSrc(randomVideo);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-900/40 z-10 backdrop-blur-[2px]"></div>
        <video 
          key={videoSrc}
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover blur-[4px] scale-105"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000 text-left">
            <p className="text-sm font-black text-white uppercase tracking-[0.4em]">The New Standard</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
              More time for <br />
              guests — not for <br />
              management
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed">
              HeadlessResto: Your all-in-one operating system for high-performance restaurants. 
              Automate your kitchen, orders, and staff with zero per-order fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/demo" 
                className="group px-10 py-5 bg-brand-orange text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-brand-orange-light hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-orange/20 flex items-center justify-center gap-3"
              >
                Start Interactive Demo
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </Link>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[48px] border border-white/20 shadow-2xl animate-in fade-in slide-in-from-right-10 duration-1000 delay-300">
            <LeadForm 
              type="consultation"
              buttonText="Schedule a consultation"
              showPhone={true}
              showEmail={false}
              showMessage={false}
              variant="light"
            />
          </div>
        </div>
      </div>

        {/* Floating Elements Accent */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-orange/20 rounded-full blur-[120px] z-10 animate-pulse"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-blue/30 rounded-full blur-[120px] z-10 animate-pulse delay-700"></div>
    </section>
  );
};

export default HeroSection;
