import Link from 'next/link';
import {
  ChefHat,
  Zap,
  BarChart3,
  Truck,
  QrCode,
  Users,
  ShieldCheck,
  ArrowRight,
  Star,
  CheckCircle2,
  Globe,
  Clock,
  CreditCard,
  Smartphone,
} from 'lucide-react';

/* Brand colors extracted from logo */
const navy = '#1D3F7A';
const orange = '#E8782A';

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F8FAFC', color: '#0F172A' }}>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-xl"
        style={{ background: 'rgba(248,250,252,0.85)', borderBottom: '1px solid #E2E8F0' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="HeadlessResto" style={{ height: 40, width: 'auto' }} />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: '#475569' }}>
            <a href="#features" className="hover:text-[#1D3F7A] transition-colors">Features</a>
            <a href="#how" className="hover:text-[#1D3F7A] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[#1D3F7A] transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-[#1D3F7A] transition-colors">Customers</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-slate-100"
              style={{ color: '#475569' }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: orange }}
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${navy}, transparent)` }}
          />
          <div
            className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${orange}, transparent)` }}
          />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-1.5 mb-6"
            style={{ color: orange, background: '#FFF4EC', border: `1px solid #FDDCC4` }}
          >
            <Zap className="w-3 h-3" />
            The complete restaurant operating system
          </div>

          <h1
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
            style={{ color: '#0F172A' }}
          >
            Run your restaurant<br />
            <span style={{ color: navy }}>like a tech company</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#64748B' }}>
            Orders, kitchen, deliveries, payroll, inventory — one platform built for
            independent restaurants that refuse to be average.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-base transition-opacity hover:opacity-90"
              style={{ backgroundColor: orange }}
            >
              Start your free 30-day trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/menu/demo"
              className="inline-flex items-center gap-2 font-medium px-8 py-4 rounded-xl text-base transition-all hover:bg-slate-100"
              style={{ color: navy, border: `1.5px solid #CBD5E1` }}
            >
              <QrCode className="w-4 h-4" />
              See live menu demo
            </Link>
          </div>

          <p className="mt-5 text-sm" style={{ color: '#94A3B8' }}>
            No credit card required · Cancel anytime · Setup in 15 minutes
          </p>
        </div>

        {/* ── Dashboard preview mock ── */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 20px 60px rgba(29,63,122,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {/* Browser chrome */}
            <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#FDA4AF' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#FCD34D' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#86EFAC' }} />
              </div>
              <div className="flex-1 h-5 rounded-md max-w-xs mx-auto" style={{ background: '#E2E8F0' }} />
            </div>

            {/* Stats row */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Revenue today', value: '$4,821', trend: '↑ 12% vs yesterday', up: true },
                { label: 'Orders', value: '143', trend: '↑ 8% vs yesterday', up: true },
                { label: 'Avg ticket', value: '$33.70', trend: '↓ 3% vs yesterday', up: false },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4" style={{ border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>{stat.label}</p>
                  <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{stat.value}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: stat.up ? '#10B981' : '#F43F5E' }}>{stat.trend}</p>
                </div>
              ))}
            </div>

            {/* Orders + KDS */}
            <div className="px-6 pb-6 grid grid-cols-12 gap-4">
              <div className="col-span-7 rounded-xl p-4" style={{ border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <p className="text-xs font-semibold mb-3 tracking-widest" style={{ color: '#94A3B8' }}>LIVE ORDERS</p>
                <div className="space-y-2">
                  {[
                    { table: 'Table 4', items: 'Burger, Fries, Coke', status: 'Cooking', color: orange },
                    { table: 'Table 7', items: 'Pasta, Salad', status: 'Ready', color: '#10B981' },
                    { table: 'Delivery #88', items: 'Pizza x2, Wings', status: 'En route', color: '#3B82F6' },
                    { table: 'Table 2', items: 'Steak, Wine', status: 'New', color: '#8B5CF6' },
                  ].map((order) => (
                    <div key={order.table} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{order.table}</p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>{order.items}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: order.color, background: `${order.color}18` }}>{order.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-5 rounded-xl p-4" style={{ border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <p className="text-xs font-semibold mb-3 tracking-widest" style={{ color: '#94A3B8' }}>KITCHEN DISPLAY</p>
                <div className="space-y-2">
                  {[
                    { ticket: '#1042', items: 'Burger, Fries', mins: '4m' },
                    { ticket: '#1043', items: 'Pasta x2', mins: '7m' },
                    { ticket: '#1044', items: 'Steak MR', mins: '12m' },
                  ].map((t) => (
                    <div key={t.ticket} className="rounded-lg p-2.5" style={{ background: '#FFF4EC', border: `1px solid #FDDCC4` }}>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold" style={{ color: navy }}>{t.ticket}</span>
                        <span className="text-xs font-semibold" style={{ color: orange }}>{t.mins}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{t.items}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-12" style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: '#CBD5E1' }}>
            Trusted by independent restaurants across 40+ cities
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {['The Rustic Spoon', 'Urban Bites', 'Mango Street', 'Noodle Republic', 'Fire & Salt', 'The Grove'].map((name) => (
              <span key={name} className="text-sm font-bold tracking-tight" style={{ color: '#CBD5E1' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6" style={{ background: '#F8FAFC' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: orange }}>Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: '#0F172A' }}>
              One platform. Zero compromises.
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#64748B' }}>
              Stop duct-taping six different apps together. HeadlessResto is everything your restaurant needs in one system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <ChefHat className="w-5 h-5" />, title: 'Kitchen Display System', desc: 'Real-time ticket routing to each station. No paper, no shouting. Smart priority queuing so nothing gets cold.', bg: '#FFF4EC', iconColor: orange },
              { icon: <QrCode className="w-5 h-5" />, title: 'QR & Digital Menu', desc: 'Beautiful mobile menu at your-restaurant.com/menu. Live updates — 86 an item in seconds, everywhere instantly.', bg: '#EEF2FF', iconColor: '#6366F1' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Real-time Analytics', desc: "Revenue, covers, avg ticket, top items — all live. Know what's working before service ends.", bg: '#EFF6FF', iconColor: '#3B82F6' },
              { icon: <Truck className="w-5 h-5" />, title: 'Delivery Management', desc: 'Built-in dispatch with Uber Direct integration. Track every order from kitchen to door with live GPS.', bg: '#ECFDF5', iconColor: '#10B981' },
              { icon: <Users className="w-5 h-5" />, title: 'Staff & Scheduling', desc: 'Schedules, GPS clock-in, attendance, and automated payroll summaries. HR done in minutes, not hours.', bg: '#FDF2F8', iconColor: '#EC4899' },
              { icon: <ShieldCheck className="w-5 h-5" />, title: 'Inventory Control', desc: 'Append-only ledger tracks every stock movement. Low-stock alerts before you run out mid-service.', bg: '#FFFBEB', iconColor: '#F59E0B' },
              { icon: <CreditCard className="w-5 h-5" />, title: 'Integrated Payments', desc: 'Stripe Connect splits revenue automatically. Accept cards, mobile pay, and digital wallets at every touchpoint.', bg: '#EEF2FF', iconColor: '#4F46E5' },
              { icon: <Smartphone className="w-5 h-5" />, title: 'Offline-first Mobile', desc: 'Take orders even when the WiFi dies. PowerSync keeps your POS running and syncs everything when reconnected.', bg: '#ECFDF5', iconColor: '#059669' },
              { icon: <Globe className="w-5 h-5" />, title: 'Multi-location Ready', desc: 'One account, unlimited locations. Different menus, staff, and reporting — all under one dashboard.', bg: '#EFF6FF', iconColor: navy },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl p-6 bg-white transition-all duration-300 hover:-translate-y-0.5"
                style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: feature.bg, color: feature.iconColor }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#0F172A' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6 bg-white" style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: orange }}>Simple by design</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: '#0F172A' }}>
              Up and running in 15 minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up, add your restaurant details, and upload your menu. No training required.' },
              { step: '02', title: 'Configure your setup', desc: 'Set kitchen stations, tables, staff roles, and delivery zones. Everything adapts to your workflow.' },
              { step: '03', title: 'Go live', desc: 'Print your QR codes, brief your team, open your doors. Your entire operation runs from one screen.' },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px -translate-x-8" style={{ background: 'linear-gradient(to right, #E2E8F0, transparent)' }} />
                )}
                <div
                  className="text-5xl font-black mb-4 select-none"
                  style={{ color: '#F1F5F9' }}
                >
                  {step.step}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: orange }} />
                  <h3 className="font-bold" style={{ color: '#0F172A' }}>{step.title}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6" style={{ background: '#F8FAFC' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: orange }}>Real results</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: '#0F172A' }}>
              Operators who switched never look back
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { quote: "We cut our ticket time from 22 minutes to 11 minutes in the first week. The kitchen display alone paid for the whole year.", name: 'Maria Chen', role: 'Owner, Noodle Republic', stars: 5 },
              { quote: "Managing three locations used to require three different systems and a prayer. Now it's one dashboard. I actually sleep at night.", name: 'James Okafor', role: 'GM, Urban Bites (3 locations)', stars: 5 },
              { quote: "Our delivery ratings went from 3.8 to 4.7 after switching. Real-time tracking means customers stop calling to ask where their food is.", name: 'Sofia Reyes', role: 'Ops Director, Mango Street', stars: 5 },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6"
                style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4" style={{ color: orange, fill: orange }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#475569' }}>"{t.quote}"</p>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 bg-white" style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: orange }}>Simple pricing</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ color: '#0F172A' }}>No hidden fees. No surprises.</h2>
            <p className="text-lg" style={{ color: '#64748B' }}>All plans include unlimited orders, POS, KDS, and QR menus.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {[
              {
                name: 'Starter', price: '$89', period: '/mo',
                desc: 'Perfect for a single-location café or quick service.',
                features: ['1 location', 'Up to 10 staff', 'POS + KDS + QR Menu', 'Basic analytics', 'Email support'],
                cta: 'Start free trial', highlight: false,
              },
              {
                name: 'Growth', price: '$199', period: '/mo',
                desc: 'For full-service restaurants that want every feature.',
                features: ['3 locations', 'Unlimited staff', 'Everything in Starter', 'Delivery dispatch', 'Payroll summaries', 'Inventory tracking', 'Priority support'],
                cta: 'Start free trial', highlight: true, badge: 'Most popular',
              },
              {
                name: 'Scale', price: '$449', period: '/mo',
                desc: 'Multi-location groups and franchise operations.',
                features: ['Unlimited locations', 'Unlimited staff', 'Everything in Growth', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee'],
                cta: 'Talk to sales', highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-7"
                style={plan.highlight
                  ? { background: navy, border: `2px solid ${navy}`, boxShadow: `0 12px 40px rgba(29,63,122,0.25)` }
                  : { background: '#FFFFFF', border: '1.5px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
                }
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: orange }}
                  >
                    {plan.badge}
                  </div>
                )}
                <p className="text-sm font-semibold mb-1" style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#64748B' }}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black" style={{ color: plan.highlight ? '#FFFFFF' : '#0F172A' }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#94A3B8' }}>{plan.period}</span>
                </div>
                <p className="text-sm mb-6" style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#64748B' }}>{plan.desc}</p>
                <Link
                  href="/register"
                  className="block text-center text-sm font-bold py-3 rounded-xl mb-6 transition-all hover:opacity-90"
                  style={plan.highlight
                    ? { background: orange, color: '#FFFFFF' }
                    : { background: '#F1F5F9', color: navy, border: `1px solid #E2E8F0` }
                  }
                >
                  {plan.cta}
                </Link>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: plan.highlight ? orange : '#CBD5E1' }}
                      />
                      <span style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#475569' }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6" style={{ background: '#F8FAFC' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '2,400+', label: 'Restaurants powered' },
            { value: '$180M+', label: 'Orders processed' },
            { value: '40+', label: 'Cities live' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black mb-1" style={{ color: navy }}>{s.value}</p>
              <p className="text-sm" style={{ color: '#64748B' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-white" style={{ borderTop: '1px solid #E2E8F0' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-3xl p-12"
            style={{ background: `linear-gradient(135deg, ${navy} 0%, #2D5BA0 100%)`, boxShadow: `0 20px 60px rgba(29,63,122,0.3)` }}
          >
            <Clock className="w-10 h-10 mx-auto mb-6" style={{ color: orange }} />
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">
              Ready to take control of your restaurant?
            </h2>
            <p className="mb-8 text-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Join 2,400+ restaurants who've stopped fighting their software and started growing their business.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 font-bold px-10 py-4 rounded-xl text-base text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: orange }}
            >
              Start your 30-day free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No credit card required. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="HeadlessResto" style={{ height: 34, width: 'auto' }} />
          <div className="flex gap-8 text-sm">
            {['Privacy', 'Terms', 'Status', 'Docs'].map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-[#1D3F7A]" style={{ color: '#94A3B8' }}>{l}</a>
            ))}
          </div>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>© 2026 HeadlessResto. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
