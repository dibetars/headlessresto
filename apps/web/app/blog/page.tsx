"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User } from "lucide-react";

export default function BlogPage() {
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
              src="/Source/media/header4.mp4"
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
                ● Latest Updates
              </div>
              <h1 className="text-5xl md:text-7xl font-medium uppercase tracking-tighter mb-8 text-white">
                Restaurant Insights
              </h1>
              <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Expert tips on restaurant management, technology, and operations.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#0a0a0a]">
          <div className="container px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "How to optimize your KDS for peak hours",
                  date: "March 15, 2026",
                  author: "Alex Thompson",
                  image: "/Source/media/3.png"
                },
                {
                  title: "The future of QR ordering in dining",
                  date: "March 10, 2026",
                  author: "Sarah Chen",
                  image: "/Source/media/4.png"
                },
                {
                  title: "Staff management: Reducing turnover with tech",
                  date: "March 5, 2026",
                  author: "Michael Ross",
                  image: "/Source/media/3.png"
                }
              ].map((post, idx) => (
                <div key={idx} className="group bg-white/[0.02] border border-white/[0.05] rounded-[32px] overflow-hidden hover:bg-white/[0.04] transition-all duration-500">
                  <div className="relative aspect-video overflow-hidden">
                    <Image src={post.image} alt={post.title} fill className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-white/30">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.date}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                    </div>
                    <h3 className="text-2xl font-medium uppercase tracking-tighter text-white group-hover:text-brand-orange transition-colors leading-tight">
                      {post.title}
                    </h3>
                  </div>
                </div>
              ))}
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
