'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Building2, User, Mail, Phone, MapPin, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitLeadAction } from '@/app/auth/actions'

function GetStartedForm() {
  const searchParams = useSearchParams()
  const defaultPlan = searchParams.get('plan') || ''

  const [form, setForm] = useState({
    restaurantName: '',
    contactPerson: '',
    email: '',
    phone: '',
    numLocations: '1',
    planInterest: defaultPlan,
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    const result = await submitLeadAction({ ...form, source: 'get-started' })
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
          <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-3">We'll be in touch.</h2>
          <p className="text-gray-500 text-sm mb-8">Our team reviews every submission within one business day and will reach out to get you set up.</p>
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
            <div className="text-brand-orange text-[10px] font-medium uppercase tracking-[0.4em] mb-3">● Get started</div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">Request access</h1>
            <p className="text-gray-500 text-sm">Tell us about your restaurant and our team will reach out within one business day to get everything set up.</p>
          </div>

          <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Restaurant Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input required type="text" placeholder="The Silver Fork" value={form.restaurantName} onChange={set('restaurantName')} className={input} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input required type="text" placeholder="John Doe" value={form.contactPerson} onChange={set('contactPerson')} className={input} />
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input required type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} className={input} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Locations</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                    <select value={form.numLocations} onChange={set('numLocations')}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all appearance-none">
                      <option value="1">1 location</option>
                      <option value="2-5">2–5 locations</option>
                      <option value="6-20">6–20 locations</option>
                      <option value="20+">20+ locations</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Plan interest</label>
                  <select value={form.planInterest} onChange={set('planInterest')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all">
                    <option value="">Not sure yet</option>
                    <option value="starter">Starter — $79/mo</option>
                    <option value="operator">Operator — $149/mo</option>
                    <option value="enterprise">Enterprise — Custom</option>
                  </select>
                </div>
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errorMsg}</p>
              )}

              <Button type="submit" disabled={status === 'submitting'}
                className="w-full h-12 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold uppercase tracking-widest text-xs mt-2 shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none">
                {status === 'submitting' ? 'Submitting…' : 'Request access →'}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-orange hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function GetStartedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream" />}>
      <GetStartedForm />
    </Suspense>
  )
}
