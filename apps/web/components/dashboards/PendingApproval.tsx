'use client'

import React from 'react'
import { Clock, ShieldCheck, Mail, UtensilsCrossed, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PendingApproval({ userName, restaurantName }: { userName: string, restaurantName: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-brand-orange/10 p-12 text-center space-y-8 border border-slate-100">
        <div className="w-20 h-20 bg-brand-orange rounded-[24px] flex items-center justify-center shadow-xl shadow-brand-orange/20 mx-auto">
          <UtensilsCrossed className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Almost There!</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Welcome, <span className="text-brand-orange font-bold">{userName}</span>! 
            Your registration for <span className="text-slate-900 font-bold">{restaurantName}</span> is currently being reviewed by our Super Admin.
          </p>
        </div>

        <div className="bg-brand-orange/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center space-x-4 text-left">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Clock className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Pending Review</div>
              <div className="text-xs text-slate-500 font-medium">Estimated time: 12-24 hours</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-left">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Mail className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Email Notification</div>
              <div className="text-xs text-slate-500 font-medium">We'll email you once approved</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Enterprise Platform</span>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
