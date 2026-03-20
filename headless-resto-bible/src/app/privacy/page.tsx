import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export default function PrivacyPage() {
  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      <LandingNav />
      
      {/* Hero Section with Video */}
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105">
            <source src="/header5.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-4">Privacy First</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
            Privacy <span className="text-brand-orange">Policy</span>
          </h1>
        </div>
      </div>

      <div className="pb-32 px-6 -mt-12 relative z-20">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/80 backdrop-blur-3xl p-12 md:p-20 rounded-[64px] border border-slate-100 shadow-2xl space-y-12">
            <div className="prose prose-slate lg:prose-xl max-w-none">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-8">Data Security is our top priority</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                At HeadlessResto, we are committed to protecting your personal data and your customers' information. 
                This policy explains how we collect, use, and safeguard your information.
              </p>
              
              <div className="space-y-12 mt-16">
                <section>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4 flex items-center space-x-3">
                    <span className="w-8 h-8 bg-brand-orange/10 text-brand-orange rounded-lg flex items-center justify-center text-sm not-italic">01</span>
                    <span>What we collect</span>
                  </h3>
                  <p className="text-slate-500 font-medium pl-11">
                    We collect information you provide to us when you sign up, such as your name, email address, and restaurant details. 
                    We also collect usage data to improve our platform and services.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4 flex items-center space-x-3">
                    <span className="w-8 h-8 bg-brand-blue/10 text-brand-blue rounded-lg flex items-center justify-center text-sm not-italic">02</span>
                    <span>How we use it</span>
                  </h3>
                  <p className="text-slate-500 font-medium pl-11">
                    Your information is used to provide the services you request, communicate with you about updates, and maintain the security of our systems. 
                    We do not sell your data to third parties.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4 flex items-center space-x-3">
                    <span className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center text-sm not-italic">03</span>
                    <span>Your Rights</span>
                  </h3>
                  <p className="text-slate-500 font-medium pl-11">
                    You have the right to access, correct, or delete your personal information at any time. 
                    If you have any questions or concerns, please contact our support team.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <LandingFooter />
    </main>
  );
}
