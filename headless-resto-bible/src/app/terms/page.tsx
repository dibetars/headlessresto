import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export default function TermsPage() {
  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      <LandingNav />
      
      {/* Hero Section with Video */}
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105">
            <source src="/header6.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-4">Legal Terms</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
            Terms of <span className="text-brand-orange">Service</span>
          </h1>
        </div>
      </div>

      <div className="pb-32 px-6 -mt-12 relative z-20">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/80 backdrop-blur-3xl p-12 md:p-20 rounded-[64px] border border-slate-100 shadow-2xl space-y-12">
            <div className="prose prose-slate lg:prose-xl max-w-none">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-8">User Agreement</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Welcome to HeadlessResto. These terms govern your use of our platform. 
                By signing up or using our services, you agree to these terms.
              </p>
              
              <div className="space-y-12 mt-16">
                {[
                  { title: 'Acceptable Use', desc: 'You agree to use HeadlessResto only for lawful purposes. Any misuse of the platform, including unauthorized access or data scraping, will result in account termination.' },
                  { title: 'Intellectual Property', desc: 'All software, content, and trademarks are the property of HeadlessResto. You are granted a non-exclusive, non-transferable license to use our platform during your subscription period.' },
                  { title: 'Limitation of Liability', desc: 'While we strive to provide the best service possible, we are not liable for any direct or indirect damages resulting from the use or inability to use our platform.' }
                ].map((term, i) => (
                  <section key={i}>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4 flex items-center space-x-3">
                      <span className="w-8 h-8 bg-brand-orange/10 text-brand-orange rounded-lg flex items-center justify-center text-sm not-italic">0{i + 1}</span>
                      <span>{term.title}</span>
                    </h3>
                    <p className="text-slate-500 font-medium pl-11">
                      {term.desc}
                    </p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <LandingFooter />
    </main>
  );
}
