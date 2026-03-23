"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-work-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
        <div className="flex h-14 items-center bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-[24px] shadow-2xl px-3 gap-2">
          <Link href="/" className="flex items-center pl-3 pr-4 group cursor-pointer shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2 text-white/60 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">Back Home</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 z-0">
            <video
              src="/Source/media/header5.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 object-cover w-full h-full opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          </div>

          <div className="container relative z-10 px-6">
            <div className="flex flex-col items-center text-center max-w-[800px] mx-auto">
              <div className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.4em] mb-6">
                ● Your Privacy
              </div>
              <h1 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter mb-8 text-white">
                Privacy Policy
              </h1>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background">
          <div className="container px-6 max-w-4xl mx-auto">
            <div className="space-y-12 text-white/60 text-lg leading-relaxed">
              <div className="space-y-6">
                <h2 className="text-3xl font-medium uppercase tracking-tighter text-white">
                  1. Information Collection
                </h2>
                <p>
                  We collect information necessary to provide our restaurant management services. This includes restaurant details, contact information, and usage data.
                </p>
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-medium uppercase tracking-tighter text-white">
                  2. Use of Information
                </h2>
                <p>
                  Your data is used to operate and improve our platform. We never sell your personal information or your restaurant's business data to third parties.
                </p>
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-medium uppercase tracking-tighter text-white">
                  3. Data Security
                </h2>
                <p>
                  We implement industry-standard security measures to protect your data. All communication is encrypted, and sensitive information is stored securely.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-24 border-t border-black/[0.05] text-slate-900">
        <div className="container px-6 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-300">
            © {new Date().getFullYear()} HeadlessResto Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
