"use client";

// Trigger recompile
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Zap,
  Menu,
  User,
  Utensils,
  CreditCard,
  Check,
  Phone,
  Mail,
  Building2,
  UtensilsCrossed,
  MonitorPlay,
  QrCode,
  Clock,
  Calculator,
  LayoutDashboard,
  ChefHat
} from "lucide-react";
import { submitLeadAction } from "@/app/auth/actions";

function HeroVideoCarousel() {
  const videos = [
    { src: "/Source/media/header2.mp4", poster: "/Source/media/3.png" },
    { src: "/Source/media/header3.mp4", poster: "/Source/media/3.png" },
    { src: "/Source/media/header4.mp4", poster: "/Source/media/3.png" },
    { src: "/Source/media/header5.mp4", poster: "/Source/media/3.png" },
    { src: "/Source/media/header6.mp4", poster: "/Source/media/3.png" },
    { src: "/Source/media/header7.mp4", poster: "/Source/media/3.png" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Pick a random video on initial mount (page refresh)
    const randomIndex = Math.floor(Math.random() * videos.length);
    setCurrentIndex(randomIndex);

    // Continue to alternate every 8 seconds for visual variety while on the page
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 8000); 
    
    return () => clearInterval(timer);
  }, [videos.length]);

  return (
    <div className="absolute inset-0 z-0">
      {videos.map((video, index) => (
        <video
          key={index}
          src={video.src}
          poster={video.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-70" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

function ModuleCardV2({ icon, title, description, className = "", light = false }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={`p-8 rounded-[32px] border transition-all duration-500 group ${
      light 
        ? 'bg-black/[0.02] border-black/[0.05] hover:bg-black/[0.04] hover:border-brand-orange/20' 
        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-brand-orange/20'
    } ${className}`}>
      <div className="mb-6 text-brand-orange group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h4 className={`text-xl font-medium mb-2 uppercase tracking-tighter transition-colors ${
        light ? 'text-slate-900 group-hover:text-brand-orange' : 'text-white group-hover:text-amber-500'
      }`}>{title}</h4>
      <p className={`font-bold text-xs leading-relaxed uppercase tracking-tight ${
        light ? 'text-slate-500' : 'text-white/30'
      }`}>{description}</p>
    </div>
  );
}

function RestaurantInterestForm({ light = false }: { light?: boolean }) {
  const [formData, setFormData] = useState({
    restaurantName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    const result = await submitLeadAction({ ...formData, source: "homepage" });
    if (result.success) {
      setStatus("success");
      setFormData({ restaurantName: "", contactPerson: "", email: "", phone: "" });
    } else {
      setStatus("error");
    }
  };

  const inputClasses = `w-full ${
    light ? 'bg-black/5 border-black/10 text-slate-900 placeholder-black/20' : 'bg-white/5 border-white/10 text-white placeholder-white/20'
  } rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-orange transition-colors`;
  
  const labelClasses = `text-[10px] font-medium uppercase tracking-widest ${
    light ? 'text-slate-400' : 'text-white/40'
  } ml-4`;

  const iconClasses = `absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
    light ? 'text-slate-300' : 'text-white/20'
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className={labelClasses}>Restaurant Name</label>
        <div className="relative">
          <Building2 className={iconClasses} />
          <input
            required
            type="text"
            placeholder="The Silver Fork"
            className={inputClasses}
            value={formData.restaurantName}
            onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className={labelClasses}>Contact Person</label>
        <div className="relative">
          <User className={iconClasses} />
          <input
            required
            type="text"
            placeholder="John Doe"
            className={inputClasses}
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelClasses}>Email</label>
          <div className="relative">
            <Mail className={iconClasses} />
            <input
              required
              type="email"
              placeholder="john@example.com"
              className={inputClasses}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className={labelClasses}>Phone</label>
          <div className="relative">
            <Phone className={iconClasses} />
            <input
              required
              type="tel"
              placeholder="+1 (555) 000-0000"
              className={inputClasses}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
      </div>
      {status === "error" && (
        <p className={`text-xs font-medium ${light ? 'text-red-500' : 'text-red-400'}`}>
          Something went wrong. Please try again.
        </p>
      )}
      <Button
        type="submit"
        disabled={status === "submitting" || status === "success"}
        className="w-full h-16 rounded-2xl bg-brand-orange hover:bg-amber-500 text-white font-medium text-sm uppercase tracking-widest mt-6 transition-all active:scale-95 disabled:opacity-50"
      >
        {status === "idle" && "Set up the service"}
        {status === "submitting" && "Submitting..."}
        {status === "success" && "Success! We'll be in touch."}
        {status === "error" && "Try again"}
      </Button>
    </form>
  );
}

export default function Home() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const [isGetStartedLoading, setIsGetStartedLoading] = useState(false);

  const [isTrialLoading, setIsTrialLoading] = useState(false);

  const handleTrialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTrialLoading(true);
    router.push("/get-started");
  };

  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGetStartedLoading(true);
    router.push("/get-started");
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDemoLoading(true);
    router.push("/book-demo");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-brand-orange/30 selection:text-brand-orange font-work-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none">
        <div className="flex h-12 md:h-14 items-center bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-[24px] shadow-2xl px-2 md:px-3 gap-1 md:gap-2 pointer-events-auto">
          <Link href="/" className="flex items-center pl-2 pr-3 md:pl-3 md:pr-4 group cursor-pointer shrink-0">
            <Image 
              src="/Source/media/5.png" 
              alt="HeadlessResto Logo" 
              width={120} 
              height={28} 
              className="h-5 md:h-6 w-auto object-contain brightness-0 invert" 
              priority
            />
          </Link>
          
          <div className="hidden md:flex items-center bg-white/5 rounded-[18px] p-1 gap-1">
            <Link href="#features" className="text-[10px] font-medium uppercase tracking-widest text-white/60 hover:text-white px-4 py-2 rounded-[14px] hover:bg-white/5 transition-all">Features</Link>
            <Link href="#operators" className="text-[10px] font-medium uppercase tracking-widest text-white/60 hover:text-white px-4 py-2 rounded-[14px] hover:bg-white/5 transition-all">For Operators</Link>
            <Link href="#pricing" className="text-[10px] font-medium uppercase tracking-widest text-white/60 hover:text-white px-4 py-2 rounded-[14px] hover:bg-white/5 transition-all">Pricing</Link>
          </div>

          <div className="flex items-center gap-1 ml-1">
            <Button 
              onClick={handleGetStartedClick}
              loading={isGetStartedLoading}
              className="h-9 md:h-10 px-4 md:px-5 rounded-[18px] bg-white text-black hover:bg-white/90 text-[10px] font-medium uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              Get started
            </Button>
            
            <button className="md:hidden text-white/60 hover:text-white transition-colors w-10 h-10 flex items-center justify-center bg-white/5 rounded-[18px]">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-32 pb-20 bg-black">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <HeroVideoCarousel />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="container relative z-10 px-6">
            <div className="flex flex-col items-center text-center max-w-[680px] mx-auto">
              <div className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.4em] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                ● Unified Restaurant OS
              </div>
              <h1 className="text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 mb-8">
                Less time doing management, more time with your guests
              </h1>
              <p className="text-white/60 text-base md:text-lg font-medium mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 max-w-lg mx-auto">
                The operating system for serious restaurants. Unified KDS, QR ordering, staff scheduling, and delivery in one platform.
              </p>
              <div className="flex flex-row items-center gap-3 sm:gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <Button 
                  onClick={handleTrialClick}
                  loading={isTrialLoading}
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium text-xs sm:text-sm uppercase tracking-tighter shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Start free trial
                </Button>
                <Button 
                  onClick={handleDemoClick}
                  loading={isDemoLoading}
                  variant="outline" 
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-white/5 border-white/10 text-white font-medium text-[10px] sm:text-xs uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
                >
                  Book a demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Every Tool Your Team Needs Section */}
        <section id="features" className="py-32 bg-[#050505] relative overflow-hidden">
          <div className="container px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.4em] mb-4">● Platform</div>
              <h2 className="mb-8 text-white">Every tool your team needs. One platform.</h2>
              <p className="text-white/40 text-base font-bold uppercase tracking-tight max-w-2xl mx-auto">From the kitchen screen to the cashier's till — everything talks to each other, in real time, even when the WiFi drops.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureItem 
                icon={<MonitorPlay className="h-6 w-6" />} 
                title="Kitchen Display (KDS)" 
                description="Real-time orders on any screen. Bump, hold, and flag items in one tap. Audio alerts on arrival. Dark mode built in for the heat of service." 
              />
              <FeatureItem 
                icon={<QrCode className="h-6 w-6" />} 
                title="QR Menu & Ordering" 
                description="Dine-in, takeaway, or delivery — all from one QR code. Customers order and pay themselves. No waiting. No miscommunication." 
              />
              <FeatureItem 
                icon={<Clock className="h-6 w-6" />} 
                title="Staff Management" 
                description="Build weekly schedules, detect shift conflicts, and generate payslips automatically. Your admin workload drops to near zero." 
              />
              <FeatureItem 
                icon={<Calculator className="h-6 w-6" />} 
                title="Cashier POS" 
                description="A full point of sale — card, cash, split bills. Works offline and syncs the moment you're back online. No lost orders. Ever." 
              />
              <FeatureItem 
                icon={<Zap className="h-6 w-6" />} 
                title="Uber Direct Delivery" 
                description="Dispatch a rider in two taps. Live tracking sent to the customer automatically. No third-party tablet cluttering your counter." 
              />
              <FeatureItem 
                icon={<LayoutDashboard className="h-6 w-6" />} 
                title="Multi-Location" 
                description="One brand, multiple branches. Each location has its own team, menu, and KDS — with central reporting across all of them." 
              />
            </div>
          </div>
        </section>

        {/* 2. Core Modules Section */}
        <section id="modules" className="py-32 bg-slate-50 relative overflow-hidden border-t border-black/[0.05]">
          <div className="container px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.4em] mb-4">● Modules</div>
                <h2 className="mb-12 text-slate-900">A reliable platform for growth.</h2>
                <div className="p-8 rounded-[32px] bg-black/[0.02] border border-black/[0.05] mb-10">
                  <p className="text-slate-500 font-medium leading-relaxed uppercase tracking-tight text-xs">Implement the service for easy and convenient management of your establishment. The interface and functionality are intuitive — every employee from the waiter to the accountant will master HeadlessResto without lengthy training.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ModuleCardV2 light icon={<CreditCard className="h-6 w-6" />} title="Bills" description="Automatic generation and critical operations management." />
                  <ModuleCardV2 light icon={<BarChart3 className="h-6 w-6" />} title="Profit report" description="Real-time revenue and expense calculation." />
                </div>
              </div>
              <div className="relative">
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ModuleCardV2 light icon={<UtensilsCrossed className="h-6 w-6" />} title="Inventory" description="Real-time stock level updates and automated deductions." className="sm:mt-12" />
                  <ModuleCardV2 light icon={<Calculator className="h-6 w-6" />} title="Cash management" description="Record all operations and track cash flow across terminals." />
                  <ModuleCardV2 light icon={<User className="h-6 w-6" />} title="Staff" description="Log employee actions and manage critical operations access." className="sm:-mt-12" />
                  <div className="p-8 rounded-[32px] bg-brand-orange flex items-center justify-center group cursor-pointer hover:bg-amber-500 transition-all min-h-[160px]">
                    <div className="text-center">
                      <div className="text-white/40 text-[10px] font-medium uppercase tracking-widest mb-2">Explore All</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-white font-medium uppercase tracking-tighter text-xl">Full Platform</span>
                        <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-orange/5 rounded-full blur-[120px] -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Built for Everyone in the Building (Existing Roles) */}
        <section id="operators" className="py-32 bg-white relative overflow-hidden border-t border-black/[0.05]">
          <div className="container px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
              <div className="max-w-2xl">
                <div className="text-brand-orange text-[11px] font-medium uppercase tracking-[0.4em] mb-4">● Roles</div>
                <h2 className="mb-8 text-slate-900">Built for everyone in the building.</h2>
              </div>
              <p className="text-slate-500 text-lg font-bold max-w-sm uppercase tracking-tight">Each role gets an interface built around their job — not a watered-down version of the admin panel.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <RoleCard
                light
                icon={<User className="h-12 w-12" />}
                title="Admin / Owner"
                description="See everything. Control everything. Manage your menu, staff, payroll, and Stripe payouts from one dashboard — across every location you run."
              />
              <RoleCard
                light
                icon={<ChefHat className="h-12 w-12" />}
                title="Kitchen Staff"
                description="A big screen built to be read from across the pass. New order alerts, one-tap bump buttons, and nothing cluttering the view during a busy service."
              />
              <RoleCard
                light
                icon={<Utensils className="h-12 w-12" />}
                title="Waiter"
                description="Take orders at the table from any device. Orders go straight to the kitchen. No paper, no shouting, no re-keying the same order twice."
              />
              <RoleCard
                light
                icon={<CreditCard className="h-12 w-12" />}
                title="Cashier"
                description="A fast, no-fuss POS with card, cash, Apple Pay, and split bills. Unsynced offline orders queue automatically and send when you're back online."
              />
            </div>
          </div>
        </section>

        {/* 4. Pricing Section (Existing) */}
        <section id="pricing" className="py-32 bg-slate-50 relative overflow-hidden border-t border-black/[0.05]">
          <div className="container px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
              <div className="max-w-2xl">
                <div className="text-brand-orange text-[11px] font-medium uppercase tracking-[0.4em] mb-4">● Pricing</div>
                <h2 className="mb-8 text-slate-900">Simple pricing. No hidden fees.</h2>
              </div>
              <p className="text-slate-500 text-lg font-bold max-w-sm uppercase tracking-tight">One flat monthly fee per location. No per-order commissions. No surprise charges at the end of the month.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard
                light
                title="Starter"
                price="$79"
                description="Everything you need to get your first location running properly. KDS, QR menu, POS, and Stripe payments included."
                features={["KDS + POS + QR Menu", "Up to 5 staff members", "Stripe payments", "Basic reports"]}
                ctaText="Start free trial"
                featured={false}
                href="/get-started?plan=starter"
              />
              <PricingCard
                light
                title="Operator"
                price="$149"
                description="For teams that need more. Unlimited staff, Uber Direct delivery, automatic payslips, and full offline support."
                features={["Everything in Starter", "Unlimited staff", "Uber Direct delivery", "Payslip generation", "Full offline support"]}
                ctaText="Start free trial"
                featured={true}
                href="/get-started?plan=operator"
              />
              <PricingCard
                light
                title="Enterprise"
                price="Custom"
                description="For multi-location groups and franchises. Custom integrations, priority support, and volume discounts."
                features={["Multiple locations", "Custom integrations", "Dedicated manager", "Franchise reporting", "SLA guarantees"]}
                ctaText="Talk to sales"
                featured={false}
                href="/contact"
              />
            </div>
            <p className="text-slate-400 text-center text-sm font-bold uppercase tracking-tight mt-16">Free for 30 days. No credit card required.</p>
          </div>
        </section>

        {/* 5. Final Contact/Waitlist Section */}
        <section id="contact" className="py-32 bg-white relative overflow-hidden border-t border-black/[0.05]">
          <div className="container px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="max-w-2xl">
                  <div className="text-brand-orange text-[11px] font-medium uppercase tracking-[0.4em] mb-4">● Support</div>
                <h2 className="mb-8 text-slate-900">
                   Create the best experience for guests
                </h2>
                <p className="text-slate-500 text-xl font-medium max-w-md mb-12 uppercase tracking-tight">
                  QR menu, chat with the waiter, and instant orders in one system. Set up your restaurant in minutes.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                      <Check className="h-6 w-6" />
                    </div>
                    <p className="text-slate-600 font-bold uppercase tracking-tight text-sm">30-day free trial</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                      <Check className="h-6 w-6" />
                    </div>
                    <p className="text-slate-600 font-bold uppercase tracking-tight text-sm">No credit card required</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-10 rounded-[40px] border border-black/[0.05] shadow-2xl shadow-black/5">
                <RestaurantInterestForm light />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Redesign */}
      <footer className="bg-white py-24 border-t border-black/[0.05] text-slate-900">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6 max-w-sm">
              <div className="flex items-center gap-3">
                <Image 
                  src="/Source/media/5.png" 
                  alt="HeadlessResto Logo" 
                  width={140} 
                  height={40} 
                  className="h-10 w-auto object-contain brightness-0" 
                />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-tight leading-relaxed text-sm">
                Run a tighter operation. More time with your guests.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-24">
              <div className="space-y-6">
                <h4 className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.3em]">Platform</h4>
                <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                  <Link href="/#features" className="hover:text-slate-900 transition-colors">Features</Link>
                  <Link href="/#operators" className="hover:text-slate-900 transition-colors">Operators</Link>
                  <Link href="/#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
                  <Link href="/demo" className="hover:text-slate-900 transition-colors">Live Demo</Link>
                  <Link href="/book-demo" className="hover:text-slate-900 transition-colors">Book a Demo</Link>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.3em]">Company</h4>
                <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-slate-700">
                  <Link href="/about" className="hover:text-black transition-colors">About</Link>
                  <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.3em]">Legal</h4>
                <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-slate-700">
                  <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-300">
              © {new Date().getFullYear()} HeadlessResto Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-10">
              <Link href="#" className="text-slate-300 hover:text-slate-900 transition-colors"><Zap className="h-5 w-5" /></Link>
              <Link href="#" className="text-slate-300 hover:text-slate-900 transition-colors"><ShieldCheck className="h-5 w-5" /></Link>
              <Link href="#" className="text-slate-300 hover:text-slate-900 transition-colors"><BarChart3 className="h-5 w-5" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ icon, title, description, light = false }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  light?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center text-center p-8 rounded-3xl border transition-all duration-500 group ${
      light 
        ? 'bg-black/[0.02] border-black/[0.05] hover:bg-black/[0.04]' 
        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
    }`}>
      <div className="mb-6 text-brand-orange group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h4 className={`text-2xl font-medium mb-2 uppercase tracking-tighter transition-colors ${
        light ? 'text-slate-900 group-hover:text-brand-orange' : 'text-white group-hover:text-amber-500'
      }`}>{title}</h4>
      <p className={`font-bold text-sm leading-relaxed uppercase tracking-tight ${
        light ? 'text-slate-500' : 'text-white/30'
      }`}>{description}</p>
    </div>
  );
}

function PricingCard({ title, price, description, features, ctaText, featured, href, light = false }: {
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  featured: boolean;
  href: string;
  light?: boolean;
}) {
  return (
    <div className={`flex flex-col p-8 rounded-3xl border transition-all duration-500 group ${
      featured 
        ? 'border-brand-orange ' + (light ? 'bg-brand-orange/[0.02]' : 'bg-white/[0.05]')
        : (light ? 'border-black/[0.05] bg-black/[0.02] hover:bg-black/[0.04]' : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]')
    }`}>
      {featured && (
        <div className="text-brand-orange text-[11px] font-medium uppercase tracking-[0.4em] mb-4">Most popular</div>
      )}
      <h4 className={`text-3xl font-medium mb-2 uppercase tracking-tighter ${
        light ? 'text-slate-900' : 'text-white'
      }`}>{title}</h4>
      <p className={`font-bold text-sm leading-relaxed uppercase tracking-tight mb-6 ${
        light ? 'text-slate-500' : 'text-white/30'
      }`}>{description}</p>
      <div className={`text-5xl font-medium uppercase tracking-tighter mb-8 ${
        light ? 'text-slate-900' : 'text-white'
      }`}>{price} <span className={light ? 'text-slate-400 text-lg' : 'text-white/30 text-lg'}>/ mo per location</span></div>
      <ul className="flex flex-col gap-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className={`flex items-center font-bold text-sm uppercase tracking-tight ${
            light ? 'text-slate-600' : 'text-white/70'
          }`}>
            <Check className="h-4 w-4 mr-2 text-brand-orange" /> {feature}
          </li>
        ))}
      </ul>
      <Link 
        href={href}
        className={`mt-auto w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm text-center transition-colors ${
          featured 
            ? 'bg-brand-orange hover:bg-amber-500 text-white' 
            : (light ? 'bg-black/[0.05] hover:bg-black/[0.1] text-slate-900' : 'bg-white/[0.05] hover:bg-white/[0.1] text-white')
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-8 group">
      <div className="mt-1 bg-amber-500/10 p-4 rounded-2xl text-amber-500 h-fit group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-medium mb-2 uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors">{title}</h4>
        <p className="text-white/30 font-bold text-sm leading-relaxed uppercase tracking-tight">{description}</p>
      </div>
    </div>
  );
}

