import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import LeadForm from '@/components/landing/LeadForm';

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      <LandingNav />
      
      {/* Hero Section with Video */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105">
            <source src="/header7.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">Get in Touch</p>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Let's Start a <br />
            <span className="text-brand-orange">Conversation</span>
          </h1>
        </div>
      </div>

      <div className="pb-32 px-6 -mt-24 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info Card */}
            <div className="bg-white/80 backdrop-blur-3xl p-12 md:p-16 rounded-[64px] border border-slate-100 shadow-2xl space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 uppercase italic">Contact Information</h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  Have questions about HeadlessResto? Our team is here to help you optimize your restaurant operations.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-6 group">
                  <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                    📍
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase italic">Our Office</h3>
                    <p className="text-slate-500 font-medium">123 Innovation Drive, Tech City, TC 12345</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 group">
                  <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                    📧
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase italic">Email Us</h3>
                    <p className="text-slate-500 font-medium">hello@headlessresto.com</p>
                    <p className="text-slate-500 font-medium">support@headlessresto.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 group">
                  <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                    📱
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase italic">Call Us</h3>
                    <p className="text-slate-500 font-medium">+1 (555) 123-4567</p>
                    <p className="text-slate-400 text-sm">Mon - Fri, 9am - 6pm EST</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="flex space-x-4">
                  {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                    <a key={social} href="#" className="px-6 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-brand-blue hover:text-white transition-all duration-300">
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="bg-slate-900 p-12 md:p-16 rounded-[64px] shadow-2xl space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-white uppercase italic">Send a Message</h2>
                  <p className="text-slate-400 font-medium">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>

                <LeadForm 
                  type="contact"
                  buttonText="Send Message"
                  showSubject={true}
                  showEmail={true}
                  showMessage={true}
                  variant="dark"
                />
              </div>
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
