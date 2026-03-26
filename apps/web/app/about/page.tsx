"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white font-work-sans overflow-x-hidden">
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
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 z-0">
            <video
              src="/Source/media/header3.mp4"
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
                ● Our Mission
              </div>
              <h1 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter mb-8 text-white">
                About HeadlessResto
              </h1>
              <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                We're building the infrastructure for the next generation of dining. A unified operating system that empowers restaurant owners to focus on what they do best: hospitality.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#0a0a0a]">
          <div className="container px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-medium uppercase tracking-tighter text-white">
                  Why we exist
                </h2>
                <div className="space-y-6 text-white/60 text-lg leading-relaxed">
                  <p>
                    The restaurant industry is fragmented. Legacy systems don't talk to each other, resulting in manual data entry, missed orders, and frustrated staff.
                  </p>
                  <p>
                    HeadlessResto solves this by providing a single source of truth. One platform for your KDS, POS, delivery integrations, and staff management.
                  </p>
                </div>
              </div>
              <div className="relative aspect-square rounded-[32px] overflow-hidden border border-white/[0.05]">
                <Image 
                  src="/Source/media/4.png" 
                  alt="About HeadlessResto" 
                  fill 
                  className="object-cover opacity-50"
                />
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
