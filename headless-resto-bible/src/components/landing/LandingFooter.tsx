import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WaitlistForm from './WaitlistForm';

const LandingFooter = () => {
  return (
    <footer className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="container mx-auto px-6">
        {/* Waitlist/Newsletter Section */}
        <div className="mb-24 p-12 md:p-16 rounded-[64px] bg-slate-900 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                Ready to <span className="text-brand-orange">scale?</span> <br />
                Join the <span className="text-brand-blue underline decoration-brand-blue/20">waitlist</span>
              </h3>
              <p className="mt-4 text-slate-400 font-medium">Be the first to know about new features and platform updates. No spam, just progress.</p>
            </div>
            <div className="w-full max-w-md">
              <WaitlistForm />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
              <Image 
                src="/logo_landscape.png" 
                alt="HeadlessResto Logo" 
                width={180} 
                height={40} 
                className="h-10 w-auto transition-transform group-hover:scale-105 duration-500"
              />
            </Link>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
              The modern standard for restaurant automation. Built for scale, designed for simplicity, and committed to your success.
            </p>
            <div className="flex space-x-4">
              {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-orange hover:border-brand-orange/30 hover:shadow-lg transition-all">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-current rounded-sm opacity-20"></div>
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/#features" className="text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">Pricing</Link></li>
              <li><Link href="/kds-system" className="text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">KDS System</Link></li>
              <li><Link href="/integrations" className="text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">Integrations</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">© 2026 HeadlessResto, Inc. All rights reserved.</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status: All systems operational</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
