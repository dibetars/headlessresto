'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, User, Mail, Phone, MapPin, MessageSquare, Check, ArrowLeft, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitLeadAction } from '@/app/auth/actions'

export default function ContactPage() {
  const [form, setForm] = useState({
    restaurantName: '',
    contactPerson: '',
    email: '',
    phone: '',
    numLocations: '',
    currentSystem: '',
    integrationNeeds: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    const result = await submitLeadAction({ ...form, planInterest: 'enterprise', source: 'contact' })
    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMsg(result.error || 'Something went wrong.')
    }
  }

  const input = 'w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all'

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-3">Message received.</h2>
          <p className="text-gray-500 text-sm mb-8">An account manager will reach out within one business day to discuss your requirements.</p>
          <Link href="/" className="text-brand-orange font-semibold text-sm hover:underline">← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl relative">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2">
          <Image src="/Source/media/5.png" alt="HeadlessResto" width={120} height={28} className="h-6 w-auto brightness-0" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="w-full max-w-lg">
          <div className="mb-10">
            <div className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.4em] mb-3">● Enterprise</div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">Talk to sales</h1>
            <p className="text-gray-500 text-sm">Multi-location groups, franchise operators, and custom integration requirements. Tell us what you need and we'll put together a tailored proposal.</p>
          </div>

          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Company *</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input required type="text" placeholder="Acme Restaurants" value={form.restaurantName} onChange={set('restaurantName')} className={input} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input required type="text" placeholder="John Doe" value={form.contactPerson} onChange={set('contactPerson')} className={input} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input required type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} className={input} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} className={input} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Locations *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                    <select required value={form.numLocations} onChange={set('numLocations')}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all appearance-none">
                      <option value="">Select…</option>
                      <option value="6-20">6–20 locations</option>
                      <option value="21-50">21–50 locations</option>
                      <option value="50+">50+ locations</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current system</label>
                  <div className="relative">
                    <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="text" placeholder="Toast, Square, etc." value={form.currentSystem} onChange={set('currentSystem')} className={input} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Integration requirements</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                  <textarea
                    rows={2}
                    placeholder="ERP, accounting, delivery platforms…"
                    value={form.integrationNeeds}
                    onChange={set('integrationNeeds')}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Anything else</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                  <textarea
                    rows={2}
                    placeholder="Timeline, specific requirements, questions…"
                    value={form.message}
                    onChange={set('message')}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all resize-none"
                  />
                </div>
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errorMsg}</p>
              )}

              <Button type="submit" disabled={status === 'submitting'}
                className="w-full h-12 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold uppercase tracking-widest text-xs mt-2 shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none">
                {status === 'submitting' ? 'Sending…' : 'Talk to sales →'}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Smaller team?{' '}
            <Link href="/get-started" className="text-brand-orange hover:underline font-medium">Request access directly →</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
