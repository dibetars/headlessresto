
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LandingNavProps {
  variant?: 'light' | 'dark';
}

const LandingNav = ({ variant = 'dark' }: LandingNavProps) => {
  const isLight = variant === 'light';
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 py-6 backdrop-blur-2xl border-b mx-auto max-w-[1400px] mt-6 rounded-[32px] shadow-2xl transition-all duration-500 ${
      isLight 
        ? 'bg-white/80 border-slate-200/50 shadow-slate-200/50' 
        : 'bg-white/10 border-white/10 shadow-black/10'
    }`}>
      <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
        <Image 
          src="/favicon.png" 
          alt="HeadlessResto Logo" 
          width={40} 
          height={40} 
          className={`h-10 w-auto transition-transform group-hover:scale-105 duration-500 ${!isLight ? 'brightness-0 invert' : ''}`}
        />
        <p className={`text-2xl font-black tracking-tighter italic uppercase group-hover:text-brand-orange transition-colors duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Headless<span className={`text-brand-orange group-hover:text-brand-blue transition-colors duration-300 ${isLight ? '' : 'group-hover:text-white'}`}>Resto</span>
        </p>
      </Link>
      <div className="hidden md:flex items-center space-x-10">
        <Link href="/demo" className="text-sm font-black text-brand-orange hover:text-brand-blue uppercase tracking-[0.2em] transition-all duration-300 underline decoration-brand-orange/40 underline-offset-8">Live Demo</Link>
        <Link href="/#features" className={`text-sm font-black hover:text-brand-orange uppercase tracking-[0.2em] transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white'}`}>Features</Link>
        <Link href="/#pricing" className={`text-sm font-black hover:text-brand-orange uppercase tracking-[0.2em] transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white'}`}>Pricing</Link>
        <Link href="/contact" className={`text-sm font-black hover:text-brand-orange uppercase tracking-[0.2em] transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white'}`}>Contact</Link>
      </div>
      <div className="flex items-center space-x-6">
        <Link href="/auth/login" className={`hidden md:block text-sm font-black hover:text-brand-orange uppercase tracking-[0.2em] transition-all duration-300 ${isLight ? 'text-slate-600' : 'text-white'}`}>Sign In</Link>
        <Link href="/auth/signup" className="px-8 py-4 font-black text-xs text-white bg-brand-orange rounded-2xl hover:bg-brand-orange-light hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-[0.2em] shadow-xl shadow-brand-orange/20">
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default LandingNav;
